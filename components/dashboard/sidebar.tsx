"use client"

import Link from "next/link"
import { LayoutDashboard, QrCode, LogOut } from "lucide-react"

type Tab = "overview"

const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-5 w-5" /> },
]

export function Sidebar({
  active,
  onChange,
  onLogout,
}: {
  active: Tab
  onChange: (t: Tab) => void
  onLogout: () => void
}) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-gold/15 bg-sidebar p-5 md:flex">
        <div className="flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold/15 text-gold">
            <QrCode className="h-5 w-5" />
          </span>
          <div>
            <p className="font-serif text-lg font-bold text-foreground leading-none">ReviewBoost</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">Owner Portal</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
                (active === item.id
                  ? "bg-gold/15 text-gold"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground")
              }
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <Link
            href="/admin/qr"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          >
            <QrCode className="h-5 w-5" />
            QR Generator
          </Link>
        </nav>

        <button
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-gold/15 bg-sidebar/95 px-2 py-2 backdrop-blur md:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={
              "flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-[11px] transition " +
              (active === item.id ? "text-gold" : "text-muted-foreground")
            }
          >
            {item.icon}
            {item.label}
          </button>
        ))}
        <Link
          href="/admin/qr"
          className="flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-[11px] text-muted-foreground"
        >
          <QrCode className="h-5 w-5" />
          QR
        </Link>
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-[11px] text-muted-foreground"
        >
          <LogOut className="h-5 w-5" />
          Exit
        </button>
      </nav>
    </>
  )
}
