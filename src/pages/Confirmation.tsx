import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { fetchBooking, type BookingWithSpace } from '../services/bookingService'
import { formatClock, formatDate, formatHours, formatPrice, isUuid } from '../utils/format'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import StatusBadge, { displayStatus } from '../components/StatusBadge'

export default function Confirmation() {
  usePageTitle('Booking confirmed — ParkShare')
  const { id = '' } = useParams()
  const { user } = useAuth()
  const [booking, setBooking] = useState<BookingWithSpace | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isUuid(id)) { setLoading(false); return }
    let cancelled = false
    setLoading(true); setFailed(false)
    fetchBooking(id)
      .then((b) => { if (!cancelled) setBooking(b) })
      .catch(() => { if (!cancelled) setFailed(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, attempt])

  if (loading) return <LoadingState text="Loading your booking…" />
  if (failed) return <ErrorState title="Unable to load booking" text="Please check your connection and try again." onRetry={() => setAttempt((a) => a + 1)} />
  // Only the person who made the booking sees this page.
  if (!booking || booking.user_id !== user?.id) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-navy-950">Booking not found</h1>
        <p className="mt-2 text-slate-600">We couldn't find this booking in your account.</p>
        <Link to="/my-bookings" className="mt-8 inline-block rounded-lg bg-navy-950 px-5 py-2.5 font-semibold text-white hover:bg-navy-800">View My Bookings</Link>
      </div>
    )
  }

  const space = booking.parking_spaces
  const rows: [string, string][] = [
    ['Booking ID', booking.id],
    ['Parking', space?.title ?? 'Parking space'],
    ['Location', space ? `${space.address}, ${space.area}, ${space.city}` : '—'],
    ['Date', formatDate(booking.start_time)],
    ['Start time', formatClock(booking.start_time)],
    ['End time', formatClock(booking.end_time)],
    ['Duration', formatHours(booking.total_hours)],
    ['Amount', formatPrice(booking.total_amount)],
  ]

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-500/10 text-brand-600"><CheckCircle2 className="h-8 w-8" aria-hidden /></div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-950">Parking booked successfully</h1>
        <p className="mt-2 text-slate-600">Your space is reserved. Keep this booking ID handy.</p>
      </div>

      <dl className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:justify-between sm:gap-6">
            <dt className="text-sm text-slate-500">{k}</dt>
            <dd className="break-all text-sm font-medium text-navy-950 sm:text-right">{v}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between py-3.5">
          <dt className="text-sm text-slate-500">Status</dt>
          <dd><StatusBadge status={displayStatus(booking.status, booking.end_time)} /></dd>
        </div>
      </dl>
      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-600">Online payment isn't available yet. This is a reservation, and no payment has been taken.</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/my-bookings" className="rounded-lg bg-brand-500 px-6 py-3 font-semibold text-navy-950 hover:bg-brand-400">View My Bookings</Link>
        <Link to={`/listings/${booking.parking_space_id}`} className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-navy-950 hover:bg-slate-100">Back to Parking</Link>
      </div>
    </div>
  )
}
