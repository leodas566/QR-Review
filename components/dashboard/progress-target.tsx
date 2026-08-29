"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { setItem } from "@/lib/store"

export function ProgressTarget({
  initialCurrent,
  initialTarget,
  weeklyAvg,
}: {
  initialCurrent: number
  initialTarget: number
  weeklyAvg: number
}) {
  const [current, setCurrent] = useState(initialCurrent)
  const [target, setTarget] = useState(initialTarget)
  const [saved, setSaved] = useState(false)

  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const remaining = Math.max(0, target - current)
  // assume ~15% of scans convert to reviews as a pace estimate
  const reviewsPerWeek = Math.max(1, Math.round(weeklyAvg * 0.15 * 7))
  const weeksToTarget = Math.ceil(remaining / reviewsPerWeek)

  const save = () => {
    setItem("currentReviews", current)
    setItem("targetReviews", target)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="glass-card rounded-2xl border-t-2 border-t-gold/60 p-5">
      <h3 className="mb-4 font-serif text-lg font-semibold text-foreground">Progress to Target</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">Current Reviews</label>
          <input
            type="number"
            value={current}
            onChange={(e) => setCurrent(Number.parseInt(e.target.value) || 0)}
            className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">Target Reviews</label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number.parseInt(e.target.value) || 0)}
            className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {current} / {target}
          </span>
          <span className="font-medium text-gold">{pct}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="gold-glow h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          At current pace, you&apos;ll reach your target in approx.{" "}
          <span className="font-medium text-gold">{weeksToTarget} weeks</span>.
        </p>
      </div>

      <button
        onClick={save}
        className="mt-5 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-gold-light"
      >
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  )
}
