import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'
import Unauthorized from '../pages/Unauthorized'

/** Blocks a page unless the user is signed in (and has the required role, if one is given). */
export default function ProtectedRoute({ role, children }: { role?: Role; children: ReactNode }) {
  const { user, profile, loading, profileError, refreshProfile } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingState text="Checking your session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (profileError || !profile) {
    return <ErrorState title="Unable to load your account" text="Please check your connection and try again." onRetry={refreshProfile} />
  }
  if (role && profile.role !== role) return <Unauthorized required={role} />
  return <>{children}</>
}
