import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
  open: boolean; title: string; message: string
  confirmLabel: string; cancelLabel?: string
  busy?: boolean; onConfirm: () => void; onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel = 'Keep it', busy, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, busy, onCancel])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/60 p-4" onClick={() => !busy && onCancel()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-msg"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 id="dlg-title" className="text-lg font-semibold text-navy-950">{title}</h2>
        <p id="dlg-msg" className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button ref={cancelRef} onClick={onCancel} disabled={busy} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-slate-50 disabled:opacity-60">{cancelLabel}</button>
          <button onClick={onConfirm} disabled={busy} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
