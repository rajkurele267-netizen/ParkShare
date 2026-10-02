import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> { label: string; error?: string }

export default function FormField({ label, error, id, ...rest }: Props) {
  const fid = id ?? rest.name ?? label
  return (
    <div>
      <label htmlFor={fid} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input id={fid} aria-invalid={Boolean(error)} aria-describedby={error ? `${fid}-err` : undefined} {...rest}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${error ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20'}`} />
      {error && <p id={`${fid}-err`} className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}
