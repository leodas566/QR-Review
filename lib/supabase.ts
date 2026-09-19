import { createClient } from "@supabase/supabase-js"

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export const CAFE_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Business = {
  id: string
  name: string
  location: string
  google_review_url: string
  logo_url: string | null
  admin_email: string
  admin_password: string
}

export type Customer = {
  id: string
  cafe_id: string
  name: string
  phone: string
  visit_count: number
  last_visit: string
  created_at: string
}

export type Review = {
  id: string
  cafe_id: string
  customer_id: string | null
  rating: number
  food_rating: number | null
  service_rating: number | null
  atmosphere_rating: number | null
  review_text: string | null
  review_copied: boolean
  created_at: string
  customers?: Customer
}

export type MenuItem = {
  id: string
  cafe_id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  is_available: boolean
  is_must_try: boolean
  veg_nonveg: "veg" | "nonveg"
  sort_order: number
  created_at: string
  updated_at: string
}

export type InstagramSettings = {
  id: string
  cafe_id: string
  instagram_url: string
  username: string
  follower_count: string
  preview_images: string[]
  total_clicks: number
}

export type Template = {
  id: string
  cafe_id: string
  name: string
  category: string
  message: string
  created_at: string
}

export type Campaign = {
  id: string
  cafe_id: string
  template_id: string | null
  template_name: string | null
  segment: string
  total_sent: number
  delivered_count: number
  failed_count: number
  status: "pending" | "sending" | "completed" | "failed" | "scheduled"
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
}

// ─── Business ─────────────────────────────────────────────────────────────────

export async function getBusiness(): Promise<Business | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", CAFE_ID)
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateBusiness(updates: Partial<Business>) {
  const { data, error } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", CAFE_ID)
    .select()
    .single()
  if (error) console.error(error)
  return data
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function upsertCustomer(name: string, phone: string): Promise<Customer | null> {
  // Check if customer exists
  const { data: existing } = await supabase
    .from("customers")
    .select("*")
    .eq("cafe_id", CAFE_ID)
    .eq("phone", phone)
    .single()

  if (existing) {
    // Update visit count + last visit
    const { data } = await supabase
      .from("customers")
      .update({
        name,
        visit_count: existing.visit_count + 1,
        last_visit: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single()
    return data
  }

  // New customer
  const { data, error } = await supabase
    .from("customers")
    .insert({ cafe_id: CAFE_ID, name, phone })
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("cafe_id", CAFE_ID)
    .order("last_visit", { ascending: false })
  if (error) { console.error(error); return [] }
  return data ?? []
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function insertReview(review: {
  customer_id?: string
  rating: number
  food_rating?: number
  service_rating?: number
  atmosphere_rating?: number
  review_text?: string
}): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({ cafe_id: CAFE_ID, ...review })
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function markReviewCopied(reviewId: string) {
  await supabase.from("reviews").update({ review_copied: true }).eq("id", reviewId)
}

export async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, customers(name, phone)")
    .eq("cafe_id", CAFE_ID)
    .order("created_at", { ascending: false })
  if (error) { console.error(error); return [] }
  return data ?? []
}

// ─── Instagram ────────────────────────────────────────────────────────────────

export async function getInstagram(): Promise<InstagramSettings | null> {
  const { data, error } = await supabase
    .from("instagram_settings")
    .select("*")
    .eq("cafe_id", CAFE_ID)
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateInstagram(updates: Partial<InstagramSettings>) {
  const { data, error } = await supabase
    .from("instagram_settings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("cafe_id", CAFE_ID)
    .select()
    .single()
  if (error) console.error(error)
  return data
}

export async function trackInstagramClick() {
  const current = await getInstagram()
  if (!current) return
  await supabase
    .from("instagram_settings")
    .update({ total_clicks: (current.total_clicks ?? 0) + 1 })
    .eq("cafe_id", CAFE_ID)
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export async function getMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("cafe_id", CAFE_ID)
    .order("sort_order")
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function insertMenuItem(item: Omit<MenuItem, "id" | "cafe_id" | "created_at" | "updated_at">): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from("menu_items")
    .insert({ cafe_id: CAFE_ID, ...item })
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>) {
  const { data, error } = await supabase
    .from("menu_items")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) console.error(error)
  return data
}

export async function deleteMenuItem(id: string) {
  const { error } = await supabase.from("menu_items").delete().eq("id", id)
  if (error) console.error(error)
}

export function subscribeToMenu(callback: () => void) {
  const channel = supabase
    .channel("menu_realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, callback)
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function getTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("cafe_id", CAFE_ID)
    .order("created_at", { ascending: false })
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function insertTemplate(t: { name: string; category: string; message: string }): Promise<Template | null> {
  const { data, error } = await supabase
    .from("templates")
    .insert({ cafe_id: CAFE_ID, ...t })
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateTemplate(id: string, updates: Partial<Template>) {
  const { data, error } = await supabase
    .from("templates")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) console.error(error)
  return data
}

export async function deleteTemplate(id: string) {
  await supabase.from("templates").delete().eq("id", id)
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function getCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("cafe_id", CAFE_ID)
    .order("created_at", { ascending: false })
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function insertCampaign(c: {
  template_id?: string
  template_name?: string
  segment: string
  total_sent: number
  scheduled_at?: string
}): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      cafe_id: CAFE_ID,
      status: c.scheduled_at ? "scheduled" : "pending",
      ...c,
    })
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateCampaignStatus(
  id: string,
  status: Campaign["status"],
  extra?: Partial<Campaign>
) {
  await supabase.from("campaigns").update({ status, ...extra }).eq("id", id)
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string): Promise<boolean> {
  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", CAFE_ID)
    .eq("admin_email", email)
    .eq("admin_password", password)
    .single()
  return !!data
}
