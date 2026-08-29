"use client"

import { useState } from "react"
import { getItem, setItem, clearAllData } from "@/lib/store"

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  )
}

const inputCls =
  "w-full rounded-xl border border-gold/20 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"

export function SettingsPanel() {
  const [barName, setBarName]           = useState(() => getItem("barName", "House of Paloma Bandra"))
  const [barLocation, setBarLocation]   = useState(() => getItem("barLocation", "Bandra West, Mumbai"))
  const [reviewUrl, setReviewUrl]       = useState(() =>
    getItem("googleReviewURL", "https://search.google.com/local/writereview?placeid=ChIJ4TflFcvJ5zsRWP5VIdUk9Qg"),
  )
  const [customMessage, setCustomMessage] = useState(() => getItem("customMessage", ""))
  const [email, setEmail]               = useState(() => getItem("ownerEmail", "owner@thebandrabar.com"))
  const [password, setPassword]         = useState(() => getItem("ownerPassword", "admin123"))
  const [saved, setSaved]               = useState(false)

  const save = () => {
    setItem("barName", barName)
    setItem("barLocation", barLocation)
    setItem("googleReviewURL", reviewUrl)
    setItem("customMessage", customMessage)
    setItem("ownerEmail", email)
    setItem("ownerPassword", password)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="glass-card max-w-2xl rounded-2xl border-t-2 border-t-gold/60 p-6">
      <h2 className="font-serif text-2xl font-bold text-foreground">Settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage how your review page behaves. Changes save to this browser.
      </p>

      <div className="mt-6 space-y-5">
        <Field label="Bar Name">
          <input className={inputCls} value={barName} onChange={(e) => setBarName(e.target.value)} />
        </Field>

        <Field label="Location">
          <input className={inputCls} value={barLocation} onChange={(e) => setBarLocation(e.target.value)} />
        </Field>

        <Field label="Google Review URL" hint="Where customers are redirected after copying.">
          <input className={inputCls} value={reviewUrl} onChange={(e) => setReviewUrl(e.target.value)} />
        </Field>

        <Field
          label="Custom Message Override"
          hint="Replaces auto-generated messages. Use {BAR_NAME} as placeholder. Leave blank for smart messages."
        >
          <textarea
            className={inputCls + " resize-none"}
            rows={3}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Leave blank to use the smart message engine"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Owner Email">
            <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Owner Password">
            <input
              className={inputCls}
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>
      </div>

      <button
        onClick={save}
        className="gold-glow mt-7 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-gold-light"
      >
        {saved ? "Changes Saved" : "Save Changes"}
      </button>

      <div className="mt-8 border-t border-destructive/20 pt-8">
        <h3 className="font-serif text-lg font-semibold text-destructive">Danger Zone</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Clear all data including settings and login information. This cannot be undone.
        </p>
        <button
          onClick={() => {
            if (
              confirm(
                "Are you sure? This will reset all settings and login credentials. This action cannot be undone."
              )
            ) {
              clearAllData()
            }
          }}
          className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/20"
        >
          Clear All Data
        </button>
      </div>
    </div>
  )
}
