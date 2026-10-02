import type { BookingStatus } from '../types'

const styles: Record<BookingStatus, string> = {
  confirmed: 'bg-brand-500/10 text-brand-600',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-50 text-red-600',
}
const labels: Record<BookingStatus, string> = { confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' }

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>
}

/** A confirmed booking whose end time has passed is shown as Completed. */
export function displayStatus(status: BookingStatus, endIso: string): BookingStatus {
  return status === 'confirmed' && new Date(endIso).getTime() < Date.now() ? 'completed' : status
}
