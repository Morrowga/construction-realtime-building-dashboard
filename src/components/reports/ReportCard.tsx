// src/components/reports/ReportCard.tsx
'use client'
import { AlertTriangle, Bot, HardHat, MapPin } from 'lucide-react'
import { categoryHex, cn, formatDateTime } from '@/lib/utils'
import type { Report, ZoneProgress } from '@/types/api'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PhotoGallery } from '@/components/shared/PhotoGallery'
import { ApprovalForm } from '@/components/reports/ApprovalForm'
import { RollbackButton } from '@/components/reports/RollbackButton'

const FLAG_LABELS: Record<string, string> = {
  note_mismatch: 'メモと写真の不一致',
  wrong_location_suspected: '撮影場所の疑義',
  low_confidence: '信頼度低',
  photo_quality_low: '写真品質低',
  ai_analysis_failed: 'AI解析失敗',
}

function PctCompare({ label, pct, icon: Icon, highlight }: {
  label: string
  pct: number | null
  icon: React.ComponentType<{ className?: string }>
  highlight?: boolean
}) {
  return (
    <div className={cn('flex-1 rounded-md border border-border p-2.5', highlight && 'border-accent/50')}>
      <p className="mb-1 flex items-center gap-1 text-[11px] text-text-muted">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="text-lg font-semibold tabular-nums">
        {pct !== null ? `${Math.round(pct)}%` : '—'}
      </p>
    </div>
  )
}

/**
 * The manager's report card: engineer vs AI estimate, confidence bar, AI flags,
 * summary, photos, active layer context, and role/status-appropriate actions.
 */
export function ReportCard({
  report, projectId, zoneContext,
}: {
  report: Report
  projectId: string
  zoneContext?: ZoneProgress | null
}) {
  const { user } = useAuth()
  const canApprove = user?.role === 'admin' || user?.role === 'manager'
  const flags = report.ai_analysis?.flags ?? []
  const confidence = report.ai_confidence ?? report.ai_analysis?.confidence ?? null

  const statusBadge =
    report.status === 'pending' ? <Badge variant="warning">承認待ち</Badge>
    : report.status === 'approved' ? <Badge variant="success">承認済み</Badge>
    : <Badge variant="destructive">差し戻し</Badge>

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        {/* header row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{report.engineer_name ?? '施工担当'}</span>
          <span className="text-xs text-text-muted">{formatDateTime(report.submitted_at)}</span>
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <MapPin className="h-3 w-3" />
            {report.floor_name ?? ''} {report.zone_name ?? zoneContext?.name ?? ''}
          </span>
          <div className="ml-auto">{statusBadge}</div>
        </div>

        {/* active construction layer context */}
        {zoneContext?.active_layer_name && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: categoryHex(zoneContext.active_layer_category) }}
            />
            現在の工程: {zoneContext.active_layer_name}
            <span className="tabular-nums">({Math.round(zoneContext.active_layer_pct)}%)</span>
          </div>
        )}

        {/* photos */}
        <PhotoGallery photos={report.photos} />

        {/* engineer vs AI */}
        <div className="flex gap-2">
          <PctCompare label="担当者申告" pct={report.engineer_progress_pct} icon={HardHat} />
          <PctCompare label="AI推定" pct={report.ai_progress_pct} icon={Bot} highlight />
        </div>

        {/* AI confidence */}
        {confidence !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-text-muted">
              <span>AI信頼度</span>
              <span className="tabular-nums">{Math.round(confidence * 100)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${confidence * 100}%`,
                  backgroundColor: confidence >= 0.7 ? '#2ea043' : confidence >= 0.4 ? '#d29922' : '#f85149',
                }}
              />
            </div>
          </div>
        )}

        {/* AI flags */}
        {flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {flags.map((flag) => (
              <span
                key={flag}
                className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning"
              >
                <AlertTriangle className="h-3 w-3" />
                {FLAG_LABELS[flag] ?? flag}
              </span>
            ))}
          </div>
        )}

        {/* AI summary + engineer note */}
        {report.ai_analysis?.summary && (
          <p className="rounded-md bg-background p-2.5 text-xs leading-relaxed text-text-muted">
            <Bot className="mr-1 inline h-3 w-3" />
            {report.ai_analysis.summary}
          </p>
        )}
        {report.note && (
          <p className="text-xs text-text-muted">担当者メモ: {report.note}</p>
        )}

        {/* approver name + date — previously not shown anywhere at all,
            only a raw manager_id existed on the data with no UI for it */}
        {report.approval && !report.approval.is_rolled_back && (
          <p className="text-xs text-text-muted">
            {report.approval.action === 'approved' ? '承認者' : '却下者'}:{' '}
            <span className="font-medium text-text-primary">
              {report.approval.manager_name ?? '不明'}
            </span>
            {report.approval.approved_at && (
              <span className="ml-1">（{formatDateTime(report.approval.approved_at)}）</span>
            )}
          </p>
        )}

        {/* rolled-back approvals shown struck through */}
        {report.approval?.is_rolled_back && (
          <p className="text-xs text-muted line-through">
            前回承認 {report.approval.final_pct !== null ? `${Math.round(report.approval.final_pct)}%` : ''}
            （取り消し: {report.approval.rollback_reason ?? '—'}）
          </p>
        )}

        {/* actions */}
        {canApprove && report.status === 'pending' && (
          <ApprovalForm report={report} projectId={projectId} />
        )}
        {canApprove && report.status === 'approved' && !report.approval?.is_rolled_back && (
          <div className="flex justify-end">
            <RollbackButton report={report} projectId={projectId} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}