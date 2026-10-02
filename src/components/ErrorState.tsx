import { AlertTriangle } from 'lucide-react'

export default function ErrorState({ title = 'Something went wrong', text, onRetry }: { title?: string; text?: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500"><AlertTriangle aria-hidden /></div>
      <h2 className="mt-4 text-lg font-semibold text-navy-950">{title}</h2>
      {text && <p className="mt-2 text-sm text-slate-600">{text}</p>}
      {onRetry && <button onClick={onRetry} className="mt-6 rounded-lg bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800">Try again</button>}
    </div>
  )
}
