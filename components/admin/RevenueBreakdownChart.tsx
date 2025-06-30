"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e42", "#ef4444", "#a855f7", "#fbbf24", "#10b981", "#6366f1"];

export default function RevenueBreakdownChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="revenue"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#22c55e"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `R${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
} 