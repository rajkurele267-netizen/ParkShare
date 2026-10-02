import type { ReactNode } from 'react'

export default function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      {icon && <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-500/10 text-brand-600">{icon}</div>}
      <h3 className="text-lg font-semibold text-navy-950">{title}</h3>
      {text && <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
