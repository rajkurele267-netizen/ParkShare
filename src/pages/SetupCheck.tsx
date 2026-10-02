import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { usePageTitle } from '../hooks/usePageTitle'

type Result = { label: string; ok: boolean | null; hint: string }

/** Developer helper at /setup-check: confirms .env and the database schema are wired up. */
export default function SetupCheck() {
  usePageTitle('Setup check — ParkShare')
  const [results, setResults] = useState<Result[]>([])
  const [running, setRunning] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function run() {
      const out: Result[] = []
      out.push({ label: 'Environment variables found', ok: isSupabaseConfigured,
        hint: 'Create a .env file (copy .env.example) with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart npm run dev.' })

      if (isSupabaseConfigured) {
        const tables = await supabase.from('parking_spaces').select('id', { count: 'exact', head: true })
        out.push({ label: 'Database tables reachable', ok: !tables.error,
          hint: 'Run supabase/schema.sql in the Supabase SQL Editor. Also check the URL and anon key are correct.' })

        const rpc = await supabase.rpc('busy_slots', { p_space_id: '00000000-0000-0000-0000-000000000000' })
        out.push({ label: 'Booking functions installed', ok: !rpc.error,
          hint: 'Run the whole supabase/schema.sql file again; the functions are near the end.' })

        const owners = await supabase.from('owner_public').select('id', { head: true, count: 'exact' })
        out.push({ label: 'Owner view installed', ok: !owners.error, hint: 'Run the whole supabase/schema.sql file again.' })

        const session = await supabase.auth.getSession()
        out.push({ label: 'Auth service reachable', ok: !session.error, hint: 'Check VITE_SUPABASE_URL is your project URL.' })
      }
      if (!cancelled) { setResults(out); setRunning(false) }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const allOk = results.length > 0 && results.every((r) => r.ok)

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <h1 className="text-2xl font-bold text-navy-950">Setup check</h1>
      <p className="mt-1 text-sm text-slate-600">Confirms ParkShare can talk to your Supabase project.</p>
      <ul className="mt-8 space-y-3">
        {running && <li className="flex items-center gap-2 text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> Checking…</li>}
        {results.map((r) => (
          <li key={r.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 font-medium">
              {r.ok ? <CheckCircle2 className="h-5 w-5 text-brand-600" /> : <XCircle className="h-5 w-5 text-red-500" />}
              {r.label}
            </div>
            {!r.ok && <p className="mt-2 text-sm text-slate-600">{r.hint}</p>}
          </li>
        ))}
      </ul>
      {!running && allOk && <p className="mt-6 rounded-lg bg-brand-500/10 p-4 text-sm font-medium text-brand-600">All good. Supabase is connected and the schema is installed.</p>}
    </div>
  )
}
