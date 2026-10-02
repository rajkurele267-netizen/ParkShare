import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

function Flow({ title, steps, cta }: { title: string; steps: [string, string][]; cta: { to: string; label: string } }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-navy-950">{title}</h2>
      <ol className="mt-6 space-y-5">
        {steps.map(([t, d], i) => (
          <li key={t} className="flex gap-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500 font-bold text-navy-950">{i + 1}</span>
            <div><h3 className="font-semibold text-navy-950">{t}</h3><p className="text-sm text-slate-600">{d}</p></div>
          </li>
        ))}
      </ol>
      <Link to={cta.to} className="mt-8 inline-block rounded-lg bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800">{cta.label}</Link>
    </section>
  )
}

export default function HowItWorks() {
  usePageTitle('How It Works — ParkShare')
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-navy-950">How ParkShare works</h1>
      <p className="mt-3 max-w-2xl text-slate-600">One marketplace, two sides. Drivers find a space; owners earn from one.</p>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Flow title="For drivers" cta={{ to: '/listings', label: 'Find Parking' }} steps={[
          ['Search', 'Search by area or city and filter by vehicle type and price.'],
          ['Compare', 'Check price, availability and details for each space.'],
          ['Book', 'Choose a date and time. The total is calculated before you confirm.'],
          ['Park', 'Use your booking confirmation and the address to find your space.'],
        ]} />
        <Flow title="For space owners" cta={{ to: '/owner/add', label: 'List Your Space' }} steps={[
          ['List', 'Add a photo, location, price per hour and vehicle type.'],
          ['Set availability', 'Choose the hours your space is open for booking.'],
          ['Receive bookings', 'See each booking on your dashboard.'],
          ['Earn', 'Track bookings and total earnings in one place.'],
        ]} />
      </div>
    </div>
  )
}
