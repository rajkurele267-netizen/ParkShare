import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { fetchListing } from '../services/parkingService'
import { removeSpaceImage, updateSpace, uploadSpaceImage } from '../services/ownerService'
import { isUuid } from '../utils/format'
import type { ParkingSpace } from '../types'
import type { SpaceFormValues } from '../utils/spaceValidation'
import SpaceForm, { valuesFromSpace } from '../components/SpaceForm'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import Unauthorized from './Unauthorized'

export default function EditParking() {
  usePageTitle('Edit Parking — ParkShare')
  const { id = '' } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [space, setSpace] = useState<ParkingSpace | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isUuid(id)) { setLoading(false); return }
    let cancelled = false
    setLoading(true); setFailed(false)
    fetchListing(id)
      .then((s) => { if (!cancelled) setSpace(s) })
      .catch(() => { if (!cancelled) setFailed(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, attempt])

  if (loading) return <LoadingState text="Loading your parking space…" />
  if (failed) return <ErrorState title="Unable to load this space" text="Please check your connection and try again." onRetry={() => setAttempt((a) => a + 1)} />
  if (!space) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-navy-950">Parking space not found</h1>
        <Link to="/owner" className="mt-8 inline-block rounded-lg bg-navy-950 px-5 py-2.5 font-semibold text-white hover:bg-navy-800">Back to dashboard</Link>
      </div>
    )
  }
  // Owners can only edit their own spaces (the database enforces this too).
  if (space.owner_id !== user?.id) return <Unauthorized required="owner" />

  async function save(values: SpaceFormValues, image: File | null) {
    if (!user || !space) return
    setBusy(true); setError('')
    let newUrl: string | null = null
    try {
      if (image) newUrl = await uploadSpaceImage(user.id, image)
      await updateSpace(space.id, values, newUrl ?? space.image_url)
      if (newUrl) await removeSpaceImage(space.image_url)
      toast.success('Changes saved.')
      navigate('/owner')
    } catch (err) {
      await removeSpaceImage(newUrl)
      setError(err instanceof Error ? err.message : 'Unable to save your changes. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-navy-950">Edit parking space</h1>
      <div className="mt-8">
        <SpaceForm initial={valuesFromSpace(space)} existingImageUrl={space.image_url} submitLabel="Save changes" busyLabel="Saving…" busy={busy} formError={error} onSubmit={save} />
      </div>
    </div>
  )
}
