"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Check, Trash2 } from "lucide-react";

interface AdminNotification {
  id: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
  assignedTo?: {
    name: string;
    email: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      ORDER: { variant: "default", label: "Order" },
      INVENTORY: { variant: "secondary", label: "Inventory" },
      CUSTOMER: { variant: "outline", label: "Customer" },
      SYSTEM: { variant: "destructive", label: "System" },
    };
    const config = typeConfig[type as keyof typeof typeConfig] || { variant: "secondary", label: type };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary", label: "Pending" },
      ASSIGNED: { variant: "default", label: "Assigned" },
      RESOLVED: { variant: "default", label: "Resolved" },
      CLOSED: { variant: "outline", label: "Closed" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary", label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const handleAssign = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: "current-user" }),
      });
      
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to assign notification:", error);
    }
  };

  const handleResolve = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to resolve notification:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = 
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || notification.type === typeFilter;
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {notifications.filter(n => n.status === "PENDING").length} Pending
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ORDER">Order</SelectItem>
                  <SelectItem value="INVENTORY">Inventory</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notifications found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{getTypeBadge(notification.type)}</TableCell>
                    <TableCell className="max-w-xs truncate">{notification.message}</TableCell>
                    <TableCell>{getStatusBadge(notification.status)}</TableCell>
                    <TableCell>
                      {notification.assignedTo ? (
                        <div>
                          <div className="font-medium">{notification.assignedTo.name}</div>
                          <div className="text-sm text-muted-foreground">{notification.assignedTo.email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(notification.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {notification.status === "PENDING" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAssign(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {notification.status === "ASSIGNED" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleResolve(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 