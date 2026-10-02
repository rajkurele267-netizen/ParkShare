import { useState } from 'react'
import { Car } from 'lucide-react'

interface Props { src?: string | null; alt: string; className?: string }

/** Image with lazy loading, shimmer while loading, and a built-in fallback if missing/broken. */
export default function SmartImage({ src, alt, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!src || failed) {
    return (
      <div className={`grid place-items-center bg-navy-800 text-brand-400 ${className}`} role="img" aria-label={alt}>
        <Car className="h-10 w-10 opacity-80" aria-hidden />
      </div>
    )
  }
  return (
    <div className={`relative overflow-hidden bg-slate-200 ${className}`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-slate-200" />}
      <img src={src} alt={alt} loading="lazy" onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}
