import { describe, it, expect } from 'vitest'
import { calcPrice, validateBooking, toIsoIST, overlapsBusy, canCancel } from '../booking'

const now = new Date('2026-10-05T04:30:00Z') // 10:00 IST on 5 Oct 2026
const base = { availableFrom: '07:00:00', availableTo: '22:00:00', now }

describe('calcPrice', () => {
  it('multiplies hours by rate', () => expect(calcPrice('10:00', '13:00', 40)).toEqual({ hours: 3, amount: 120 }))
  it('handles half hours', () => expect(calcPrice('10:00', '11:30', 45)).toEqual({ hours: 1.5, amount: 67.5 }))
  it('rejects end before start', () => expect(calcPrice('13:00', '10:00', 40)).toBeNull())
})

describe('validateBooking', () => {
  it('requires a date', () => expect(validateBooking({ ...base, date: '', start: '10:00', end: '11:00' })).toBe('Choose a date.'))
  it('rejects past dates', () => expect(validateBooking({ ...base, date: '2026-10-04', start: '10:00', end: '11:00' })).toMatch(/future/))
  it('rejects end before start', () => expect(validateBooking({ ...base, date: '2026-10-06', start: '12:00', end: '11:00' })).toMatch(/after/))
  it('rejects before opening', () => expect(validateBooking({ ...base, date: '2026-10-06', start: '06:00', end: '08:00' })).toMatch(/07:00/))
  it('rejects after closing', () => expect(validateBooking({ ...base, date: '2026-10-06', start: '21:00', end: '23:00' })).toMatch(/22:00/))
  it('rejects a start time already passed today', () => expect(validateBooking({ ...base, date: '2026-10-05', start: '09:00', end: '11:00' })).toBe('Start time must be in the future.'))
  it('accepts a valid booking', () => expect(validateBooking({ ...base, date: '2026-10-06', start: '10:00', end: '13:00' })).toBeNull())
})

describe('time zone and overlap', () => {
  it('reads times as India Standard Time', () => expect(new Date(toIsoIST('2026-10-06', '10:00')).toISOString()).toBe('2026-10-06T04:30:00.000Z'))
  const busy = [{ start_time: toIsoIST('2026-10-06', '10:00'), end_time: toIsoIST('2026-10-06', '12:00') }]
  it('detects overlap', () => expect(overlapsBusy(toIsoIST('2026-10-06', '11:00'), toIsoIST('2026-10-06', '13:00'), busy)).toBe(true))
  it('allows back-to-back bookings', () => expect(overlapsBusy(toIsoIST('2026-10-06', '12:00'), toIsoIST('2026-10-06', '13:00'), busy)).toBe(false))
})

describe('canCancel (2-hour rule)', () => {
  it('allows more than 2 hours ahead', () => expect(canCancel(toIsoIST('2026-10-05', '13:00'), 'confirmed', now)).toBe(true))
  it('blocks within 2 hours', () => expect(canCancel(toIsoIST('2026-10-05', '11:30'), 'confirmed', now)).toBe(false))
  it('blocks already cancelled', () => expect(canCancel(toIsoIST('2026-10-06', '11:30'), 'cancelled', now)).toBe(false))
})
