"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "Mon", traditional: 120, opsgemini: 14 },
  { day: "Tue", traditional: 118, opsgemini: 9 },
  { day: "Wed", traditional: 122, opsgemini: 6 },
  { day: "Thu", traditional: 117, opsgemini: 4 },
  { day: "Fri", traditional: 121, opsgemini: 3 },
  { day: "Sat", traditional: 119, opsgemini: 2 },
  { day: "Sun", traditional: 120, opsgemini: 1.5 },
];

export function MTTRChart() {
  return (
    <div className="h-[340px] w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="opsGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
          <XAxis dataKey="day" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip
            contentStyle={{ border: "1px solid #1e1e1e", background: "#0a0a0a", borderRadius: "12px" }}
            labelStyle={{ color: "#cbd5e1" }}
          />
          <Legend />
          <Area type="monotone" dataKey="opsgemini" stroke="none" fill="url(#opsGreen)" />
          <Line type="monotone" dataKey="traditional" stroke="#ef4444" strokeWidth={2.2} dot={false} name="Traditional MTTR" />
          <Line type="monotone" dataKey="opsgemini" stroke="#22c55e" strokeWidth={2.8} dot={false} name="With OpsGemini" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
