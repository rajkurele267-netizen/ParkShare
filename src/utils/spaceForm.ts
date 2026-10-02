import type { VehicleType } from '../types'

export interface SpaceFormValues {
  title: string; description: string; rules: string
  address: string; area: string; city: string
  price: string; vehicle_type: VehicleType
  available_from: string; available_to: string // 'HH:MM'
  is_available: boolean
}

export type SpaceFormErrors = Partial<Record<keyof SpaceFormValues | 'image', string>>

export const emptySpaceForm: SpaceFormValues = {
  title: '', description: '', rules: '', address: '', area: '', city: '',
  price: '', vehicle_type: 'car', available_from: '06:00', available_to: '22:00', is_available: true,
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Mirrors the database constraints so people get friendly messages before anything is sent. */
export function validateSpaceForm(v: SpaceFormValues, file?: { type: string; size: number } | null): SpaceFormErrors {
  const e: SpaceFormErrors = {}
  const len = (s: string) => s.trim().length
  if (len(v.title) < 3 || len(v.title) > 100) e.title = 'Enter a title (3–100 characters).'
  if (len(v.description) > 2000) e.description = 'Description is too long (max 2000 characters).'
  if (len(v.rules) > 1000) e.rules = 'Rules are too long (max 1000 characters).'
  if (len(v.address) < 5 || len(v.address) > 300) e.address = 'Enter the full address (5–300 characters).'
  if (len(v.area) < 2 || len(v.area) > 100) e.area = 'Enter the area or neighbourhood.'
  if (len(v.city) < 2 || len(v.city) > 100) e.city = 'Enter the city.'
  const price = Number(v.price)
  if (v.price.trim() === '' || Number.isNaN(price) || price <= 0 || price > 10000) e.price = 'Enter a price between ₹1 and ₹10,000 per hour.'
  else if (Math.round(price * 100) !== price * 100 && Math.abs(Math.round(price * 100) - price * 100) > 1e-6) e.price = 'Use at most 2 decimal places.'
  if (!v.available_from || !v.available_to) e.available_to = 'Choose when the space opens and closes.'
  else if (v.available_from >= v.available_to) e.available_to = 'Closing time must be after opening time.'
  if (file) {
    if (!IMAGE_TYPES.includes(file.type)) e.image = 'Use a JPG, PNG or WebP image.'
    else if (file.size > MAX_IMAGE_BYTES * 4) e.image = 'That image is too large. Choose one under 20 MB.'
  }
  return e
}
