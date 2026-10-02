import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ImagePlus, Loader2 } from 'lucide-react'
import FormField from './FormField'
import SmartImage from './SmartImage'
import { validateImage, validateSpace, type SpaceErrors, type SpaceFormValues } from '../utils/spaceValidation'
import type { ParkingSpace, VehicleType } from '../types'

export const emptySpaceValues: SpaceFormValues = {
  title: '', description: '', rules: '', address: '', area: '', city: '',
  price: '', vehicle: 'car', from: '06:00', to: '22:00', isAvailable: true,
}

export const valuesFromSpace = (s: ParkingSpace): SpaceFormValues => ({
  title: s.title, description: s.description ?? '', rules: s.rules ?? '', address: s.address, area: s.area, city: s.city,
  price: String(s.price_per_hour), vehicle: s.vehicle_type, from: s.available_from.slice(0, 5), to: s.available_to.slice(0, 5),
  isAvailable: s.is_available,
})

interface Props {
  initial: SpaceFormValues
  existingImageUrl?: string | null
  submitLabel: string
  busyLabel: string
  busy: boolean
  formError?: string
  onSubmit: (values: SpaceFormValues, image: File | null) => void
}

const field = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

export default function SpaceForm({ initial, existingImageUrl, submitLabel, busyLabel, busy, formError, onSubmit }: Props) {
  const [v, setV] = useState<SpaceFormValues>(initial)
  const [errors, setErrors] = useState<SpaceErrors>({})
  const [image, setImage] = useState<File | null>(null)
  const [imageError, setImageError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!image) { setPreview(null); return }
    const url = URL.createObjectURL(image)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  const set = <K extends keyof SpaceFormValues>(k: K, val: SpaceFormValues[K]) => setV((p) => ({ ...p, [k]: val }))

  function pickImage(file: File | undefined) {
    if (!file) return
    const problem = validateImage(file)
    if (problem) { setImageError(problem); setImage(null); return }
    setImageError(''); setImage(file)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const found = validateSpace(v)
    setErrors(found)
    if (Object.keys(found).length) return
    onSubmit(v, image)
  }

  const shownImage = preview ?? existingImageUrl ?? null

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {formError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}

      <FormField label="Parking title" name="title" value={v.title} maxLength={100} placeholder="e.g. Covered bay near the market" onChange={(e) => set('title', e.target.value)} error={errors.title} />

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea id="description" rows={4} maxLength={2000} className={field} value={v.description} onChange={(e) => set('description', e.target.value)} placeholder="What makes this space easy to use? Access, security, landmarks…" />
        {errors.description && <p className="mt-1.5 text-xs text-red-600">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="rules" className="mb-1.5 block text-sm font-medium text-slate-700">Parking rules <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea id="rules" rows={3} maxLength={1000} className={field} value={v.rules} onChange={(e) => set('rules', e.target.value)} placeholder="e.g. No overnight parking. Show your booking at the gate." />
        {errors.rules && <p className="mt-1.5 text-xs text-red-600">{errors.rules}</p>}
      </div>

      <FormField label="Address" name="address" value={v.address} maxLength={300} placeholder="Street, building or landmark" onChange={(e) => set('address', e.target.value)} error={errors.address} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Area" name="area" value={v.area} maxLength={100} placeholder="e.g. HSR Layout" onChange={(e) => set('area', e.target.value)} error={errors.area} />
        <FormField label="City" name="city" value={v.city} maxLength={100} placeholder="e.g. Bengaluru" onChange={(e) => set('city', e.target.value)} error={errors.city} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Price per hour (₹)" name="price" type="number" inputMode="decimal" min={0} step="0.01" value={v.price} onChange={(e) => set('price', e.target.value)} error={errors.price} />
        <div>
          <label htmlFor="vehicle" className="mb-1.5 block text-sm font-medium text-slate-700">Vehicle type</label>
          <select id="vehicle" className={field} value={v.vehicle} onChange={(e) => set('vehicle', e.target.value as VehicleType)}>
            <option value="car">Car</option><option value="bike">Bike / Scooter</option><option value="suv">SUV</option><option value="any">Any vehicle</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Available from" name="from" type="time" value={v.from} onChange={(e) => set('from', e.target.value)} error={errors.from} />
        <FormField label="Available to" name="to" type="time" value={v.to} onChange={(e) => set('to', e.target.value)} error={errors.to} />
      </div>
      <p className="-mt-2 text-xs text-slate-500">Drivers can book any time between these hours, every day (India time).</p>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Parking image <span className="font-normal text-slate-400">(optional)</span></span>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SmartImage src={shownImage} alt="Parking preview" className="h-32 w-full rounded-xl sm:w-48" />
          <div>
            <label htmlFor="image" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-navy-950 hover:bg-slate-50">
              <ImagePlus className="h-4 w-4" aria-hidden /> {shownImage ? 'Change image' : 'Choose image'}
            </label>
            <input id="image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pickImage(e.target.files?.[0])} />
            <p className="mt-2 text-xs text-slate-500">JPG, PNG or WebP, up to 5 MB.{image && ` Selected: ${image.name}`}</p>
            {imageError && <p role="alert" className="mt-1 text-xs text-red-600">{imageError}</p>}
          </div>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-4">
        <input type="checkbox" checked={v.isAvailable} onChange={(e) => set('isAvailable', e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-600" />
        <span><span className="block text-sm font-medium text-navy-950">Available for booking</span><span className="block text-xs text-slate-500">Untick to hide this space from drivers. You can change it any time.</span></span>
      </label>

      <div className="flex flex-wrap gap-3 pt-1">
        <button type="submit" disabled={busy} className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 font-semibold text-navy-950 hover:bg-brand-400 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} {busy ? busyLabel : submitLabel}
        </button>
        <Link to="/owner" className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-navy-950 hover:bg-slate-50">Cancel</Link>
      </div>
    </form>
  )
}
