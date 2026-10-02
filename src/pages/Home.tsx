import { Link } from 'react-router-dom'
import { Search, ListChecks, CalendarCheck, IndianRupee, Clock, ShieldCheck, LayoutDashboard, TrendingUp, Eye, Lock, MapPin } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/AuthContext'
import SearchBar from '../components/SearchBar'
import ParkingIllustration from '../components/ParkingIllustration'
import FeaturedParking from '../components/FeaturedParking'

const steps = [
  { icon: Search, title: 'Search', text: 'Enter where you are headed and when you need to park.' },
  { icon: ListChecks, title: 'Choose', text: 'Compare spaces by area, vehicle type and hourly price.' },
  { icon: CalendarCheck, title: 'Book', text: 'Pick your time slot and reserve it. The total is shown before you book.' },
]
const driver = [
  { icon: Clock, title: 'Find parking faster', text: 'See which spaces are available near your destination before you set off.' },
  { icon: IndianRupee, title: 'Transparent pricing', text: 'The hourly rate and your total are shown up front. No guesswork at the gate.' },
  { icon: CalendarCheck, title: 'Convenient booking', text: 'Choose a date and time, reserve, and keep every booking in one place.' },
]
const owner = [
  { icon: TrendingUp, title: 'Monetize unused space', text: 'Turn a driveway, garage or reserved bay into income when you are not using it.' },
  { icon: LayoutDashboard, title: 'Manage availability', text: 'Set your hours, price and vehicle type. Edit or pause a listing any time.' },
  { icon: Eye, title: 'Track bookings', text: 'See who booked, when, and how much your spaces have earned.' },
]
const trust = [
  { icon: Lock, title: 'Secure accounts', text: 'Real authentication, and your booking data is visible only to you.' },
  { icon: ShieldCheck, title: 'Owner-controlled listings', text: 'Only the owner of a space can edit or remove it.' },
  { icon: MapPin, title: 'Clear location details', text: 'Every listing shows its address and area, with a map link.' },
]

function Features({ items }: { items: typeof driver }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-600"><Icon className="h-5 w-5" aria-hidden /></div>
          <h3 className="mt-4 font-semibold text-navy-950">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
        </div>
      ))}
    </div>
  )
}

function Heading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-slate-600">{text}</p>}
    </div>
  )
}

export default function Home() {
  usePageTitle('ParkShare — Find & Share Parking')
  const { user } = useAuth()
  return (
    <>
      <section className="bg-navy-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:pb-24 lg:pt-20">
          <div>
            <p className="inline-block rounded-full border border-brand-400/30 px-3 py-1 text-xs font-semibold text-brand-400">Find a spot. Share a spot.</p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Parking should be simple.</h1>
            <p className="mt-5 max-w-lg text-lg text-slate-300">Find convenient parking near you or turn your unused parking space into a source of income.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/listings" className="rounded-lg bg-brand-500 px-6 py-3 font-semibold text-navy-950 hover:bg-brand-400">Find Parking</Link>
              <Link to="/owner/add" className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10">List Your Space</Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md lg:max-w-none"><ParkingIllustration /></div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-0 sm:px-6"><div className="translate-y-1/2"><SearchBar /></div></div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-24" id="how">
        <Heading eyebrow="How ParkShare works" title="From search to parked in three steps" />
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="absolute right-5 top-4 text-5xl font-bold text-slate-100">{i + 1}</span>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy-950 text-brand-400"><Icon className="h-5 w-5" aria-hidden /></div>
              <h3 className="mt-4 font-semibold text-navy-950">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Heading eyebrow="For drivers" title="Know where you will park before you arrive" />
        <Features items={driver} />
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Heading eyebrow="For space owners" title="Your empty space can earn" text="If you have a space that sits unused for part of the day, ParkShare helps you list it and manage it." />
          <Features items={owner} />
          <Link to="/owner/add" className="mt-8 inline-block rounded-lg bg-navy-950 px-6 py-3 font-semibold text-white hover:bg-navy-800">List Your Space</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <Heading eyebrow="Featured parking" title="Newly listed spaces" />
          <Link to="/listings" className="mb-10 hidden text-sm font-semibold text-brand-600 hover:underline sm:block">View all →</Link>
        </div>
        <FeaturedParking />
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Heading eyebrow="Trust & safety" title="Built with your data protected" />
          <Features items={trust} />
        </div>
      </section>

      <section className="bg-navy-950 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Have an unused parking space?</h2>
          <p className="mt-3 text-lg text-slate-300">List it on ParkShare.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!user && <Link to="/register" className="rounded-lg bg-brand-500 px-6 py-3 font-semibold text-navy-950 hover:bg-brand-400">Get Started</Link>}
            <Link to="/listings" className={`rounded-lg px-6 py-3 font-semibold ${user ? 'bg-brand-500 text-navy-950 hover:bg-brand-400' : 'border border-white/20 hover:bg-white/10'}`}>Find Parking</Link>
          </div>
        </div>
      </section>
    </>
  )
}
