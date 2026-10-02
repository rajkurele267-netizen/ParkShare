import type { VehicleType } from '../types'

export const VEHICLE_LABEL: Record<VehicleType, string> = {
  car: 'Car', bike: 'Bike / Scooter', suv: 'SUV', any: 'Any vehicle',
}

/** '07:00:00' -> '7:00 AM' */
export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 === 0 ? 12 : h % 12
  return `${hr}:${String(m).padStart(2, '0')} ${suffix}`
}

export const formatPrice = (n: number) => `₹${Number.isInteger(Number(n)) ? Number(n) : Number(n).toFixed(2)}`

export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

export const mapsUrl = (address: string, area: string, city: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${area}, ${city}`)}`

// ---- Date/time display. ParkShare works in India Standard Time, whatever the browser's timezone is.
const TZ = 'Asia/Kolkata'
export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
export const formatClock = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso)).toUpperCase()
/** 'YYYY-MM-DD' of an instant, in IST */
export const istDate = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(iso))
/** 'HH:MM' (24h) of an instant, in IST */
export const istClock = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))
export const formatHours = (h: number) => `${Number(h)} hour${Number(h) === 1 ? '' : 's'}`
