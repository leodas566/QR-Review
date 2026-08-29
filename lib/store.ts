"use client"

// ---- localStorage schema keys ----
export type StoreKey =
  | "totalScans"
  | "totalCopied"
  | "scanTimestamps"
  | "currentReviews"
  | "targetReviews"
  | "googleReviewURL"
  | "barName"
  | "barLocation"
  | "customMessage"
  | "isLoggedIn"
  | "weeklyScans"
  | "monthlyReviews"
  | "ownerEmail"
  | "ownerPassword"
  | "seeded"
  | "configVersion"
  | "ratingBreakdown"

const isBrowser = typeof window !== "undefined"

export const CONFIG_VERSION = "fresh-start-v1"

export function seedIfEmpty() {
  if (!isBrowser) return

  // On version mismatch wipe everything so no old sample data lingers
  if (localStorage.getItem("configVersion") !== CONFIG_VERSION) {
    const isLoggedIn  = localStorage.getItem("isLoggedIn")
    const email       = localStorage.getItem("ownerEmail")
    const password    = localStorage.getItem("ownerPassword")

    localStorage.clear()

    if (isLoggedIn) localStorage.setItem("isLoggedIn", isLoggedIn)
    if (email)      localStorage.setItem("ownerEmail", email)
    if (password)   localStorage.setItem("ownerPassword", password)

    localStorage.setItem("configVersion", CONFIG_VERSION)
    localStorage.setItem("ownerEmail",    JSON.stringify("owner@thebandrabar.com"))
    localStorage.setItem("ownerPassword", JSON.stringify("admin123"))
  }
}

export function getItem<T>(key: StoreKey, fallback: T): T {
  if (!isBrowser) return fallback
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setItem(key: StoreKey, value: unknown) {
  if (!isBrowser) return
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent("store-change", { detail: { key } }))
}

export function subscribe(callback: () => void): () => void {
  if (!isBrowser) return () => {}
  const handler = () => callback()
  window.addEventListener("store-change", handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener("store-change", handler)
    window.removeEventListener("storage", handler)
  }
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return "just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} hr${hrs > 1 ? "s" : ""} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

export function clearAllData() {
  if (!isBrowser) return
  localStorage.clear()
  window.location.reload()
}
