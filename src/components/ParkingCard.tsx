import { Link } from 'react-router-dom'
import { MapPin, Car, Clock } from 'lucide-react'
import SmartImage from './SmartImage'
import type { ParkingSpace } from '../types'
import { VEHICLE_LABEL, formatPrice, formatTime } from '../utils/format'

export default function ParkingCard({ space }: { space: ParkingSpace }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <SmartImage src={space.image_url} alt={space.title} className="h-44 w-full" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug text-navy-950">{space.title}</h3>
          <p className="shrink-0 font-bold text-brand-600">{formatPrice(space.price_per_hour)}<span className="text-xs font-medium text-slate-500">/hr</span></p>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-4 w-4 shrink-0" aria-hidden />{space.area}, {space.city}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><Clock className="h-4 w-4 shrink-0" aria-hidden />{formatTime(space.available_from)} – {formatTime(space.available_to)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700"><Car className="h-3.5 w-3.5" aria-hidden />{VEHICLE_LABEL[space.vehicle_type]}</span>
          <span className={`rounded-full px-2.5 py-1 font-medium ${space.is_available ? 'bg-brand-500/10 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>{space.is_available ? 'Available' : 'Unavailable'}</span>
        </div>
        <div className="mt-auto pt-5"><Link to={`/listings/${space.id}`} className="block rounded-lg bg-navy-950 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-navy-800">View Details</Link></div>
      </div>
    </article>
  )
}
