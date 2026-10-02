import { Loader2 } from 'lucide-react'

export default function LoadingState({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-24 text-slate-600" role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> <span>{text}</span>
    </div>
  )
}
