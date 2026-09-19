"use client"

import { useEffect, useState } from "react"
import { Search, RefreshCw, Users } from "lucide-react"
import { getCustomers, type Customer } from "@/lib/supabase"
import { daysSince, formatDate } from "@/lib/utils"

type Filter = "all" | "active" | "inactive"

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [filter, setFilter]       = useState<Filter>("all")

  const load = () => {
    setLoading(true)
    getCustomers().then(data => { setCustomers(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = customers.filter(c => {
    const days    = daysSince(c.last_visit)
    const inactive = days >= 15
    const matchF  = filter === "all" || (filter === "active" && !inactive) || (filter === "inactive" && inactive)
    const matchS  = c.name.toLowerCase().includes(search.toLowerCase()) ||
                    c.phone.includes(search)
    return matchF && matchS
  })

  const stats = {
    total:    customers.length,
    active:   customers.filter(c => daysSince(c.last_visit) < 15).length,
    inactive: customers.filter(c => daysSince(c.last_visit) >= 15).length,
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total",    value: stats.total,    color: "#c9a84c" },
          { label: "Active",   value: stats.active,   color: "#4caf7d" },
          { label: "Inactive", value: stats.inactive, color: "#e05555" },
        ].map(s => (
          <div
            key={s.label}
            className="glass-card rounded-xl p-3 text-center"
            style={{ borderColor: "rgba(201,168,76,0.15)" }}
          >
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "#888880" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex gap-2 flex-wrap">
        {(["all","active","inactive"] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="rounded-xl px-3 py-1.5 text-sm font-medium capitalize transition-all"
            style={{
              background: filter === f ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
              color: filter === f ? "#c9a84c" : "#888880",
              border: `1px solid ${filter === f ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.1)"}`,
            }}
          >
            {f}
          </button>
        ))}
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "#888880" }} />
          <input
            className="input-base pl-9 py-1.5 text-sm"
            placeholder="Search name or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={load} style={{ color: "#888880" }} className="p-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin" style={{ color: "#c9a84c" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <Users className="h-10 w-10" style={{ color: "#888880" }} />
            <p style={{ color: "#888880" }}>No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                  {["Name","Phone","Visits","Last Visit","Inactive","Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#888880" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const days = daysSince(c.last_visit)
                  const inactive = days >= 15
                  return (
                    <tr
                      key={c.id}
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(201,168,76,0.07)" : "none" }}
                    >
                      <td className="px-4 py-3 font-medium" style={{ color: "#f5f0e8" }}>{c.name}</td>
                      <td className="px-4 py-3" style={{ color: "#888880" }}>+91 {c.phone}</td>
                      <td className="px-4 py-3 text-center" style={{ color: "#c9a84c" }}>{c.visit_count}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#888880" }}>{formatDate(c.last_visit)}</td>
                      <td className="px-4 py-3 text-center" style={{ color: inactive ? "#e05555" : "#4caf7d" }}>{days}d</td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            background: inactive ? "rgba(224,85,85,0.15)" : "rgba(76,175,125,0.15)",
                            color: inactive ? "#e05555" : "#4caf7d",
                          }}
                        >
                          {inactive ? "Inactive" : "Active"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
