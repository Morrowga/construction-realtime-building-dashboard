// src/components/shared/ProgressBar.tsx
import { cn, signalHex } from '@/lib/utils'
import type { ColourSignal } from '@/types/api'

export function ProgressBar({
  pct, signal, className, showLabel = true,
}: {
  pct: number
  signal?: ColourSignal | string
  className?: string
  showLabel?: boolean
}) {
  const clamped = Math.max(0, Math.min(100, pct))
  const colour = signal ? signalHex(signal) : clamped >= 100 ? '#2ea043' : clamped > 0 ? '#d29922' : '#484f58'
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, backgroundColor: colour }}
        />
      </div>
      {showLabel && (
        <span className="w-11 text-right text-xs tabular-nums text-text-muted">
          {Math.round(clamped * 10) / 10}%
        </span>
      )}
    </div>
  )
}
