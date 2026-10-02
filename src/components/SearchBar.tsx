import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Search } from 'lucide-react'

export default function SearchBar() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    if (date) p.set('date', date)
    if (time) p.set('time', time)
    navigate(`/listings${p.toString() ? `?${p}` : ''}`)
  }

  const field = 'flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20'
  const input = 'w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400'

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-white p-3 shadow-xl sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]" role="search">
      <label className={field}><MapPin className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
        <span className="sr-only">Location</span>
        <input className={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Where do you need parking?" />
      </label>
      <label className={field}><Calendar className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
        <span className="sr-only">Date</span>
        <input type="date" className={input} value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label className={field}><Clock className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
        <span className="sr-only">Time</span>
        <input type="time" className={input} value={time} onChange={(e) => setTime(e.target.value)} />
      </label>
      <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-navy-950 hover:bg-brand-400 sm:col-span-2 lg:col-span-1">
        <Search className="h-4 w-4" aria-hidden /> Search
      </button>
    </form>
  )
}
