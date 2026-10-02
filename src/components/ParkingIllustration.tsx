/** Self-contained top-down parking-lot illustration. No external images, so it can never break. */
export default function ParkingIllustration() {
  const bays = [0, 1, 2, 3, 4]
  const cars: Record<string, string> = { '0-0': '#e2e8f0', '1-0': '#34d399', '3-0': '#94a3b8', '0-1': '#64748b', '2-1': '#e2e8f0', '4-1': '#cbd5e1' }
  return (
    <svg viewBox="0 0 520 360" className="h-auto w-full" role="img" aria-label="Illustration of a parking lot with one highlighted available space">
      <rect width="520" height="360" rx="24" fill="#111a2e" />
      <rect x="20" y="20" width="480" height="320" rx="14" fill="#1a2540" />
      <line x1="40" y1="180" x2="480" y2="180" stroke="#334155" strokeWidth="3" strokeDasharray="14 12" />
      {[0, 1].map((row) => bays.map((i) => {
        const x = 50 + i * 88, y = row === 0 ? 50 : 210
        const color = cars[`${i}-${row}`]
        const free = !color
        return (
          <g key={`${i}-${row}`}>
            <rect x={x} y={y} width="72" height="112" rx="6" fill="none" stroke={free ? '#34d399' : '#475569'} strokeWidth={free ? 3 : 2} strokeDasharray={free ? '6 5' : '0'} />
            {color && <rect x={x + 12} y={y + 14} width="48" height="84" rx="12" fill={color} />}
            {color && <rect x={x + 20} y={y + 34} width="32" height="22" rx="4" fill="#0b1220" opacity="0.55" />}
            {free && <text x={x + 36} y={y + 66} textAnchor="middle" fontSize="26" fontWeight="700" fill="#34d399">P</text>}
          </g>
        )
      }))}
    </svg>
  )
}
