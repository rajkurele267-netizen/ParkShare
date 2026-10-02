import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CalendarCheck, CheckCircle2, IndianRupee, MapPin, Plus, ParkingSquare, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { deleteSpace, fetchOwnerBookings, fetchOwnerSpaces, removeSpaceImage, setSpaceAvailability, type OwnerBooking } from '../services/ownerService'
import type { ParkingSpace } from '../types'
import { formatClock, formatDate, formatPrice, formatTime } from '../utils/format'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import SmartImage from '../components/SmartImage'
import StatusBadge, { displayStatus } from '../components/StatusBadge'

function Stat({ icon: Icon, label, value, note }: { icon: typeof Building2; label: string; value: string | number; note?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600"><Icon className="h-5 w-5" aria-hidden /></div>
        <p className="text-sm text-slate-600">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold text-navy-950">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  )
}

export default function OwnerDashboard() {
  usePageTitle('Owner Dashboard — ParkShare')
  const { user, profile } = useAuth()
  const toast = useToast()
  const [spaces, setSpaces] = useState<ParkingSpace[]>([])
  const [bookings, setBookings] = useState<OwnerBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [toDelete, setToDelete] = useState<ParkingSpace | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setFailed(false)
    try {
      const s = await fetchOwnerSpaces(user.id)
      const b = await fetchOwnerBookings(s.map((x) => x.id))
      setSpaces(s); setBookings(b)
    } catch { setFailed(true) } finally { setLoading(false) }
  }, [user])
  useEffect(() => { load() }, [load])

  async function toggle(space: ParkingSpace) {
    setToggling(space.id)
    try {
      await setSpaceAvailability(space.id, !space.is_available)
      toast.success(space.is_available ? 'Listing deactivated. Drivers can no longer see it.' : 'Listing is live again.')
      await load()
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Something went wrong.') }
    finally { setToggling(null) }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteSpace(toDelete.id)
      await removeSpaceImage(toDelete.image_url)
      toast.success('Parking space deleted.')
      setToDelete(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete this space.')
      setToDelete(null)
    } finally { setDeleting(false) }
  }

  if (loading) return <LoadingState text="Loading your dashboard…" />
  if (failed) return <ErrorState title="Unable to load your dashboard" text="Please check your connection and try again." onRetry={load} />

  const counted = bookings.filter((b) => b.status !== 'cancelled')
  const earnings = counted.reduce((sum, b) => sum + Number(b.total_amount), 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy-950">Owner dashboard</h1>
          {profile?.full_name && <p className="mt-1 text-slate-600">Welcome back, {profile.full_name}.</p>}
        </div>
        <Link to="/owner/add" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 font-semibold text-navy-950 hover:bg-brand-400"><Plus className="h-4 w-4" aria-hidden /> Add parking</Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Building2} label="Total listings" value={spaces.length} />
        <Stat icon={CheckCircle2} label="Active listings" value={spaces.filter((s) => s.is_available).length} />
        <Stat icon={CalendarCheck} label="Total bookings" value={counted.length} note="Excludes cancelled" />
        <Stat icon={IndianRupee} label="Total earnings" value={formatPrice(earnings)} note="Booked value. Online payments aren't enabled yet." />
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-navy-950">My parking spaces</h2>
        {spaces.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={<ParkingSquare />} title="You haven't listed a space yet" text="Add your first parking space and drivers can start booking it."
              action={<Link to="/owner/add" className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-brand-400">Add parking</Link>} />
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {spaces.map((s) => (
              <li key={s.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                <SmartImage src={s.image_url} alt={s.title} className="h-32 w-full shrink-0 rounded-xl sm:w-32" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-navy-950">{s.title}</h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${s.is_available ? 'bg-brand-500/10 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>{s.is_available ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-4 w-4 shrink-0" aria-hidden />{s.area}, {s.city}</p>
                  <p className="mt-1 text-sm text-slate-600">{formatPrice(s.price_per_hour)}/hr · {formatTime(s.available_from)} – {formatTime(s.available_to)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
                    <Link to={`/owner/edit/${s.id}`} className="inline-flex items-center gap-1 text-brand-600 hover:underline"><Pencil className="h-3.5 w-3.5" aria-hidden /> Edit</Link>
                    <button onClick={() => toggle(s)} disabled={toggling === s.id} className="text-slate-700 hover:underline disabled:opacity-50">{s.is_available ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => setToDelete(s)} className="inline-flex items-center gap-1 text-red-600 hover:underline"><Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete</button>
                    <Link to={`/listings/${s.id}`} className="text-slate-500 hover:underline">View</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-navy-950">Recent bookings</h2>
        {bookings.length === 0 ? (
          <div className="mt-4"><EmptyState icon={<CalendarCheck />} title="No bookings yet" text="When a driver books one of your spaces, it will appear here." /></div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Parking</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 20).map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-medium text-navy-950">{b.parking_spaces?.title ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{b.profiles?.full_name || 'Customer'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDate(b.start_time)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatClock(b.start_time)} – {formatClock(b.end_time)}</td>
                    <td className="px-4 py-3 font-semibold text-navy-950">{formatPrice(b.total_amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={displayStatus(b.status, b.end_time)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog open={Boolean(toDelete)} busy={deleting} title="Delete this parking space?" cancelLabel="Keep it"
        message={`"${toDelete?.title ?? ''}" will be permanently removed. If it already has bookings it can't be deleted; deactivate it instead.`}
        confirmLabel="Yes, delete" onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  )
}
