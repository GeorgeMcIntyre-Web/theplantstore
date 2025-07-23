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

export default function CustomerGrowthChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ReLineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="signups" stroke="#3b82f6" name="Signups" />
      </ReLineChart>
    </ResponsiveContainer>
  );
} 