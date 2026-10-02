import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

interface NavItem { to: string; label: string }

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  // Links depend on who is logged in (role comes from the database profile).
  let links: NavItem[]
  if (user && profile?.role === 'owner') {
    links = [
      { to: '/listings', label: 'Find Parking' },
      { to: '/owner', label: 'Owner Dashboard' },
      { to: '/owner/add', label: 'Add Parking' },
      { to: '/profile', label: 'Profile' },
    ]
  } else if (user) {
    links = [
      { to: '/listings', label: 'Find Parking' },
      { to: '/my-bookings', label: 'My Bookings' },
      { to: '/profile', label: 'Profile' },
    ]
  } else {
    links = [
      { to: '/listings', label: 'Find Parking' },
      { to: '/register?role=owner', label: 'List Your Space' },
      { to: '/how-it-works', label: 'How It Works' },
      { to: '/about', label: 'About' },
    ]
  }

  async function logout() {
    setOpen(false)
    await signOut()
    toast.success('You have been logged out.')
    navigate('/')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-brand-400' : 'text-slate-300 hover:text-white'}`

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Logo light />
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>)}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {profile && <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-medium capitalize text-slate-300">{profile.role}</span>}
              <button onClick={logout} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white">Login</Link>
              <Link to="/register" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-brand-400">Get Started</Link>
            </>
          )}
        </div>
        <button className="rounded-lg p-2 text-white md:hidden" onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-white/10 bg-navy-950 px-4 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={({ isActive }) =>
                `rounded-lg px-3 py-3 text-base font-medium ${isActive ? 'bg-white/10 text-brand-400' : 'text-slate-200'}`}>{l.label}</NavLink>
            ))}
            {user ? (
              <button onClick={logout} className="mt-2 rounded-lg border border-white/20 px-4 py-3 text-center font-semibold text-white">Logout</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-slate-200">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="mt-2 rounded-lg bg-brand-500 px-4 py-3 text-center font-semibold text-navy-950">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
