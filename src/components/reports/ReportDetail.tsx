// src/components/reports/ReportDetail.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { getReport } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ReportCard } from '@/components/reports/ReportCard'

/** Full single-report view incl. approval history (rolled-back entries greyed). */
export function ReportDetail({ reportId, projectId }: { reportId: string; projectId: string }) {
  const reportQuery = useQuery({
    queryKey: ['reports', 'detail', reportId],
    queryFn: () => getReport(reportId),
  })

  if (reportQuery.isLoading) return <Skeleton className="h-64 w-full" />
  if (!reportQuery.data) {
    return <p className="text-sm text-text-muted">レポートが見つかりません</p>
  }

  const report = reportQuery.data
  return (
    <div className="space-y-4">
      <ReportCard report={report} projectId={projectId} />
      {report.approval && (
        <div className="rounded-md border border-border bg-surface p-4">
          <h4 className="mb-2 text-sm font-medium">承認履歴</h4>
          <div
            className={
              report.approval.is_rolled_back
                ? 'text-xs text-muted line-through'
                : 'text-xs text-text-muted'
            }
          >
            {report.approval.action === 'approved' ? '承認' : '差し戻し'}
            {report.approval.final_pct !== null && ` — ${Math.round(report.approval.final_pct)}%`}
            {' / '}{formatDateTime(report.approval.approved_at)}
            {report.approval.comment && ` / ${report.approval.comment}`}
            {report.approval.is_rolled_back && (
              <span className="ml-1 no-underline">
                （取り消し済み: {report.approval.rollback_reason ?? '—'}）
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
