import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import HowItWorks from './pages/HowItWorks'
import About from './pages/About'
import NotFound from './pages/NotFound'
const SetupCheck = lazy(() => import('./pages/SetupCheck'))
import Login from './pages/Login'
import Register from './pages/Register'
const Profile = lazy(() => import('./pages/Profile'))
const Listings = lazy(() => import('./pages/Listings'))
const ListingDetails = lazy(() => import('./pages/ListingDetails'))
const Confirmation = lazy(() => import('./pages/Confirmation'))
const MyBookings = lazy(() => import('./pages/MyBookings'))
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'))
const AddParking = lazy(() => import('./pages/AddParking'))
const EditParking = lazy(() => import('./pages/EditParking'))

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="about" element={<About />} />
        <Route path="setup-check" element={<SetupCheck />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Public */}
        <Route path="listings" element={<Listings />} />
        <Route path="listings/:id" element={<ListingDetails />} />

        {/* Any logged-in user */}
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="confirmation/:id" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />

        {/* Owners only */}
        <Route path="owner" element={<ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>} />
        <Route path="owner/add" element={<ProtectedRoute role="owner"><AddParking /></ProtectedRoute>} />
        <Route path="owner/edit/:id" element={<ProtectedRoute role="owner"><EditParking /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
