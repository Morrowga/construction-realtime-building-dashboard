// src/components/model/ModelStatus.tsx
'use client'
import { Box, CheckCircle2, Clock, FileWarning, Loader2 } from 'lucide-react'
import type { ModelFile } from '@/types/api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const STATUS_META: Record<string, { label: string; variant: 'success' | 'warning' | 'muted' | 'destructive'; icon: React.ComponentType<{ className?: string }> }> = {
  done: { label: '解析完了', variant: 'success', icon: CheckCircle2 },
  processing: { label: '解析中', variant: 'warning', icon: Loader2 },
  pending: { label: '待機中', variant: 'muted', icon: Clock },
  failed: { label: '解析失敗', variant: 'destructive', icon: FileWarning },
}

const SOURCE_LABELS: Record<string, string> = {
  ifc: 'IFC（BIMモデル）',
  pdf: 'PDF（図面）',
  glb: 'GLB（3Dモデル）',
  gltf: 'GLTF（3Dモデル）',
  manual: '手動設定',
}

export function ModelStatus({ model }: { model: ModelFile | null }) {
  if (!model) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4 text-sm text-text-muted">
          <Box className="h-5 w-5" />
          モデルはまだアップロードされていません
        </CardContent>
      </Card>
    )
  }

  const meta = STATUS_META[model.parse_status] ?? STATUS_META.pending
  const Icon = meta.icon
  const zoneCount = model.zone_map ? Object.keys(model.zone_map).length : 0

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <Icon className={meta.variant === 'warning' ? 'h-5 w-5 animate-spin text-warning' : 'h-5 w-5 text-text-muted'} />
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
        <span className="text-sm text-text-muted">
          形式: {model.source_type ? SOURCE_LABELS[model.source_type] ?? model.source_type : '—'}
        </span>
        <span className="text-sm text-text-muted">ゾーンマップ: {zoneCount}件</span>
      </CardContent>
    </Card>
  )
}
