"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNotifications, Notification } from "@/hooks/use-notifications";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const NOTIF_TYPES = [
  { value: "all", label: "All" },
  { value: "order", label: "Order" },
  { value: "po-draft", label: "PO Draft" },
  { value: "po-approved", label: "PO Approved" },
  { value: "low-stock", label: "Low Stock" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const TYPE_OPTIONS = [
  { value: "task", label: "Task" },
  { value: "reminder", label: "Reminder" },
  { value: "alert", label: "Alert" },
  { value: "update", label: "Update" },
  { value: "approval", label: "Approval" },
  { value: "followup", label: "Follow-up" },
  { value: "note", label: "Note" },
  { value: "other", label: "Other" },
];

async function updateNotificationStatus(id: string, status: string) {
  await fetch("/api/admin/notifications/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
}

export default function NotificationManagementPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [assignTo, setAssignTo] = useState<string>("");
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const { notifications, isLoading, markAsRead, refetch } = useNotifications(userId);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newType, setNewType] = useState("custom");
  const [newLink, setNewLink] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const filtered = notifications.filter((n) =>
    (filter === "all" || n.type === filter) &&
    (search === "" || n.message.toLowerCase().includes(search.toLowerCase()))
  );

  const currentUserTasks = notifications.filter(
    (n) => n.assignedTo === userId && n.status !== "completed"
  );

  const bulkMarkAsRead = async () => {
    await Promise.all(selected.map((id) => markAsRead(id)));
    setSelected([]);
    refetch();
  };

  const assignNotifications = async () => {
    if (!assignTo || selected.length === 0) return;
    await fetch("/api/admin/notifications/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds: selected, userId: assignTo }),
    });
    setSelected([]);
    setAssignTo("");
    refetch();
  };

  const handleCreate = async () => {
    if (!newTitle || !newDescription || !newAssignee) return;
    setCreating(true);
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        message: newDescription,
        type: newType,
        assignedTo: newAssignee,
        link: newLink || undefined,
        dueDate: newDueDate || undefined,
        priority: newPriority || undefined,
      }),
    });
    setCreating(false);
    setShowCreate(false);
    setNewTitle("");
    setNewDescription("");
    setNewAssignee("");
    setNewDueDate("");
    setNewPriority("");
    setNewType("custom");
    setNewLink("");
    refetch();
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notification Management</h1>
        <Button onClick={() => setShowCreate(true)} size="sm">Create Task</Button>
      </div>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <label className="font-medium">Title<span className="text-red-500">*</span>
              <Input
                placeholder="Short title for the task"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
              />
            </label>
            <label className="font-medium">Description<span className="text-red-500">*</span>
              <Textarea
                placeholder="Detailed description..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                required
                rows={3}
              />
            </label>
            <label className="font-medium">Assign to<span className="text-red-500">*</span>
              <select
                className="border p-2 rounded w-full"
                value={newAssignee}
                onChange={e => setNewAssignee(e.target.value)}
                required
              >
                <option value="">Select admin...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </label>
            <label className="font-medium">Due Date
              <Input
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
              />
            </label>
            <label className="font-medium">Priority
              <select
                className="border p-2 rounded w-full"
                value={newPriority}
                onChange={e => setNewPriority(e.target.value)}
              >
                <option value="">Select priority...</option>
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label className="font-medium">Type
              <select
                className="border p-2 rounded w-full"
                value={newType}
                onChange={e => setNewType(e.target.value)}
              >
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label className="font-medium">Link
              <Input
                placeholder="Optional link (e.g. /admin/orders/123)"
                value={newLink}
                onChange={e => setNewLink(e.target.value)}
              />
            </label>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={!newTitle || !newDescription || !newAssignee || creating}>
              {creating ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Current user's active tasks */}
      {currentUserTasks.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="font-semibold mb-2">Your Active Tasks</div>
          <ul className="list-disc pl-5">
            {currentUserTasks.map((n) => (
              <li key={n.id} className="mb-1 flex items-center gap-2">
                <span>{n.message}</span>
                <select
                  className="border p-1 text-xs"
                  value={n.status}
                  onChange={async (e) => {
                    await updateNotificationStatus(n.id, e.target.value);
                    refetch();
                  }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <select className="border p-2" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {NOTIF_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <Button size="sm" onClick={() => refetch()}>Refresh</Button>
      </div>
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <Button size="sm" onClick={bulkMarkAsRead} disabled={selected.length === 0}>Mark Selected as Read</Button>
        <select className="border p-2" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
          <option value="">Assign to...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <Button size="sm" onClick={assignNotifications} disabled={!assignTo || selected.length === 0}>Assign</Button>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={e => setSelected(e.target.checked ? filtered.map(n => n.id) : [])} /></th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Message</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Assigned</th>
              <th className="p-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center">No notifications found.</td></tr>
            ) : filtered.map((n) => (
              <tr key={n.id} className={n.read ? "bg-white" : "bg-yellow-50"}>
                <td className="p-2"><input type="checkbox" checked={selected.includes(n.id)} onChange={e => setSelected(e.target.checked ? [...selected, n.id] : selected.filter(id => id !== n.id))} /></td>
                <td className="p-2"><Badge variant="outline">{n.type}</Badge></td>
                <td className="p-2">{n.message}</td>
                <td className="p-2">
                  <select
                    className="border p-1 text-xs"
                    value={n.status}
                    onChange={async (e) => {
                      await updateNotificationStatus(n.id, e.target.value);
                      refetch();
                    }}
                    disabled={n.assignedTo !== userId}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">{n.assignedTo || "-"}</td>
                <td className="p-2 text-xs">{new Date(n.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 