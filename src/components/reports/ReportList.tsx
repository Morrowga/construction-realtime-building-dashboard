// src/components/reports/ReportList.tsx
'use client'
import { useMemo } from 'react'
import { useReports } from '@/hooks/useReports'
import { useProjectStore } from '@/store/projectStore'
import type { ZoneProgress } from '@/types/api'
import { Skeleton } from '@/components/ui/skeleton'
import { ReportCard } from '@/components/reports/ReportCard'

interface ReportListProps {
  projectId: string
  status?: 'pending' | 'approved' | 'rejected'
  zoneTaskId?: string
}

export function ReportList({ projectId, status, zoneTaskId }: ReportListProps) {
  const progress = useProjectStore((s) => s.progress)
  const reportsQuery = useReports({
    project_id: projectId,
    status,
    limit: 100,
    zone_task_id: zoneTaskId,
  })

  const zoneByTaskId = useMemo(() => {
    const map = new Map<string, ZoneProgress>()
    progress?.floors.forEach((floor) =>
      floor.zones.forEach((zone) =>
        zone.tasks.forEach((task) => map.set(task.zone_task_id, zone)),
      ),
    )
    return map
  }, [progress])

  if (reportsQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const reports = reportsQuery.data ?? []
  if (!reports.length) {
    return (
      <p className="rounded-md border border-dashed border-border py-12 text-center text-sm text-text-muted">
        {status === 'pending' ? '承認待ちのレポートはありません' : 'レポートはまだありません'}
      </p>
    )
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          projectId={projectId}
          zoneContext={zoneByTaskId.get(report.zone_task_id)}
        />
      ))}
    </div>
  )
}