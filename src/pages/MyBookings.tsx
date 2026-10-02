import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarX2, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { cancelBooking, fetchMyBookings, type BookingWithSpace } from '../services/bookingService'
import { canCancel } from '../utils/booking'
import { formatClock, formatDate, formatHours, formatPrice } from '../utils/format'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import SmartImage from '../components/SmartImage'
import StatusBadge, { displayStatus } from '../components/StatusBadge'

export default function MyBookings() {
  usePageTitle('My Bookings — ParkShare')
  const { user } = useAuth()
  const toast = useToast()
  const [bookings, setBookings] = useState<BookingWithSpace[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [toCancel, setToCancel] = useState<BookingWithSpace | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true); setFailed(false)
    try { setBookings(await fetchMyBookings(user.id)) } catch { setFailed(true) } finally { setLoading(false) }
  }, [user])
  useEffect(() => { load() }, [load])

  async function confirmCancel() {
    if (!toCancel) return
    setCancelling(true)
    try {
      await cancelBooking(toCancel.id)
      toast.success('Booking cancelled.')
      setToCancel(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to cancel. Please try again.')
      setToCancel(null)
      await load()
    } finally { setCancelling(false) }
  }

  if (loading) return <LoadingState text="Loading your bookings…" />
  if (failed) return <ErrorState title="Unable to load your bookings" text="Please check your connection and try again." onRetry={load} />

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-navy-950">My bookings</h1>
      <p className="mt-1 text-slate-600">Cancel free of charge up to 2 hours before a booking starts.</p>

      {bookings.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={<CalendarX2 />} title="No bookings yet" text="When you book a parking space it will show up here."
            action={<Link to="/listings" className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-brand-400">Find Parking</Link>} />
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {bookings.map((b) => {
            const space = b.parking_spaces
            const status = displayStatus(b.status, b.end_time)
            return (
              <li key={b.id} className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                <SmartImage src={space?.image_url} alt={space?.title ?? 'Parking'} className="h-32 w-full shrink-0 rounded-xl sm:h-auto sm:w-36" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold text-navy-950">{space?.title ?? 'Parking space'}</h2>
                    <StatusBadge status={status} />
                  </div>
                  {space && <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-4 w-4 shrink-0" aria-hidden />{space.area}, {space.city}</p>}
                  <p className="mt-2 text-sm text-slate-700">{formatDate(b.start_time)} · {formatClock(b.start_time)} – {formatClock(b.end_time)} ({formatHours(b.total_hours)})</p>
                  <p className="mt-1 text-sm font-semibold text-navy-950">{formatPrice(b.total_amount)} <span className="font-normal text-slate-500">· payment pending</span></p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Link to={`/confirmation/${b.id}`} className="text-sm font-semibold text-brand-600 hover:underline">View details</Link>
                    {canCancel(b.start_time, b.status) && (
                      <button onClick={() => setToCancel(b)} className="text-sm font-semibold text-red-600 hover:underline">Cancel booking</button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog open={Boolean(toCancel)} busy={cancelling} title="Cancel this booking?"
        message={toCancel ? `${toCancel.parking_spaces?.title ?? 'This booking'} on ${formatDate(toCancel.start_time)}, ${formatClock(toCancel.start_time)} – ${formatClock(toCancel.end_time)}. This can't be undone.` : ''}
        confirmLabel="Yes, cancel booking" onConfirm={confirmCancel} onCancel={() => setToCancel(null)} />
    </div>
  )
}
