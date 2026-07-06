// src/components/shared/ColourSignalBadge.tsx
import { SIGNAL_COLOURS, cn } from '@/lib/utils'
import type { ColourSignal } from '@/types/api'

export function ColourSignalBadge({
  signal, className,
}: { signal: ColourSignal | string; className?: string }) {
  const s = SIGNAL_COLOURS[(signal as ColourSignal)] ?? SIGNAL_COLOURS.grey
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', className)}
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.text }} />
      {s.label}
    </span>
  )
}
