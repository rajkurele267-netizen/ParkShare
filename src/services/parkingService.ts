import { supabase } from '../lib/supabase'
import type { ParkingSpace, VehicleType } from '../types'

export type SortKey = 'newest' | 'price_asc' | 'price_desc'

export interface ListingFilters {
  q?: string
  vehicle?: VehicleType | ''
  minPrice?: number
  maxPrice?: number
  /** 'HH:MM' - only spaces open at this time of day */
  time?: string
  sort?: SortKey
}

/** Removes characters that have a special meaning inside a PostgREST or-filter or ilike pattern. */
const cleanSearch = (s: string) => s.replace(/[%*,()"\\]/g, ' ').replace(/\s+/g, ' ').trim()

export async function fetchListings(f: ListingFilters): Promise<ParkingSpace[]> {
  let query = supabase.from('parking_spaces').select('*').eq('is_available', true)

  const term = f.q ? cleanSearch(f.q) : ''
  if (term) {
    query = query.or(`title.ilike.%${term}%,area.ilike.%${term}%,city.ilike.%${term}%,address.ilike.%${term}%`)
  }
  // A space marked "Any vehicle" fits every vehicle filter.
  if (f.vehicle) query = query.in('vehicle_type', [f.vehicle, 'any'])
  if (f.minPrice !== undefined) query = query.gte('price_per_hour', f.minPrice)
  if (f.maxPrice !== undefined) query = query.lte('price_per_hour', f.maxPrice)
  if (f.time) query = query.lte('available_from', f.time).gt('available_to', f.time)

  switch (f.sort) {
    case 'price_asc': query = query.order('price_per_hour', { ascending: true }); break
    case 'price_desc': query = query.order('price_per_hour', { ascending: false }); break
    default: query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query.limit(60)
  if (error) throw error
  return (data ?? []) as ParkingSpace[]
}

export async function fetchListing(id: string): Promise<ParkingSpace | null> {
  const { data, error } = await supabase.from('parking_spaces').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as ParkingSpace | null) ?? null
}

/** Public owner display name (no email or other personal data). */
export async function fetchOwnerName(ownerId: string): Promise<string | null> {
  const { data } = await supabase.from('owner_public').select('full_name').eq('id', ownerId).maybeSingle()
  return (data?.full_name as string | undefined) || null
}
