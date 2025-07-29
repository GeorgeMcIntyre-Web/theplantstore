"use client";

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function SalesChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No sales data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ReLineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="sales" stroke="#22c55e" name="Sales" />
        <Line type="monotone" dataKey="orders" stroke="#3b82f6" name="Orders" />
      </ReLineChart>
    </ResponsiveContainer>
  );
} 