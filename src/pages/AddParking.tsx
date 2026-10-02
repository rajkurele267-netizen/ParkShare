import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { createSpace, removeSpaceImage, uploadSpaceImage } from '../services/ownerService'
import SpaceForm, { emptySpaceValues } from '../components/SpaceForm'
import type { SpaceFormValues } from '../utils/spaceValidation'

export default function AddParking() {
  usePageTitle('Add Parking — ParkShare')
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save(values: SpaceFormValues, image: File | null) {
    if (!user) return
    setBusy(true); setError('')
    let imageUrl: string | null = null
    try {
      if (image) imageUrl = await uploadSpaceImage(user.id, image)
      await createSpace(user.id, values, imageUrl)
      toast.success('Parking added successfully.')
      navigate('/owner')
    } catch (err) {
      await removeSpaceImage(imageUrl) // don't leave an orphaned upload behind
      setError(err instanceof Error ? err.message : 'Unable to save your parking space. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-navy-950">Add a parking space</h1>
      <p className="mt-1 text-slate-600">Tell drivers where your space is, when it's free and what it costs.</p>
      <div className="mt-8">
        <SpaceForm initial={emptySpaceValues} submitLabel="Add parking space" busyLabel="Saving…" busy={busy} formError={error} onSubmit={save} />
      </div>
    </div>
  )
}
