"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { StatCards } from "@/components/dashboard/stat-cards"
import { WeeklyScanChart, MonthlyReviewChart } from "@/components/dashboard/charts"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { RatingBreakdown } from "@/components/dashboard/rating-breakdown"
import { getItem, setItem } from "@/lib/store"
import { getBusinessStats, getBusiness, subscribeToScans } from "@/lib/supabase"

type Tab = "overview"

const BUSINESS_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"

export function Dashboard() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<Tab>("overview")
  const [barName, setBarName] = useState("House of Paloma Bandra")
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  // Stats — all start at 0, only Supabase can update them
  const [totalScans, setTotalScans] = useState(0)
  const [totalCopied, setTotalCopied] = useState(0)
  const [weeklyScans, setWeeklyScans] = useState<number[]>([0,0,0,0,0,0,0])
  const [monthlyReviews, setMonthlyReviews] = useState<number[]>([0,0,0,0])
  const [timestamps, setTimestamps] = useState<string[]>([])
  const [ratingBreakdown, setRatingBreakdown] = useState<Record<number, number>>({ 1:0, 2:0, 3:0, 4:0, 5:0 })
  const [weekGrowth, setWeekGrowth] = useState(0)

  const applyStats = useCallback((stats: Awaited<ReturnType<typeof getBusinessStats>>) => {
    if (!stats) return
    setTotalScans(stats.totalScans)
    setTotalCopied(stats.totalCopied)
    setWeeklyScans(stats.weeklyScans)
    setMonthlyReviews(stats.monthlyReviews)
    setRatingBreakdown(stats.ratingBreakdown)
    setTimestamps(stats.recentScans.map((s: any) => s.created_at))
    setLastUpdate(Date.now())

    // Real week-over-week growth from actual scan data
    const curr = stats.currentWeekTotal ?? 0
    const prev = stats.prevWeekTotal ?? 0
    if (prev === 0 && curr === 0) {
      setWeekGrowth(0)
    } else if (prev === 0) {
      // First week with data — show as +100% (new activity)
      setWeekGrowth(100)
    } else {
      setWeekGrowth(((curr - prev) / prev) * 100)
    }
  }, [])

  const fetchFromSupabase = useCallback(async () => {
    try {
      const [stats, business] = await Promise.all([
        getBusinessStats(BUSINESS_ID),
        getBusiness(BUSINESS_ID),
      ])
      applyStats(stats)
      if (business) setBarName(business.name)
    } catch (err) {
      console.error("Supabase fetch error:", err)
    }
  }, [applyStats])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!getItem("isLoggedIn", false)) {
      router.replace("/login")
      return
    }
    fetchFromSupabase()
    setReady(true)

    const unsub = subscribeToScans(BUSINESS_ID, () => {
      fetchFromSupabase()
    })
    return () => unsub()
  }, [router, fetchFromSupabase])

  // Refresh "time ago" labels every 30s
  useEffect(() => {
    const id = setInterval(() => setLastUpdate(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const logout = () => {
    setItem("isLoggedIn", false)
    router.push("/login")
  }

  if (!ready) {
    return (
      <div className="grid min-h-svh place-items-center text-sm text-muted-foreground">
        Loading dashboard…
      </div>
    )
  }

  const weeklyAvg = weeklyScans.reduce((a, b) => a + b, 0) / 7

  return (
    <div className="min-h-svh">
      <Sidebar active={tab} onChange={setTab} onLogout={logout} />

      <div className="md:pl-60">
        <div className="mx-auto max-w-5xl px-5 pb-28 pt-8 md:pb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Header */}
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-serif text-3xl font-bold text-foreground">{barName}</h1>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-xs font-medium text-gold"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
                    </span>
                    Real-time
                  </motion.span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Performance overview • Last updated:{" "}
                  {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-end gap-1"
              >
                <p className="text-xs text-muted-foreground">Powered by</p>
                <p className="text-sm font-semibold text-gold">Supabase Realtime</p>
              </motion.div>
            </header>

            {/* Empty state — shown until first real scan */}
            {totalScans === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-dashed border-gold/30 bg-gold/5 px-6 py-5 text-center"
              >
                <p className="text-sm font-medium text-gold">No scans yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Place your QR code at the bar — every scan will appear here instantly.
                </p>
              </motion.div>
            )}

            {/* Stat Cards */}
            <StatCards
              totalScans={totalScans}
              totalCopied={totalCopied}
              weekGrowth={totalScans > 0 ? weekGrowth : 0}
            />

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <WeeklyScanChart data={weeklyScans} />
              <MonthlyReviewChart data={monthlyReviews} />
            </div>

            {/* Rating breakdown + Activity side by side */}
            <RatingBreakdown breakdown={ratingBreakdown} totalScans={totalScans} />

            <ActivityFeed key={lastUpdate} timestamps={timestamps} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
