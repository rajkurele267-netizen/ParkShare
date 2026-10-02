import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import type { Role } from '../types'

export default function Unauthorized({ required }: { required?: Role }) {
  usePageTitle('Access denied — ParkShare')
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-600"><ShieldAlert aria-hidden /></div>
      <h1 className="mt-4 text-2xl font-bold text-navy-950">You don't have access to this page</h1>
      <p className="mt-2 text-slate-600">
        {required === 'owner' ? 'This area is for parking owners. Your account is a driver account.' : 'Your account type cannot open this page.'}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="rounded-lg bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800">Back to home</Link>
        <Link to="/listings" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-slate-100">Find Parking</Link>
      </div>
    </div>
  )
}
