"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts"

const GOLD = "#c9a84c"
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTHS = ["May", "Jun", "Jul", "Aug"]

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl border-t-2 border-t-gold/60 p-5">
      <h3 className="mb-4 font-serif text-lg font-semibold text-foreground">{title}</h3>
      <div className="h-64 w-full">{children}</div>
    </div>
  )
}

function ChartTooltip({ active, payload, label, suffix }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gold/30 bg-black/90 px-3 py-2 text-xs text-foreground shadow-lg">
      <p className="font-medium text-gold">{label}</p>
      <p className="text-muted-foreground">
        {payload[0].value} {suffix}
      </p>
    </div>
  )
}

export function WeeklyScanChart({ data }: { data: number[] }) {
  const chartData = DAYS.map((d, i) => ({ day: d, scans: data[i] ?? 0 }))
  return (
    <ChartCard title="QR Scans — Last 7 Days">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="day" stroke="#9a9a9a" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9a9a9a" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip suffix="scans" />} cursor={{ stroke: GOLD, strokeOpacity: 0.2 }} />
          <Line
            type="monotone"
            dataKey="scans"
            stroke={GOLD}
            strokeWidth={2.5}
            dot={{ fill: GOLD, r: 4 }}
            activeDot={{ r: 6, fill: "#e8d48b" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function MonthlyReviewChart({ data }: { data: number[] }) {
  const chartData = MONTHS.map((m, i) => {
    const prev = data[i - 1]
    const growth = prev ? Math.round(((data[i] - prev) / prev) * 100) : 0
    return {
      month: m,
      reviews: data[i] ?? 0,
      label: i === 0 ? "" : `+${growth}%`,
    }
  })
  return (
    <ChartCard title="Review Growth — Monthly">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="month" stroke="#9a9a9a" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9a9a9a" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip suffix="reviews" />} cursor={{ fill: "rgba(201,168,76,0.08)" }} />
          <Bar dataKey="reviews" fill={GOLD} radius={[6, 6, 0, 0]} maxBarSize={48}>
            <LabelList dataKey="label" position="top" fill="#e8d48b" fontSize={11} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
