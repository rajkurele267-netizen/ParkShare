/** Turns raw Supabase/network errors into messages that are safe and useful to show users. */
export function friendlyAuthError(err: { message?: string } | null | undefined): string {
  const m = (err?.message ?? '').toLowerCase()
  if (!m) return 'Something went wrong. Please try again.'
  if (m.includes('invalid login credentials')) return 'Incorrect email or password.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'An account with this email already exists. Try logging in.'
  if (m.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox for the confirmation link.'
  if (m.includes('password') && m.includes('characters')) return 'Your password is too short. Use at least 8 characters.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a minute and try again.'
  if (m.includes('fetch') || m.includes('network')) return 'Unable to reach the server. Check your internet connection and try again.'
  return 'Something went wrong. Please try again.'
}

export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
