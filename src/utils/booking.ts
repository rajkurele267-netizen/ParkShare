// Pure booking helpers (no React, no network) so the rules are easy to test.

const TZ = 'Asia/Kolkata'

export const todayIST = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(now)

export const nowClockIST = (now = new Date()) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(now)

/** ('2026-10-05', '14:30') -> '2026-10-05T14:30:00+05:30' */
export const toIsoIST = (date: string, time: string) => `${date}T${time}:00+05:30`

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export interface PriceBreakdown { hours: number; amount: number }

/** Mirrors the server: hours rounded to 2 decimals, amount = round(hours x rate, 2). */
export function calcPrice(start: string, end: string, pricePerHour: number): PriceBreakdown | null {
  if (!start || !end || minutes(end) <= minutes(start)) return null
  const hours = Math.round(((minutes(end) - minutes(start)) / 60) * 100) / 100
  return { hours, amount: Math.round(hours * pricePerHour * 100) / 100 }
}

interface ValidateInput {
  date: string; start: string; end: string
  availableFrom: string; availableTo: string // 'HH:MM' or 'HH:MM:SS'
  now?: Date
}

export function validateBooking({ date, start, end, availableFrom, availableTo, now = new Date() }: ValidateInput): string | null {
  if (!date) return 'Choose a date.'
  if (date < todayIST(now)) return 'Choose today or a future date.'
  if (!start || !end) return 'Choose a start time and an end time.'
  if (minutes(end) <= minutes(start)) return 'End time must be after the start time.'
  const from = availableFrom.slice(0, 5)
  const to = availableTo.slice(0, 5)
  if (minutes(start) < minutes(from) || minutes(end) > minutes(to)) return `This space is only available from ${from} to ${to}.`
  if (date === todayIST(now) && minutes(start) <= minutes(nowClockIST(now))) return 'Start time must be in the future.'
  return null
}

/** True if [startIso, endIso) overlaps any busy slot. */
export function overlapsBusy(startIso: string, endIso: string, busy: { start_time: string; end_time: string }[]) {
  const s = new Date(startIso).getTime()
  const e = new Date(endIso).getTime()
  return busy.some((b) => s < new Date(b.end_time).getTime() && e > new Date(b.start_time).getTime())
}

/** Cancellation rule (must match supabase/schema.sql): up to 2 hours before start. */
export const canCancel = (startIso: string, status: string, now = new Date()) =>
  status === 'confirmed' && new Date(startIso).getTime() >= now.getTime() + 2 * 60 * 60 * 1000
