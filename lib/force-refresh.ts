/**
 * Force refresh utility - clears all cached data and reloads from Supabase
 */

export function forceRefresh() {
  if (typeof window === "undefined") return
  
  console.log("🔄 Force refreshing - clearing all cached data...")
  
  // Clear all localStorage except login status
  const isLoggedIn = localStorage.getItem("isLoggedIn")
  const ownerEmail = localStorage.getItem("ownerEmail") 
  const ownerPassword = localStorage.getItem("ownerPassword")
  
  localStorage.clear()
  
  // Restore login info
  if (isLoggedIn) localStorage.setItem("isLoggedIn", isLoggedIn)
  if (ownerEmail) localStorage.setItem("ownerEmail", ownerEmail)
  if (ownerPassword) localStorage.setItem("ownerPassword", ownerPassword)
  
  // Set fresh start marker
  localStorage.setItem("configVersion", "fresh-start-v1")
  localStorage.setItem("forceRefreshed", "true")
  
  // Reload page to start fresh
  window.location.reload()
}

export function isForceRefreshed(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("forceRefreshed") === "true"
}

export function clearForceRefreshFlag() {
  if (typeof window === "undefined") return
  localStorage.removeItem("forceRefreshed")
}