// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ColourSignal } from '@/types/api'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPct(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return '—'
  return `${Math.round(pct * 10) / 10}%`
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('ja-JP', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// Colour signal system (construction phases)
export const SIGNAL_COLOURS: Record<ColourSignal, { bg: string; text: string; label: string }> = {
  green: { bg: '#0d2b0d', text: '#2ea043', label: '完了' },
  amber: { bg: '#2a1800', text: '#d29922', label: '施工中' },
  grey: { bg: '#1c2128', text: '#484f58', label: '未着手' },
}

export function signalHex(signal: ColourSignal | string | null | undefined): string {
  if (signal === 'green') return '#2ea043'
  if (signal === 'amber') return '#d29922'
  return '#484f58'
}

// active_layer_category → construction phase colour
export const CATEGORY_COLOURS: Record<string, string> = {
  rebar: '#8B7355',
  formwork: '#8B7355',
  structural: '#8B7355',
  concrete: '#909090',
  waterproofing: '#4A7FA5',
  electrical: '#E8C040',
  plumbing: '#3A9080',
  insulation: '#D4A84B',
  tiling: '#C8B89A',
  painting: '#E0D5C5',
  fixtures: '#D0C0A8',
  finishing: '#D0C0A8',
  roofing: '#606870',
  glazing: '#88BBDD',
  other: '#8b949e',
}

export function categoryHex(category: string | null | undefined): string {
  if (!category) return '#8b949e'
  return CATEGORY_COLOURS[category] ?? '#8b949e'
}

export const CATEGORY_LABELS: Record<string, string> = {
  rebar: '配筋', formwork: '型枠', concrete: 'コンクリート', waterproofing: '防水',
  electrical: '電気', plumbing: '配管', tiling: 'タイル', painting: '塗装',
  fixtures: '設備・器具', glazing: 'ガラス', roofing: '屋根', insulation: '断熱',
  finishing: '仕上げ', structural: '構造', other: 'その他',
}

// Construction layer sequences — suggested defaults for the task assignment UI
export const ZONE_TASK_SEQUENCES: Record<
  string,
  Array<{ name: string; category: string; layer_order: number }>
> = {
  structural_slab: [
    { name: 'Rebar Installation', category: 'rebar', layer_order: 1 },
    { name: 'Formwork', category: 'formwork', layer_order: 2 },
    { name: 'Concrete Pour', category: 'concrete', layer_order: 3 },
  ],
  room_residential: [
    { name: 'Concrete Pour', category: 'concrete', layer_order: 1 },
    { name: 'Electrical Wiring', category: 'electrical', layer_order: 2 },
    { name: 'Insulation', category: 'insulation', layer_order: 3 },
    { name: 'Tiling', category: 'tiling', layer_order: 4 },
    { name: 'Painting', category: 'painting', layer_order: 5 },
    { name: 'Fixtures & Fittings', category: 'fixtures', layer_order: 6 },
  ],
  bathroom: [
    { name: 'Concrete Pour', category: 'concrete', layer_order: 1 },
    { name: 'Plumbing', category: 'plumbing', layer_order: 2 },
    { name: 'Waterproofing', category: 'waterproofing', layer_order: 3 },
    { name: 'Tiling', category: 'tiling', layer_order: 4 },
    { name: 'Fixtures & Fittings', category: 'fixtures', layer_order: 5 },
  ],
  terrace: [
    { name: 'Concrete Pour', category: 'concrete', layer_order: 1 },
    { name: 'Waterproofing', category: 'waterproofing', layer_order: 2 },
    { name: 'Tiling', category: 'tiling', layer_order: 3 },
    { name: 'Glazing', category: 'glazing', layer_order: 4 },
  ],
  rooftop: [
    { name: 'Concrete Pour', category: 'concrete', layer_order: 1 },
    { name: 'Waterproofing', category: 'waterproofing', layer_order: 2 },
    { name: 'Roofing', category: 'roofing', layer_order: 3 },
  ],
}
