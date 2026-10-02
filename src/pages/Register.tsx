import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Car, KeyRound, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { friendlyAuthError, isValidEmail } from '../utils/errors'
import { usePageTitle } from '../hooks/usePageTitle'
import FormField from '../components/FormField'
import type { Role } from '../types'

const roles: { value: Role; title: string; text: string; icon: typeof Car }[] = [
  { value: 'driver', title: 'Driver', text: 'Find and book parking', icon: Car },
  { value: 'owner', title: 'Parking Owner', text: 'List and manage spaces', icon: KeyRound },
]

export default function Register() {
  usePageTitle('Create account — ParkShare')
  const { user, profile, signUp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [role, setRole] = useState<Role>(params.get('role') === 'owner' ? 'owner' : 'driver')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  if (user && profile) return <Navigate to={profile.role === 'owner' ? '/owner' : '/listings'} replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (fullName.trim().length < 2) next.name = 'Enter your full name.'
    if (!isValidEmail(email.trim())) next.email = 'Enter a valid email address.'
    if (password.length < 8) next.password = 'Use at least 8 characters.'
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    const { error, needsConfirmation } = await signUp({ fullName: fullName.trim(), email: email.trim(), password, role })
    setBusy(false)
    if (error) { setErrors({ form: friendlyAuthError(error) }); return }
    if (needsConfirmation) { setConfirmSent(true); return }
    toast.success('Account created. Welcome to ParkShare!')
    navigate(role === 'owner' ? '/owner' : '/listings', { replace: true })
  }

  if (confirmSent) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-950">Check your email</h1>
        <p className="mt-3 text-slate-600">We sent a confirmation link to <strong>{email}</strong>. Click it, then log in.</p>
        <Link to="/login" className="mt-8 inline-block rounded-lg bg-navy-950 px-5 py-2.5 font-semibold text-white hover:bg-navy-800">Go to login</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight text-navy-950">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">Find a spot or share one. It takes a minute.</p>
      {!isSupabaseConfigured && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Supabase is not configured. Add your keys to the .env file and restart the dev server.</p>}
      <form onSubmit={submit} noValidate className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {errors.form && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors.form}</p>}
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">I want to</legend>
          <div className="grid grid-cols-2 gap-3">
            {roles.map(({ value, title, text, icon: Icon }) => (
              <label key={value} className={`cursor-pointer rounded-xl border p-3 text-center transition ${role === value ? 'border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/20' : 'border-slate-300 hover:border-slate-400'}`}>
                <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} className="sr-only" />
                <Icon className={`mx-auto h-6 w-6 ${role === value ? 'text-brand-600' : 'text-slate-500'}`} aria-hidden />
                <span className="mt-1 block text-sm font-semibold text-navy-950">{title}</span>
                <span className="block text-xs text-slate-500">{text}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <FormField label="Full name" name="name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.name} maxLength={100} />
        <FormField label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <FormField label="Password (min. 8 characters)" name="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 font-semibold text-navy-950 hover:bg-brand-400 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Log in</Link></p>
    </div>
  )
}
