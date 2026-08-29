"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { StatCards } from "@/components/dashboard/stat-cards"
import { WeeklyScanChart, MonthlyReviewChart } from "@/components/dashboard/charts"
import { ProgressTarget } from "@/components/dashboard/progress-target"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { RatingBreakdown } from "@/components/dashboard/rating-breakdown"
import { getItem, setItem } from "@/lib/store"
import { getBusinessStats, getBusiness, subscribeToScans } from "@/lib/supabase"

type Tab = "overview"

const BUSINESS_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"

// Pure zero state — never reads from localStorage for stats
const ZERO_STATE = {
  totalScans: 0,
  totalCopied: 0,
  weeklyScans: [0, 0, 0, 0, 0, 0, 0] as number[],
  monthlyReviews: [0, 0, 0, 0] as number[],
  timestamps: [] as string[],
  ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
}

export function Dashboard() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<Tab>("overview")
  const [barName, setBarName] = useState("House of Paloma Bandra")
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  // Stats — all start at 0, only Supabase can update them
  const [totalScans, setTotalScans] = useState(0)
  const [totalCopied, setTotalCopied] = useState(0)
  const [weeklyScans, setWeeklyScans] = useState<number[]>(ZERO_STATE.weeklyScans)
  const [monthlyReviews, setMonthlyReviews] = useState<number[]>(ZERO_STATE.monthlyReviews)
  const [timestamps, setTimestamps] = useState<string[]>([])
  const [ratingBreakdown, setRatingBreakdown] = useState<Record<number, number>>(ZERO_STATE.ratingBreakdown)

  // Progress target — these are owner-configured, not real-time stats
  const [currentReviews] = useState(0)
  const [targetReviews] = useState(50)

  const applyStats = useCallback((stats: Awaited<ReturnType<typeof getBusinessStats>>) => {
    if (!stats) return
    setTotalScans(stats.totalScans)
    setTotalCopied(stats.totalCopied)
    setWeeklyScans(stats.weeklyScans)
    setMonthlyReviews(stats.monthlyReviews)
    setRatingBreakdown(stats.ratingBreakdown)
    setTimestamps(stats.recentScans.map((s: any) => s.created_at))
    setLastUpdate(Date.now())
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
    // Guard: only run in browser
    if (typeof window === "undefined") return

    // Auth check — only stored value we care about
    if (!getItem("isLoggedIn", false)) {
      router.replace("/login")
      return
    }

    // Load real data from Supabase immediately
    fetchFromSupabase()
    setReady(true)

    // Subscribe to real-time inserts/updates
    const unsub = subscribeToScans(BUSINESS_ID, () => {
      fetchFromSupabase()
    })

    return () => unsub()
  }, [router, fetchFromSupabase])

  // Refresh "time ago" labels every 30 s without re-fetching Supabase
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

  // Week-over-week growth — only meaningful when there is actual data
  const weekTotal = weeklyScans.reduce((a, b) => a + b, 0)
  const prevWeekTotal = weeklyScans.slice(0, 3).reduce((a, b) => a + b, 0) // Mon–Wed as proxy
  const weekGrowth = prevWeekTotal > 0 ? ((weekTotal - prevWeekTotal) / prevWeekTotal) * 100 : 0
  const weeklyAvg = weeklyScans.length ? weekTotal / weeklyScans.length : 0

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

            {/* Empty state banner — shown until first real scan */}
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

            {/* Rating breakdown */}
            <RatingBreakdown breakdown={ratingBreakdown} totalScans={totalScans} />

            {/* Progress + Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ProgressTarget
                initialCurrent={currentReviews}
                initialTarget={targetReviews}
                weeklyAvg={weeklyAvg}
              />
              <ActivityFeed key={lastUpdate} timestamps={timestamps} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
