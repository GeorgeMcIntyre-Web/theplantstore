"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

const CATEGORIES = [
  "inventory",
  "accounting",
  "shipping",
  "notifications",
  "general",
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ key: "", value: "", category: "inventory", description: "" });
  const [editingKey, setEditingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      setError("Could not load settings.");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(setting: any) {
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
    acc[cat] = settings.filter((s: any) => s.category === cat);
    return acc;
  }, {} as Record<string, any[]>);

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
                  <h3 className="font-semibold mb-2">{cat.charAt(0).toUpperCase() + cat.slice(1)} Settings</h3>
                  {loading ? (
                    <div>Loading...</div>
                  ) : (
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
                        {categorized[cat]?.map((setting: any) => (
                          <tr key={setting.key} className="border-b last:border-0">
                            <td>{setting.key}</td>
                            <td>{setting.value}</td>
                            <td>{setting.description}</td>
                            <td>{new Date(setting.updatedAt).toLocaleString()}</td>
                            <td>
                              <Button size="sm" variant="outline" onClick={() => startEdit(setting)} className="mr-2">Edit</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(setting.key)}>Delete</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <form onSubmit={handleSave} className="space-y-3 bg-muted p-4 rounded-lg">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="key">Key</Label>
                      <Input
                        id="key"
                        name="key"
                        value={form.key}
                        onChange={handleInputChange}
                        disabled={!!editingKey}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="value">Value</Label>
                      <Input
                        id="value"
                        name="value"
                        value={form.value}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      {editingKey ? "Update" : "Add"} Setting
                    </Button>
                    {editingKey && (
                      <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    )}
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </form>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 