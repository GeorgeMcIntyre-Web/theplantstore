"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

interface Setting {
  key: string;
  value: string;
  category: string;
  description?: string;
  updatedAt: string;
}

const CATEGORIES = [
  "inventory",
  "accounting",
  "shipping",
  "notifications",
  "general",
];

function SettingsTable({ settings, loading, onEdit, onDelete }: {
  settings: Setting[];
  loading: boolean;
  onEdit: (setting: Setting) => void;
  onDelete: (key: string) => void;
}) {
  if (loading) return <div role="status" aria-live="polite">Loading...</div>;
  if (!settings.length) return <div className="text-muted-foreground">No settings found for this category.</div>;
  return (
    <table className="w-full text-sm mb-4">
      <thead>
        <tr>
          <th className="text-left">Key</th>
          <th className="text-left">Value</th>
          <th className="text-left">Description</th>
          <th className="text-left">Updated</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {settings.map((setting) => (
          <tr key={setting.key} className="border-b last:border-0">
            <td>{setting.key}</td>
            <td>{setting.value}</td>
            <td>{setting.description}</td>
            <td>{new Date(setting.updatedAt).toLocaleString()}</td>
            <td>
              <Button size="sm" variant="outline" onClick={() => onEdit(setting)} className="mr-2">Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(setting.key)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SettingsForm({ form, onChange, onSubmit, editingKey, onCancel, error, loading, autoFocusKey, autoFocusValue }: {
  form: { key: string; value: string; category: string; description: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  editingKey: string | null;
  onCancel: () => void;
  error: string;
  loading: boolean;
  autoFocusKey: boolean;
  autoFocusValue: boolean;
}) {
  const errorRef = useRef<HTMLDivElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);
  // Focus error message if present
  useEffect(() => { if (error && errorRef.current) errorRef.current.focus(); }, [error]);
  useEffect(() => {
    if (autoFocusKey && keyInputRef.current) keyInputRef.current.focus();
    if (autoFocusValue && valueInputRef.current) valueInputRef.current.focus();
  }, [autoFocusKey, autoFocusValue, editingKey]);
  return (
    <form onSubmit={onSubmit} className="space-y-3 bg-muted p-4 rounded-lg" aria-label="Settings form">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="key">Key</Label>
          <Input
            id="key"
            name="key"
            value={form.key}
            onChange={onChange}
            disabled={!!editingKey}
            required
            aria-required="true"
            ref={keyInputRef}
            autoFocus={autoFocusKey}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            name="value"
            value={form.value}
            onChange={onChange}
            required
            aria-required="true"
            ref={valueInputRef}
            autoFocus={autoFocusValue}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          value={form.description}
          onChange={onChange}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading} aria-busy={loading}>
          {editingKey ? "Update" : "Add"} Setting
        </Button>
        {editingKey && (
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      {error && (
        <Alert variant="destructive" tabIndex={-1} ref={errorRef} aria-live="assertive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const [settings, setSettings] = useState<Setting[]>([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ key: "", value: "", category: "inventory", description: "" });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line
  }, [retryCount]);

  async function fetchSettings() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        if (res.status === 403) throw new Error("You are not authorized to view settings.");
        throw new Error("Failed to fetch settings");
      }
      const data = await res.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message || "Could not load settings.");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(setting: Setting) {
    setEditingKey(setting.key);
    setForm({
      key: setting.key,
      value: setting.value,
      category: setting.category,
      description: setting.description || "",
    });
  }

  function cancelEdit() {
    setEditingKey(null);
    setForm({ key: "", value: "", category: activeTab, description: "" });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.key || !form.value || !form.category) {
      setError("Key, value, and category are required.");
      return;
    }
    try {
      const method = editingKey ? "PUT" : "POST";
      const res = await fetch("/api/admin/settings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save setting");
      }
      toast({ title: "Setting saved" });
      await fetchSettings();
      cancelEdit();
    } catch (err: any) {
      setError(err.message || "Failed to save setting.");
    }
  }

  async function handleDelete(key: string) {
    if (!window.confirm("Are you sure you want to delete this setting?")) return;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete setting");
      }
      toast({ title: "Setting deleted" });
      await fetchSettings();
    } catch (err: any) {
      setError(err.message || "Failed to delete setting.");
    }
  }

  const categorized = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = settings.filter((s: Setting) => s.category === cat);
    return acc;
  }, {} as Record<string, Setting[]>);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
            {CATEGORIES.map((cat) => (
              <TabsContent key={cat} value={cat}>
                <div className="mb-6">
                  <h3 className="font-semibold mb-2" id={`settings-${cat}`}>{cat.charAt(0).toUpperCase() + cat.slice(1)} Settings</h3>
                  <SettingsTable
                    settings={categorized[cat] || []}
                    loading={loading}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                  {/* Onboarding tip for empty state */}
                  {!loading && (categorized[cat] || []).length === 0 && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-4 mt-4">
                      <div className="font-semibold mb-1">Welcome to Settings!</div>
                      <div className="text-sm">
                        {userRole === 'SUPER_ADMIN' && (
                          <>As a <b>Super Admin</b>, you can configure global settings for inventory, accounting, shipping, and more. Use the form below to add your first setting. <br />Need help? See the admin guide or contact support.</>
                        )}
                        {userRole === 'FINANCIAL_MANAGER' && (
                          <>As a <b>Financial Manager</b>, you can manage accounting and notification settings. Use the form below to add your first setting. <br />Need help? See the admin guide or contact support.</>
                        )}
                        {!userRole && (
                          <>Use the form below to add your first setting. <br />Need help? See the admin guide or contact support.</>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <SettingsForm
                  form={{ ...form, category: cat }}
                  onChange={handleInputChange}
                  onSubmit={handleSave}
                  editingKey={editingKey}
                  onCancel={cancelEdit}
                  error={error}
                  loading={loading}
                  autoFocusKey={!editingKey}
                  autoFocusValue={!!editingKey}
                />
                {error && (
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={() => setRetryCount((c) => c + 1)}>
                      Retry
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 