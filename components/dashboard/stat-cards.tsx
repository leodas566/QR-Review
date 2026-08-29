"use client"

import { motion } from "motion/react"
import { ScanLine, CheckCircle2, TrendingUp } from "lucide-react"

function StatCard({
  icon,
  label,
  children,
  index,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="glass-card rounded-2xl border-t-2 border-t-gold/60 p-5 hover:border-t-gold transition-all"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="text-gold">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-3">{children}</div>
    </motion.div>
  )
}

export function StatCards({
  totalScans,
  totalCopied,
  weekGrowth,
}: {
  totalScans: number
  totalCopied: number
  weekGrowth: number
}) {
  const positive = weekGrowth >= 0
  const conversionRate = totalScans > 0 ? ((totalCopied / totalScans) * 100).toFixed(1) : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard icon={<ScanLine className="h-4 w-4" />} label="Total Scans" index={0}>
        <div className="flex items-baseline gap-2">
          <p className="font-serif text-3xl font-bold text-foreground">{totalScans.toLocaleString()}</p>
          <span className="text-xs text-muted-foreground animate-pulse">Live</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">QR code scans</p>
      </StatCard>

      <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Reviews Copied" index={1}>
        <div className="flex items-baseline gap-2">
          <p className="font-serif text-3xl font-bold text-foreground">{totalCopied.toLocaleString()}</p>
          <span className="text-xs text-gold">{conversionRate}%</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Conversion rate</p>
      </StatCard>

      <StatCard icon={<TrendingUp className="h-4 w-4" />} label="This Week Growth" index={2}>
        <div className="flex items-baseline gap-2">
          <p className={"font-serif text-3xl font-bold " + (positive ? "text-gold" : "text-destructive")}>
            {positive ? "▲" : "▼"} {Math.abs(weekGrowth).toFixed(1)}%
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">vs last week</p>
      </StatCard>
    </div>
  )
}
