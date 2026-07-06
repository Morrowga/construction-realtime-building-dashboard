// src/components/projects/ProgressRing.tsx
'use client'
import { signalHex } from '@/lib/utils'
import type { ColourSignal } from '@/types/api'

/** Animated SVG circular progress ring with the % in the centre. */
export function ProgressRing({
  pct, size = 88, strokeWidth = 8, signal,
}: {
  pct: number
  size?: number
  strokeWidth?: number
  signal?: ColourSignal | string
}) {
  const clamped = Math.max(0, Math.min(100, pct))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)
  const colour = signal
    ? signalHex(signal)
    : clamped >= 100 ? '#2ea043' : clamped > 0 ? '#d29922' : '#484f58'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#30363d" strokeWidth={strokeWidth} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={colour} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
        />
      </svg>
      <span
        className="absolute font-semibold tabular-nums text-text-primary"
        style={{ fontSize: size / 4.4 }}
      >
        {Math.round(clamped)}%
      </span>
    </div>
  )
}
