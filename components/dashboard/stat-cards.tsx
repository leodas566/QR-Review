"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ScanLine, CheckCircle2, CalendarSearch, Loader2 } from "lucide-react"
import { getStatsByDate } from "@/lib/supabase"

const BUSINESS_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"

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

function DateLookupCard({ index }: { index: number }) {
  // Default to today in local date
  const todayStr = new Date().toLocaleDateString("en-CA") // YYYY-MM-DD
  const [date, setDate] = useState(todayStr)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ scans: number; copied: number; ratings: number[] } | null>(null)
  const [searched, setSearched] = useState(false)

  const lookup = async () => {
    setLoading(true)
    setSearched(true)
    const data = await getStatsByDate(BUSINESS_ID, date)
    setResult(data)
    setLoading(false)
  }

  const avgRating =
    result && result.ratings.length > 0
      ? (result.ratings.reduce((a, b) => a + b, 0) / result.ratings.length).toFixed(1)
      : null

  const convRate =
    result && result.scans > 0
      ? ((result.copied / result.scans) * 100).toFixed(0)
      : "0"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="glass-card rounded-2xl border-t-2 border-t-gold/60 p-5 hover:border-t-gold transition-all"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="text-gold"><CalendarSearch className="h-4 w-4" /></span>
        <span className="text-xs font-medium uppercase tracking-wide">Date Lookup</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="date"
          value={date}
          max={todayStr}
          onChange={(e) => { setDate(e.target.value); setSearched(false); setResult(null) }}
          className="flex-1 rounded-lg border border-gold/20 bg-black/40 px-3 py-1.5 text-sm text-foreground outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/40"
        />
        <button
          onClick={lookup}
          disabled={loading || !date}
          className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-gold-light disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Go"}
        </button>
      </div>

      <div className="mt-3 min-h-[3rem]">
        {!searched && (
          <p className="text-xs text-muted-foreground">Select a date to see that day's data</p>
        )}
        {searched && loading && (
          <p className="text-xs text-muted-foreground animate-pulse">Fetching data…</p>
        )}
        {searched && !loading && result !== null && (
          result.scans === 0 ? (
            <p className="text-xs text-muted-foreground">No scans on this date</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              <div>
                <p className="font-serif text-2xl font-bold text-foreground">{result.scans}</p>
                <p className="text-xs text-muted-foreground">Scans</p>
              </div>
              <div className="border-l border-gold/20 pl-3">
                <p className="font-serif text-2xl font-bold text-gold">{result.copied}</p>
                <p className="text-xs text-muted-foreground">Copied <span className="text-gold">{convRate}%</span></p>
              </div>
              {avgRating && (
                <div className="border-l border-gold/20 pl-3">
                  <p className="font-serif text-2xl font-bold text-gold">⭐ {avgRating}</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </motion.div>
  )
}

export function StatCards({
  totalScans,
  totalCopied,
}: {
  totalScans: number
  totalCopied: number
}) {
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

      <DateLookupCard index={2} />
    </div>
  )
}
