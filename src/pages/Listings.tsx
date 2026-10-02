import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, SearchX, ParkingSquare } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import { fetchListings, type ListingFilters, type SortKey } from '../services/parkingService'
import type { ParkingSpace, VehicleType } from '../types'
import { VEHICLE_LABEL, formatTime } from '../utils/format'
import ParkingCard from '../components/ParkingCard'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'

const num = (v: string | null) => (v !== null && v !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0 ? Number(v) : undefined)

export default function Listings() {
  usePageTitle('Find Parking — ParkShare')
  const [params, setParams] = useSearchParams()

  // The URL is the source of truth, so filtered results can be shared, bookmarked and survive refresh.
  const q = params.get('q') ?? ''
  const vehicle = (['car', 'bike', 'suv'].includes(params.get('vehicle') ?? '') ? params.get('vehicle') : '') as VehicleType | ''
  const minRaw = params.get('min') ?? ''
  const maxRaw = params.get('max') ?? ''
  const time = /^\d{2}:\d{2}$/.test(params.get('time') ?? '') ? (params.get('time') as string) : ''
  const sort = (['price_asc', 'price_desc'].includes(params.get('sort') ?? '') ? params.get('sort') : 'newest') as SortKey

  // Local text state so typing stays smooth; pushed into the URL after a short pause.
  const [qInput, setQInput] = useState(q)
  const [minInput, setMinInput] = useState(minRaw)
  const [maxInput, setMaxInput] = useState(maxRaw)
  const [showFilters, setShowFilters] = useState(false)

  const [spaces, setSpaces] = useState<ParkingSpace[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const setParam = useCallback((changes: Record<string, string>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [k, v] of Object.entries(changes)) { if (v) next.set(k, v); else next.delete(k) }
      return next
    }, { replace: true })
  }, [setParams])

  useEffect(() => {
    const t = setTimeout(() => {
      if (qInput.trim() !== q || minInput !== minRaw || maxInput !== maxRaw) setParam({ q: qInput.trim(), min: minInput, max: maxInput })
    }, 350)
    return () => clearTimeout(t)
  }, [qInput, minInput, maxInput, q, minRaw, maxRaw, setParam])

  const min = num(minRaw)
  const max = num(maxRaw)
  const priceInvalid = min !== undefined && max !== undefined && min > max

  useEffect(() => {
    if (priceInvalid) { setSpaces([]); setLoading(false); setFailed(false); return }
    let cancelled = false
    setLoading(true); setFailed(false)
    const filters: ListingFilters = { q, vehicle, minPrice: min, maxPrice: max, time: time || undefined, sort }
    fetchListings(filters)
      .then((rows) => { if (!cancelled) setSpaces(rows) })
      .catch(() => { if (!cancelled) setFailed(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [q, vehicle, min, max, time, sort, priceInvalid, attempt])

  const hasFilters = Boolean(q || vehicle || minRaw || maxRaw || time)
  function clearAll() {
    setQInput(''); setMinInput(''); setMaxInput('')
    setParams({}, { replace: true })
  }

  const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <label htmlFor="vehicle" className="mb-1.5 block text-sm font-medium text-slate-700">Vehicle type</label>
        <select id="vehicle" className={input} value={vehicle} onChange={(e) => setParam({ vehicle: e.target.value })}>
          <option value="">Any vehicle</option>
          {(['car', 'bike', 'suv'] as const).map((v) => <option key={v} value={v}>{VEHICLE_LABEL[v]}</option>)}
        </select>
      </div>
      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Price per hour (₹)</span>
        <div className="flex items-center gap-2">
          <input aria-label="Minimum price" type="number" min={0} inputMode="numeric" placeholder="Min" className={input} value={minInput} onChange={(e) => setMinInput(e.target.value)} />
          <span className="text-slate-400">–</span>
          <input aria-label="Maximum price" type="number" min={0} inputMode="numeric" placeholder="Max" className={input} value={maxInput} onChange={(e) => setMaxInput(e.target.value)} />
        </div>
        {priceInvalid && <p className="mt-1.5 text-xs text-red-600">Minimum price can't be higher than maximum.</p>}
      </div>
      <div>
        <label htmlFor="time" className="mb-1.5 block text-sm font-medium text-slate-700">Open at</label>
        <input id="time" type="time" className={input} value={time} onChange={(e) => setParam({ time: e.target.value })} />
        <p className="mt-1 text-xs text-slate-500">Only show spaces open at this time of day.</p>
      </div>
      {hasFilters && <button onClick={clearAll} className="text-sm font-semibold text-brand-600 hover:underline">Clear all filters</button>}
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-navy-950">Find parking</h1>
      <p className="mt-1 text-slate-600">Search by area, city or street, then filter by vehicle and price.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <label className="flex min-w-0 flex-1 basis-64 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
          <Search className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
          <span className="sr-only">Search location</span>
          <input value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="Area, city, street or name" className="w-full min-w-0 bg-transparent text-sm outline-none" />
          {qInput && <button type="button" aria-label="Clear search" onClick={() => setQInput('')}><X className="h-4 w-4 text-slate-400" /></button>}
        </label>
        <div>
          <label htmlFor="sort" className="sr-only">Sort by</label>
          <select id="sort" value={sort} onChange={(e) => setParam({ sort: e.target.value === 'newest' ? '' : e.target.value })}
            className="h-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium lg:hidden">
          <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
        </button>
      </div>

      {showFilters && <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 lg:hidden">{filterPanel}</div>}

      {time && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600">
          Open at {formatTime(`${time}:00`)}
          <button aria-label="Remove time filter" onClick={() => setParam({ time: '' })}><X className="h-3.5 w-3.5" /></button>
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:block" aria-label="Filters">{filterPanel}</aside>

        <section aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading parking">
              {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />)}
            </div>
          ) : failed ? (
            <ErrorState title="Unable to load parking" text="We couldn't reach the server. Check your connection and try again." onRetry={() => setAttempt((a) => a + 1)} />
          ) : spaces.length === 0 ? (
            hasFilters ? (
              <EmptyState icon={<SearchX />} title="No parking spaces found" text="Nothing matches your search and filters. Try a different area or loosen the filters."
                action={<button onClick={clearAll} className="rounded-lg bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800">Clear filters</button>} />
            ) : (
              <EmptyState icon={<ParkingSquare />} title="No parking spaces found yet" text="Spaces added by owners will appear here. Own a space? Be the first to list it."
                action={<Link to="/owner/add" className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-brand-400">List Your Space</Link>} />
            )
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-600">{spaces.length} space{spaces.length === 1 ? '' : 's'} found</p>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{spaces.map((s) => <ParkingCard key={s.id} space={s} />)}</div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
