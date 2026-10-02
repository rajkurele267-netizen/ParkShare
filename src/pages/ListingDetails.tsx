import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Car, Clock, ExternalLink, MapPin, ScrollText, User } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import { fetchListing, fetchOwnerName } from '../services/parkingService'
import type { ParkingSpace } from '../types'
import { VEHICLE_LABEL, formatTime, isUuid, mapsUrl } from '../utils/format'
import BookingPanel from '../components/BookingPanel'
import SmartImage from '../components/SmartImage'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

export default function ListingDetails() {
  const { id = '' } = useParams()
  const [space, setSpace] = useState<ParkingSpace | null>(null)
  const [ownerName, setOwnerName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  usePageTitle(space ? `${space.title} — ParkShare` : 'Parking — ParkShare')

  useEffect(() => {
    if (!isUuid(id)) { setSpace(null); setLoading(false); return }
    let cancelled = false
    setLoading(true); setFailed(false)
    fetchListing(id)
      .then(async (s) => {
        if (cancelled) return
        setSpace(s)
        if (s) { const name = await fetchOwnerName(s.owner_id); if (!cancelled) setOwnerName(name) }
      })
      .catch(() => { if (!cancelled) setFailed(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, attempt])

  if (loading) return <LoadingState text="Loading parking details…" />
  if (failed) return <ErrorState title="Unable to load parking" text="We couldn't reach the server. Please try again." onRetry={() => setAttempt((a) => a + 1)} />
  if (!space) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-navy-950">Parking space not found</h1>
        <p className="mt-2 text-slate-600">It may have been removed or is no longer available.</p>
        <Link to="/listings" className="mt-8 inline-block rounded-lg bg-navy-950 px-5 py-2.5 font-semibold text-white hover:bg-navy-800">Find Parking</Link>
      </div>
    )
  }

  const detail = (Icon: typeof Car, label: string, value: string) => (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-600"><Icon className="h-4 w-4" aria-hidden /></div>
      <div><p className="text-xs text-slate-500">{label}</p><p className="text-sm font-medium text-navy-950">{value}</p></div>
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/listings" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy-950"><ArrowLeft className="h-4 w-4" aria-hidden /> Back to parking</Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <SmartImage src={space.image_url} alt={space.title} className="h-64 w-full rounded-2xl sm:h-96" />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy-950">{space.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-slate-600"><MapPin className="h-4 w-4 shrink-0" aria-hidden />{space.address}, {space.area}, {space.city}</p>
          <a href={mapsUrl(space.address, space.area, space.city)} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">View on Map <ExternalLink className="h-3.5 w-3.5" aria-hidden /></a>

          <div className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
            {detail(Car, 'Vehicle type', VEHICLE_LABEL[space.vehicle_type])}
            {detail(Clock, 'Available hours (daily)', `${formatTime(space.available_from)} – ${formatTime(space.available_to)}`)}
            {ownerName && detail(User, 'Listed by', ownerName)}
          </div>

          {space.description && (<section className="mt-8"><h2 className="text-lg font-semibold text-navy-950">About this space</h2><p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{space.description}</p></section>)}
          {space.rules && (<section className="mt-8"><h2 className="flex items-center gap-2 text-lg font-semibold text-navy-950"><ScrollText className="h-5 w-5" aria-hidden /> Parking rules</h2><p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{space.rules}</p></section>)}
        </div>

        <BookingPanel space={space} />
      </div>
    </div>
  )
}
