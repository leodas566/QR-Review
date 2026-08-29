import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          location: string
          google_review_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          google_review_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          google_review_url?: string
          updated_at?: string
        }
      }
      scans: {
        Row: {
          id: string
          business_id: string
          rating: number
          review_copied: boolean
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          rating: number
          review_copied?: boolean
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          rating?: number
          review_copied?: boolean
          timestamp?: string
        }
      }
    }
  }
}

// Helper functions
export async function trackScan(businessId: string, rating: number) {
  const { data, error } = await supabase
    .from('scans')
    .insert({
      business_id: businessId,
      rating,
      review_copied: false,
      timestamp: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error tracking scan:', error)
    return null
  }

  return data
}

export async function trackCopy(scanId: string) {
  const { data, error } = await supabase
    .from('scans')
    .update({ review_copied: true })
    .eq('id', scanId)
    .select()
    .single()

  if (error) {
    console.error('Error tracking copy:', error)
    return null
  }

  return data
}

export async function getBusinessStats(businessId: string) {
  const { data: scans, error } = await supabase
    .from('scans')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching stats:', error)
    return null
  }

  const totalScans = scans.length
  const totalCopied = scans.filter(s => s.review_copied).length

  // Rating breakdown
  const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  scans.forEach(scan => {
    ratingBreakdown[scan.rating] = (ratingBreakdown[scan.rating] || 0) + 1
  })

  // Weekly scans (last 7 days) — index 0 = Mon, 6 = Sun of current week
  const now = new Date()
  const weeklyScans = Array(7).fill(0)
  scans.forEach(scan => {
    const scanDate = new Date(scan.created_at)
    const daysDiff = Math.floor((now.getTime() - scanDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff < 7) {
      weeklyScans[6 - daysDiff]++
    }
  })

  // Previous week scans (days 7–13 ago) — for real growth calculation
  const prevWeekScans = Array(7).fill(0)
  scans.forEach(scan => {
    const scanDate = new Date(scan.created_at)
    const daysDiff = Math.floor((now.getTime() - scanDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff >= 7 && daysDiff < 14) {
      prevWeekScans[13 - daysDiff]++
    }
  })

  const currentWeekTotal = weeklyScans.reduce((a, b) => a + b, 0)
  const prevWeekTotal = prevWeekScans.reduce((a, b) => a + b, 0)

  // Monthly reviews (last 4 months)
  const monthlyReviews = Array(4).fill(0)
  scans.forEach(scan => {
    if (scan.review_copied) {
      const scanDate = new Date(scan.created_at)
      const monthsDiff =
        (now.getFullYear() - scanDate.getFullYear()) * 12 +
        (now.getMonth() - scanDate.getMonth())
      if (monthsDiff < 4) {
        monthlyReviews[3 - monthsDiff]++
      }
    }
  })

  return {
    totalScans,
    totalCopied,
    ratingBreakdown,
    weeklyScans,
    monthlyReviews,
    currentWeekTotal,
    prevWeekTotal,
    recentScans: scans.slice(0, 10),
  }
}

export async function getBusiness(businessId: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (error) {
    console.error('Error fetching business:', error)
    return null
  }

  return data
}

export async function updateBusiness(
  businessId: string,
  updates: Database['public']['Tables']['businesses']['Update']
) {
  const { data, error } = await supabase
    .from('businesses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', businessId)
    .select()
    .single()

  if (error) {
    console.error('Error updating business:', error)
    return null
  }

  return data
}

// Real-time subscription
export function subscribeToScans(businessId: string, callback: (payload: any) => void) {
  const channel = supabase
    .channel(`scans:business_id=eq.${businessId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'scans',
        filter: `business_id=eq.${businessId}`
      },
      callback
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
