"use client"

import { Smartphone } from "lucide-react"
import { timeAgo } from "@/lib/store"

export function ActivityFeed({ timestamps }: { timestamps: string[] }) {
  const items = timestamps.slice(0, 10)
  return (
    <div className="glass-card rounded-2xl border-t-2 border-t-gold/60 p-5">
      <h3 className="mb-4 font-serif text-lg font-semibold text-foreground">Recent Activity</h3>
      <ul className="flex flex-col">
        {items.map((ts, i) => (
          <li
            key={i}
            className="flex items-center gap-3 py-3 text-sm text-foreground/90 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/5"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
              <Smartphone className="h-4 w-4" />
            </span>
            <span className="flex-1">Someone scanned your QR code</span>
            <span className="text-xs text-muted-foreground">{timeAgo(ts)}</span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">No activity yet.</li>
        )}
      </ul>
    </div>
  )
}
