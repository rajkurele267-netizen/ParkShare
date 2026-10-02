# ParkShare

**Find a spot. Share a spot.** ParkShare is a two-sided parking marketplace: drivers find and book parking, and owners list unused spaces and track bookings and earnings.

> Status: working MVP. Payments are **not** integrated yet. Bookings are reservations stored with `payment_pending`.

## Features

**Drivers**
- Register, log in, stay logged in after refresh
- Search parking by area, city, street or name; filter by vehicle type, price and open time; sort by price or newest
- Listing details with price, hours, rules, owner name and a Google Maps link
- Pick date and time, see the live total, and book. Overlapping bookings are blocked by the database
- Confirmation page and "My Bookings" with cancellation up to 2 hours before the start

**Owners**
- Register as a Parking Owner
- Add, edit, activate/deactivate and delete listings, with image upload
- Dashboard with total/active listings, bookings, earnings (booked value) and a recent-bookings table

**Security**
- Supabase Auth, Row Level Security on every table
- Prices are calculated on the server. Browsers cannot insert bookings or change their own role
- Protected routes for logged-in pages and owner-only pages

## Tech stack
React 19 · Vite · TypeScript · Tailwind CSS 4 · React Router 7 · Supabase (Auth, PostgreSQL, Storage) · Vitest · Deployed on Vercel

## Folder structure
```
parkshare/
├─ supabase/
│  ├─ schema.sql        tables, RLS policies, booking functions, storage bucket
│  └─ seed.sql          optional demo listings
├─ src/
│  ├─ components/       Navbar, Footer, ParkingCard, BookingPanel, SpaceForm, ProtectedRoute ...
│  ├─ context/          AuthContext, ToastContext
│  ├─ layouts/          MainLayout
│  ├─ pages/            Home, Listings, ListingDetails, Login, Register, MyBookings, OwnerDashboard ...
│  ├─ services/         all database calls (parking, booking, owner)
│  ├─ utils/            pricing/validation rules + tests, formatting
│  ├─ types/  hooks/  lib/supabase.ts
├─ vercel.json          SPA routing for React Router
├─ .env.example
└─ package.json
```

## Local setup

Requirements: Node.js 20 or newer, a free Supabase account.

```bash
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```
Fill in `.env` (see below), then:
```bash
npm run dev               # http://localhost:5173
```

## Environment variables

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase -> Project Settings -> API -> Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase -> Project Settings -> API -> `anon` / publishable key |

Only the public anon key is used in the app. **Never** put the `service_role` / secret key in this project. `.env` is git-ignored.

## Database setup (Supabase)

1. Create a project at supabase.com.
2. SQL Editor -> New query -> paste all of `supabase/schema.sql` -> Run. (Safe to run again.)
3. Authentication -> Sign In / Providers -> Email: switch **Confirm email** off for easy testing, or leave it on for production (users must then click the email link).
4. Register an owner account in the app, then run `supabase/seed.sql` to add demo listings (optional).
5. Visit `/setup-check` in the running app. All four checks should be green.

The schema also creates a public image bucket `parking-images`. Only owners can upload, into a folder named after their own user id.

## Commands

```bash
npm run dev       # development server
npm test          # unit tests for pricing, booking and form rules
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build locally
```

## Deploy to Vercel

1. Push the project to a GitHub repository (`.env` is ignored, so no secrets are uploaded).
2. vercel.com -> Add New -> Project -> import the repository. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output directory `dist`.
3. Before deploying, open **Environment Variables** and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values as your `.env`.
4. Click **Deploy**.
5. In Supabase -> Authentication -> URL Configuration, set **Site URL** to your Vercel URL (for example `https://parkshare.vercel.app`) and add it under **Redirect URLs**. This matters if email confirmation is on.
6. Open `https://your-app.vercel.app/setup-check` to confirm the live site reaches Supabase.

`vercel.json` rewrites every path to `index.html`, so refreshing `/listings` or `/owner` works.

## Business rules
- Hours are daily and interpreted in India Standard Time (IST)
- A booking must start and end on the same day, inside the space's hours, and in the future
- Overlapping bookings on the same space are rejected by the database
- Cancel your own booking up to 2 hours before it starts
- You cannot book your own space
- A listing with bookings cannot be deleted, only deactivated
- Bookings stay `payment_pending`. Nothing is charged

## Known limitations
- No online payments yet (Razorpay/Stripe planned). Earnings figures are booked value, not collected money
- No map view or distance sorting. Coordinates are stored but not collected
- Availability is one daily time window per listing, not per-day or per-date
- No email/SMS notifications
- No reviews or ratings
- Owners can also book other owners' spaces
- Booking history is only deletable by deleting the account

## Roadmap
1. Razorpay payments (`payment_status` is already modelled)
2. Map search with coordinates and "near me"
3. Per-day availability and blocked dates
4. Booking notifications for owners and drivers
5. Reviews and owner verification
6. Owner payouts and earnings reports
