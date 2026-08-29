"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { getItem } from "@/lib/store"

interface RatingBreakdownProps {
  breakdown?: Record<number, number>
  totalScans?: number
}

export function RatingBreakdown({ breakdown: propBreakdown, totalScans: propTotalScans }: RatingBreakdownProps) {
  const [breakdown, setBreakdown] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const updateBreakdown = () => {
      if (propBreakdown) {
        setBreakdown(propBreakdown)
        setTotal(propTotalScans || Object.values(propBreakdown).reduce((sum, count) => sum + count, 0))
      } else {
        const data = getItem<Record<number, number>>("ratingBreakdown", { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
        setBreakdown(data)
        setTotal(Object.values(data).reduce((sum, count) => sum + count, 0))
      }
    }

    updateBreakdown()

    // Listen for storage changes only if not using props
    if (!propBreakdown) {
      const handleStorageChange = (e: CustomEvent) => {
        if (e.detail.key === "ratingBreakdown") {
          updateBreakdown()
        }
      }

      window.addEventListener("store-change" as any, handleStorageChange as EventListener)
      return () => {
        window.removeEventListener("store-change" as any, handleStorageChange as EventListener)
      }
    }
  }, [propBreakdown, propTotalScans])

  const getPercentage = (stars: number) => {
    if (total === 0) return 0
    return Math.round((breakdown[stars] / total) * 100)
  }

  const getBarWidth = (stars: number) => {
    return total === 0 ? 0 : (breakdown[stars] / total) * 100
  }

  return (
    <div className="glass-card rounded-2xl border-t-2 border-t-gold/60 p-6">
      <h3 className="font-serif text-xl font-semibold text-foreground">Star Rating Breakdown</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Customer ratings from QR scans ({total} total ratings)
      </p>

      <div className="mt-6 space-y-3">
        {[5, 4, 3, 2, 1].map((stars) => (
          <div key={stars} className="flex items-center gap-3">
            {/* Star Label */}
            <div className="flex w-12 items-center gap-1 text-sm font-medium text-foreground">
              <span>{stars}</span>
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            </div>

            {/* Progress Bar */}
            <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-black/40">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500"
                style={{ width: `${getBarWidth(stars)}%` }}
              />
              {breakdown[stars] > 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white mix-blend-difference">
                  {breakdown[stars]}
                </div>
              )}
            </div>

            {/* Percentage */}
            <div className="w-12 text-right text-sm font-medium text-muted-foreground">
              {getPercentage(stars)}%
            </div>
          </div>
        ))}
      </div>

      {total === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gold/30 bg-gold/5 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No ratings yet. Customers will start rating when they scan your QR code!
          </p>
        </div>
      )}

      {total > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-xl bg-black/40 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Average Rating</p>
            <p className="mt-1 font-serif text-2xl font-bold text-gold">
              {(
                Object.entries(breakdown).reduce((sum, [stars, count]) => sum + Number(stars) * count, 0) / total
              ).toFixed(1)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Most Common</p>
            <div className="mt-1 flex items-center gap-1">
              <span className="font-serif text-2xl font-bold text-foreground">
                {Object.entries(breakdown).reduce((max, [stars, count]) =>
                  count > breakdown[max] ? Number(stars) : max,
                  5
                )}
              </span>
              <Star className="h-5 w-5 fill-gold text-gold" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
