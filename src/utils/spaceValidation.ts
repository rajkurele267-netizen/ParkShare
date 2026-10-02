import type { VehicleType } from '../types'

export interface SpaceFormValues {
  title: string; description: string; rules: string
  address: string; area: string; city: string
  price: string; vehicle: VehicleType
  from: string; to: string // 'HH:MM'
  isAvailable: boolean
}

export type SpaceErrors = Partial<Record<keyof SpaceFormValues, string>>

/** Mirrors the CHECK constraints in supabase/schema.sql so users get clear messages before the database does. */
export function validateSpace(v: SpaceFormValues): SpaceErrors {
  const e: SpaceErrors = {}
  const len = (s: string) => s.trim().length
  if (len(v.title) < 3 || len(v.title) > 100) e.title = 'Title must be 3 to 100 characters.'
  if (len(v.address) < 5 || len(v.address) > 300) e.address = 'Enter the full address (5 to 300 characters).'
  if (len(v.area) < 2 || len(v.area) > 100) e.area = 'Enter the area or neighbourhood.'
  if (len(v.city) < 2 || len(v.city) > 100) e.city = 'Enter the city.'
  const price = Number(v.price)
  if (v.price.trim() === '' || Number.isNaN(price) || price <= 0) e.price = 'Enter a price greater than 0.'
  else if (price > 10000) e.price = 'Price can be at most ₹10,000 per hour.'
  else if (Math.round(price * 100) !== price * 100 && Math.abs(Math.round(price * 100) - price * 100) > 1e-6) e.price = 'Use at most 2 decimal places.'
  if (!v.from) e.from = 'Choose when the space opens.'
  if (!v.to) e.to = 'Choose when the space closes.'
  if (v.from && v.to && v.from >= v.to) e.to = 'Closing time must be after opening time.'
  if (v.description.length > 2000) e.description = 'Description can be at most 2000 characters.'
  if (v.rules.length > 1000) e.rules = 'Rules can be at most 1000 characters.'
  return e
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateImage(file: { type: string; size: number }): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Use a JPG, PNG or WebP image.'
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be 5 MB or smaller.'
  return null
}
