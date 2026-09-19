"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { getCampaigns, type Campaign } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  completed: "#4caf7d",
  sending:   "#c9a84c",
  pending:   "#888880",
  scheduled: "#64b5f6",
  failed:    "#e05555",
}

export function CampaignHistory() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading]     = useState(true)

  const load = () => {
    setLoading(true)
    getCampaigns().then(data => { setCampaigns(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "#888880" }}>{campaigns.length} campaigns</p>
        <button onClick={load} style={{ color: "#888880" }}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin" style={{ color: "#c9a84c" }} />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <span className="text-4xl">📭</span>
          <p style={{ color: "#888880" }}>No campaigns yet</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                  {["Date","Template","Segment","Sent","Delivered","Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#888880" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < campaigns.length - 1 ? "1px solid rgba(201,168,76,0.07)" : "none" }}>
                    <td className="px-4 py-3 text-xs" style={{ color: "#888880" }}>{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: "#f5f0e8" }}>{c.template_name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#888880" }}>{c.segment}</td>
                    <td className="px-4 py-3 text-center" style={{ color: "#c9a84c" }}>{c.total_sent}</td>
                    <td className="px-4 py-3 text-center" style={{ color: "#4caf7d" }}>{c.delivered_count}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                        style={{
                          color: STATUS_COLORS[c.status] ?? "#888880",
                  background: STATUS_COLORS[c.status] ? `${STATUS_COLORS[c.status]}22` : "rgba(136,136,128,0.15)",
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
