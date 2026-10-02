import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export default function About() {
  usePageTitle('About — ParkShare')
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-navy-950">About ParkShare</h1>
      <p className="mt-6 text-lg leading-relaxed text-slate-700">Cities have a parking problem that is partly a supply problem: plenty of private spaces sit empty for hours every day, while drivers circle blocks looking for somewhere to stop.</p>
      <h2 className="mt-10 text-2xl font-bold text-navy-950">Our mission</h2>
      <p className="mt-3 leading-relaxed text-slate-700">ParkShare aims to unlock underutilized parking capacity and make urban parking easier. We connect people who need parking with people who have space to spare, and make the price clear on both sides.</p>
      <h2 className="mt-10 text-2xl font-bold text-navy-950">Where we are</h2>
      <p className="mt-3 leading-relaxed text-slate-700">ParkShare is an early-stage product. We are building the core experience first: listing, discovery and booking, with online payments planned next.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/listings" className="rounded-lg bg-brand-500 px-5 py-2.5 font-semibold text-navy-950 hover:bg-brand-400">Find Parking</Link>
        <Link to="/owner/add" className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-navy-950 hover:bg-slate-100">List Your Space</Link>
      </div>
    </div>
  )
}
