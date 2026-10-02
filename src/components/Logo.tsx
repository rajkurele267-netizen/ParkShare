import { Link } from 'react-router-dom'

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight" aria-label="ParkShare home">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-navy-950 font-extrabold">P</span>
      <span className={light ? 'text-white' : 'text-navy-950'}>Park<span className="text-brand-500">Share</span></span>
    </Link>
  )
}
