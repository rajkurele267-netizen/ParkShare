import { supabase } from '../lib/supabase'
import type { Booking, ParkingSpace } from '../types'

export type BookingWithSpace = Booking & {
  parking_spaces: Pick<ParkingSpace, 'title' | 'address' | 'area' | 'city' | 'image_url'> | null
}

export interface BusySlot { start_time: string; end_time: string }

const SPACE_FIELDS = 'parking_spaces(title,address,area,city,image_url)'

/** Maps the error codes raised by the database functions to messages for people. */
export function friendlyBookingError(err: { message?: string } | null | undefined): string {
  const m = err?.message ?? ''
  if (m.includes('SLOT_TAKEN')) return 'Sorry, that time slot was just booked. Please choose another time.'
  if (m.includes('SPACE_UNAVAILABLE')) return 'This parking space is no longer available.'
  if (m.includes('OWN_SPACE')) return "You can't book your own parking space."
  if (m.includes('INVALID_TIME_RANGE')) return 'End time must be after the start time.'
  if (m.includes('START_IN_PAST')) return 'Start time must be in the future.'
  if (m.includes('MUST_BE_SAME_DAY')) return 'A booking must start and end on the same day.'
  if (m.includes('OUTSIDE_AVAILABILITY')) return "That time is outside this space's available hours."
  if (m.includes('NOT_AUTHENTICATED')) return 'Please log in to continue.'
  if (m.includes('TOO_LATE_TO_CANCEL')) return 'Bookings can only be cancelled up to 2 hours before they start.'
  if (m.includes('NOT_CANCELLABLE')) return 'This booking can no longer be cancelled.'
  if (m.includes('BOOKING_NOT_FOUND')) return 'Booking not found.'
  if (/fetch|network/i.test(m)) return 'Unable to reach the server. Check your connection and try again.'
  return 'Booking failed. Please try again.'
}

export async function createBooking(spaceId: string, startIso: string, endIso: string): Promise<Booking> {
  const { data, error } = await supabase.rpc('create_booking', { p_space_id: spaceId, p_start: startIso, p_end: endIso })
  if (error) throw new Error(friendlyBookingError(error))
  return data as Booking
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_booking', { p_booking_id: bookingId })
  if (error) throw new Error(friendlyBookingError(error))
}

export async function fetchBusySlots(spaceId: string): Promise<BusySlot[]> {
  const { data, error } = await supabase.rpc('busy_slots', { p_space_id: spaceId })
  if (error) throw error
  return (data ?? []) as BusySlot[]
}

export async function fetchMyBookings(userId: string): Promise<BookingWithSpace[]> {
  const { data, error } = await supabase.from('bookings').select(`*, ${SPACE_FIELDS}`)
    .eq('user_id', userId).order('start_time', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as BookingWithSpace[]
}

export async function fetchBooking(id: string): Promise<BookingWithSpace | null> {
  const { data, error } = await supabase.from('bookings').select(`*, ${SPACE_FIELDS}`).eq('id', id).maybeSingle()
  if (error) throw error
  return (data as unknown as BookingWithSpace | null) ?? null
}
