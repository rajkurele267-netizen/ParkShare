import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Page not found — ParkShare')
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-6xl font-bold text-brand-500">404</p>
      <h1 className="mt-4 text-2xl font-bold text-navy-950">This page took a wrong turn</h1>
      <p className="mt-2 text-slate-600">The page you are looking for does not exist or was moved.</p>
      <Link to="/" className="mt-8 inline-block rounded-lg bg-navy-950 px-5 py-2.5 font-semibold text-white hover:bg-navy-800">Back to home</Link>
    </div>
  )
}
