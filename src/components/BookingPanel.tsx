import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import type { ParkingSpace } from '../types'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { calcPrice, overlapsBusy, todayIST, toIsoIST, validateBooking } from '../utils/booking'
import { formatClock, formatHours, formatPrice, formatTime, istDate } from '../utils/format'
import { createBooking, fetchBusySlots, type BusySlot } from '../services/bookingService'

export default function BookingPanel({ space }: { space: ParkingSpace }) {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [date, setDate] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [busySlots, setBusySlots] = useState<BusySlot[]>([])

  const loadBusy = () => fetchBusySlots(space.id).then(setBusySlots).catch(() => setBusySlots([]))
  useEffect(() => { loadBusy() }, [space.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const price = useMemo(() => calcPrice(start, end, space.price_per_hour), [start, end, space.price_per_hour])
  const slotsToday = busySlots.filter((s) => date && istDate(s.start_time) === date)
  const isOwnSpace = user?.id === space.owner_id
  const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const problem = validateBooking({ date, start, end, availableFrom: space.available_from, availableTo: space.available_to })
    if (problem) { setError(problem); return }
    const startIso = toIsoIST(date, start)
    const endIso = toIsoIST(date, end)
    if (overlapsBusy(startIso, endIso, busySlots)) { setError('That time overlaps an existing booking. Please choose another time.'); return }

    setBusy(true)
    try {
      const booking = await createBooking(space.id, startIso, endIso)
      toast.success('Parking booked successfully.')
      navigate(`/confirmation/${booking.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.')
      loadBusy()
      setBusy(false)
    }
  }

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24" aria-label="Book this space">
      <p className="text-3xl font-bold text-navy-950">{formatPrice(space.price_per_hour)}<span className="text-base font-medium text-slate-500"> / hour</span></p>
      <p className="mt-1 text-xs text-slate-500">Open daily {formatTime(space.available_from)} – {formatTime(space.available_to)} (IST)</p>

      {!space.is_available ? (
        <p className="mt-5 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">This space is currently unavailable.</p>
      ) : isOwnSpace ? (
        <p className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">This is your own listing. You can manage it from your dashboard.</p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          <div>
            <label htmlFor="b-date" className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
            <input id="b-date" type="date" min={todayIST()} value={date} onChange={(e) => setDate(e.target.value)} className={input} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="b-start" className="mb-1.5 block text-sm font-medium text-slate-700">Start time</label>
              <input id="b-start" type="time" step={900} value={start} onChange={(e) => setStart(e.target.value)} className={input} />
            </div>
            <div>
              <label htmlFor="b-end" className="mb-1.5 block text-sm font-medium text-slate-700">End time</label>
              <input id="b-end" type="time" step={900} value={end} onChange={(e) => setEnd(e.target.value)} className={input} />
            </div>
          </div>

          {slotsToday.length > 0 && (
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              <p className="font-semibold">Already booked on this date:</p>
              <ul className="mt-1 space-y-0.5">{slotsToday.map((s) => <li key={s.start_time}>{formatClock(s.start_time)} – {formatClock(s.end_time)}</li>)}</ul>
            </div>
          )}

          <div className="rounded-xl bg-slate-50 p-4 text-sm" aria-live="polite">
            {price ? (
              <>
                <div className="flex justify-between text-slate-600"><span>Duration</span><span>{formatHours(price.hours)}</span></div>
                <div className="mt-1 flex justify-between text-slate-600"><span>{formatHours(price.hours)} × {formatPrice(space.price_per_hour)}</span><span>{formatPrice(price.amount)}</span></div>
                <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-navy-950"><span>Total</span><span>{formatPrice(price.amount)}</span></div>
              </>
            ) : <p className="text-slate-500">Choose a start and end time to see your total.</p>}
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          {user ? (
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 font-semibold text-navy-950 hover:bg-brand-400 disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} {busy ? 'Booking…' : 'Book Parking'}
            </button>
          ) : (
            <Link to="/login" state={{ from: location.pathname }} className="block rounded-lg bg-navy-950 px-4 py-3 text-center font-semibold text-white hover:bg-navy-800">Log in to book</Link>
          )}
          <p className="text-center text-xs text-slate-500">This reserves the space. Online payment isn't available yet, so nothing is charged.</p>
        </form>
      )}
    </aside>
  )
}
