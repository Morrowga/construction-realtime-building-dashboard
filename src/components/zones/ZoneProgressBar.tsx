// src/components/zones/ZoneProgressBar.tsx
import { categoryHex } from '@/lib/utils'
import { ProgressBar } from '@/components/shared/ProgressBar'
import type { ZoneProgress } from '@/types/api'

/** Progress bar with the active construction layer chip underneath. */
export function ZoneProgressBar({ zone }: { zone: ZoneProgress }) {
  return (
    <div className="space-y-1">
      <ProgressBar pct={zone.pct} signal={zone.colour_signal} />
      {zone.active_layer_name && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ backgroundColor: categoryHex(zone.active_layer_category) }}
          />
          <span>{zone.active_layer_name}</span>
          <span className="tabular-nums">{Math.round(zone.active_layer_pct)}%</span>
        </div>
      )}
    </div>
  )
}
