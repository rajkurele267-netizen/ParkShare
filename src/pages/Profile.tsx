import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import FormField from '../components/FormField'

export default function Profile() {
  usePageTitle('Profile — ParkShare')
  const { profile, refreshProfile } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(profile?.full_name ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    if (name.trim().length < 2) { setError('Enter your full name.'); return }
    setError(''); setBusy(true)
    const { error: err } = await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', profile.id)
    setBusy(false)
    if (err) { toast.error('Unable to save your profile. Please try again.'); return }
    await refreshProfile()
    toast.success('Profile updated.')
  }

  if (!profile) return null
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight text-navy-950">Your profile</h1>
      <form onSubmit={save} noValidate className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <FormField label="Full name" name="name" value={name} onChange={(e) => setName(e.target.value)} error={error} maxLength={100} />
        <FormField label="Email" name="email" value={profile.email} readOnly disabled />
        <FormField label="Account type" name="role" value={profile.role === 'owner' ? 'Parking Owner' : 'Driver'} readOnly disabled />
        <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy-950 px-4 py-2.5 font-semibold text-white hover:bg-navy-800 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} {busy ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
