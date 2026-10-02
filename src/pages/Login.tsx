import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { friendlyAuthError, isValidEmail } from '../utils/errors'
import { usePageTitle } from '../hooks/usePageTitle'
import FormField from '../components/FormField'

export default function Login() {
  usePageTitle('Log in — ParkShare')
  const { user, profile, signIn } = useAuth()
  const toast = useToast()
  const from = (useLocation().state as { from?: string } | null)?.from
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  if (user && profile) return <Navigate to={from ?? (profile.role === 'owner' ? '/owner' : '/listings')} replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!isValidEmail(email.trim())) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) { setErrors({ form: friendlyAuthError(error) }); return }
    toast.success('Welcome back!') // the redirect happens above once the profile has loaded
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight text-navy-950">Log in</h1>
      <p className="mt-2 text-sm text-slate-600">Welcome back to ParkShare.</p>
      {!isSupabaseConfigured && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Supabase is not configured. Add your keys to the .env file and restart the dev server.</p>}
      <form onSubmit={submit} noValidate className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {errors.form && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors.form}</p>}
        <FormField label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <FormField label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 font-semibold text-navy-950 hover:bg-brand-400 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">New to ParkShare? <Link to="/register" className="font-semibold text-brand-600 hover:underline">Create an account</Link></p>
    </div>
  )
}
