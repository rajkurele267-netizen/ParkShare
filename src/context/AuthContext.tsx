import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Profile, Role } from '../types'

interface SignUpInput { fullName: string; email: string; password: string; role: Role }
interface SignUpResult { error: Error | null; needsConfirmation: boolean }

interface AuthState {
  user: User | null
  profile: Profile | null
  /** true while we are checking for an existing session or loading the profile */
  loading: boolean
  profileError: boolean
  signUp: (input: SignUpInput) => Promise<SignUpResult>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessionLoading, setSessionLoading] = useState(isSupabaseConfigured)
  const [profileError, setProfileError] = useState(false)

  // 1. Restore the session on page load (this is what keeps you logged in after refresh) and listen for changes.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => sub.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id ?? null

  const loadProfile = useCallback(async (id: string) => {
    setProfileError(false)
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    if (error || !data) setProfileError(true)
    setProfile((data as Profile | null) ?? null)
  }, [])

  // 2. Load the profile (role comes from the database, never from the browser).
  useEffect(() => {
    if (!userId) { setProfile(null); setProfileError(false); return }
    setProfileError(false)
    loadProfile(userId)
  }, [userId, loadProfile])

  const signUp: AuthState['signUp'] = useCallback(async ({ fullName, email, password, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName, role } },
    })
    return { error, needsConfirmation: !error && !data.session }
  }, [])

  const signIn: AuthState['signIn'] = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  const signOut = useCallback(async () => { await supabase.auth.signOut() }, [])
  const refreshProfile = useCallback(async () => { if (userId) await loadProfile(userId) }, [userId, loadProfile])

  const value = useMemo<AuthState>(() => ({
    user: session?.user ?? null,
    profile,
    // Still loading until we have the profile that belongs to the logged-in user (or it failed to load).
    loading: sessionLoading || (Boolean(userId) && profile?.id !== userId && !profileError),
    profileError,
    signUp, signIn, signOut, refreshProfile,
  }), [session, profile, sessionLoading, profileError, userId, signUp, signIn, signOut, refreshProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
