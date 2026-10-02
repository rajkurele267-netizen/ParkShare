import { supabase } from '../lib/supabase'
import type { Booking, ParkingSpace } from '../types'
import type { SpaceFormValues } from '../utils/spaceValidation'

export type OwnerBooking = Booking & {
  parking_spaces: { title: string } | null
  profiles: { full_name: string } | null
}

const BUCKET = 'parking-images'

export async function fetchOwnerSpaces(ownerId: string): Promise<ParkingSpace[]> {
  const { data, error } = await supabase.from('parking_spaces').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ParkingSpace[]
}

export async function fetchOwnerBookings(spaceIds: string[]): Promise<OwnerBooking[]> {
  if (spaceIds.length === 0) return []
  const { data, error } = await supabase.from('bookings')
    .select('*, parking_spaces(title), profiles(full_name)')
    .in('parking_space_id', spaceIds).order('start_time', { ascending: false }).limit(200)
  if (error) throw error
  return (data ?? []) as unknown as OwnerBooking[]
}

/** Uploads into a folder named after the owner's user id (required by the storage policy). */
export async function uploadSpaceImage(ownerId: string, file: File): Promise<string> {
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${ownerId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: '31536000' })
  if (error) throw new Error('Image upload failed. Please try again.')
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/** Best-effort removal of an image we uploaded earlier. Never blocks the user. */
export async function removeSpaceImage(url: string | null | undefined) {
  if (!url) return
  const marker = `/${BUCKET}/`
  const i = url.indexOf(marker)
  if (i === -1) return
  await supabase.storage.from(BUCKET).remove([decodeURIComponent(url.slice(i + marker.length))]).catch(() => undefined)
}

const toRow = (v: SpaceFormValues) => ({
  title: v.title.trim(),
  description: v.description.trim() || null,
  rules: v.rules.trim() || null,
  address: v.address.trim(),
  area: v.area.trim(),
  city: v.city.trim(),
  price_per_hour: Number(v.price),
  vehicle_type: v.vehicle,
  available_from: `${v.from}:00`,
  available_to: `${v.to}:00`,
  is_available: v.isAvailable,
})

export async function createSpace(ownerId: string, v: SpaceFormValues, imageUrl: string | null): Promise<ParkingSpace> {
  const { data, error } = await supabase.from('parking_spaces').insert({ ...toRow(v), owner_id: ownerId, image_url: imageUrl }).select().single()
  if (error) throw new Error('Unable to save your parking space. Please try again.')
  return data as ParkingSpace
}

export async function updateSpace(id: string, v: SpaceFormValues, imageUrl: string | null): Promise<ParkingSpace> {
  const { data, error } = await supabase.from('parking_spaces').update({ ...toRow(v), image_url: imageUrl }).eq('id', id).select()
  if (error) throw new Error('Unable to save your changes. Please try again.')
  // Row Level Security silently matches 0 rows if the space isn't yours.
  if (!data || data.length === 0) throw new Error("You don't have permission to edit this space.")
  return data[0] as ParkingSpace
}

export async function setSpaceAvailability(id: string, isAvailable: boolean): Promise<void> {
  const { data, error } = await supabase.from('parking_spaces').update({ is_available: isAvailable }).eq('id', id).select('id')
  if (error || !data || data.length === 0) throw new Error('Unable to update this space. Please try again.')
}

export async function deleteSpace(id: string): Promise<void> {
  const { data, error } = await supabase.from('parking_spaces').delete().eq('id', id).select('id')
  if (error) {
    if (error.code === '23503') throw new Error("This space has bookings, so it can't be deleted. Deactivate it instead to stop new bookings.")
    throw new Error('Unable to delete this space. Please try again.')
  }
  if (!data || data.length === 0) throw new Error("You don't have permission to delete this space.")
}
