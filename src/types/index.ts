export type Role = 'driver' | 'owner'
export type VehicleType = 'car' | 'bike' | 'suv' | 'any'
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'payment_pending' | 'payment_completed'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: Role
  created_at: string
}

export interface ParkingSpace {
  id: string
  owner_id: string
  title: string
  description: string | null
  rules: string | null
  address: string
  area: string
  city: string
  latitude: number | null
  longitude: number | null
  price_per_hour: number
  vehicle_type: VehicleType
  available_from: string // 'HH:MM:SS'
  available_to: string
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id: string
  parking_space_id: string
  start_time: string
  end_time: string
  total_hours: number
  total_amount: number
  status: BookingStatus
  payment_status: PaymentStatus
  created_at: string
}
