import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ParkingSquare } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { ParkingSpace } from '../types'
import ParkingCard from './ParkingCard'
import EmptyState from './EmptyState'

export default function FeaturedParking() {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    supabase.from('parking_spaces').select('*').eq('is_available', true)
      .order('created_at', { ascending: false }).limit(3)
      .then(({ data }) => { if (!cancelled) { setSpaces((data as ParkingSpace[]) ?? []); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />)}</div>
  }
  if (spaces.length === 0) {
    return (
      <EmptyState icon={<ParkingSquare />} title="No parking spaces listed yet"
        text="Spaces added by owners appear here. Have an unused spot? Be among the first to list it."
        action={<Link to="/owner/add" className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-brand-400">List Your Space</Link>} />
    )
  }
  return <div className="grid gap-6 md:grid-cols-3">{spaces.map((s) => <ParkingCard key={s.id} space={s} />)}</div>
}
