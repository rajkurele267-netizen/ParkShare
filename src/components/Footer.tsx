import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-400">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">Find a spot. Share a spot. ParkShare connects drivers with unused private parking, and helps owners earn from space that sits empty.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Drivers</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/listings">Find Parking</Link></li>
            <li><Link className="hover:text-white" to="/my-bookings">My Bookings</Link></li>
            <li><Link className="hover:text-white" to="/how-it-works">How It Works</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Owners</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/owner/add">Add Parking</Link></li>
            <li><Link className="hover:text-white" to="/owner">Owner Dashboard</Link></li>
            <li><Link className="hover:text-white" to="/about">About ParkShare</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} ParkShare. All rights reserved.</div>
    </footer>
  )
}
