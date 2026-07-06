// src/components/projects/ProjectCard.tsx
'use client'
import Link from 'next/link'
import { MapPin, Layers } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getFloors, getProjectProgress } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Project } from '@/types/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/projects/ProgressRing'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'muted' }> = {
  planning: { label: '計画中', variant: 'muted' },
  active: { label: '施工中', variant: 'warning' },
  in_progress: { label: '施工中', variant: 'warning' },
  completed: { label: '完了', variant: 'success' },
  on_hold: { label: '中断', variant: 'muted' },
}

export function ProjectCard({ project }: { project: Project }) {
  const progressQuery = useQuery({
    queryKey: ['projects', project.id, 'progress'],
    queryFn: () => getProjectProgress(project.id),
  })
  const floorsQuery = useQuery({
    queryKey: ['projects', project.id, 'floors'],
    queryFn: () => getFloors(project.id),
  })

  const pct = progressQuery.data?.overall_pct ?? project.overall_pct ?? 0
  const status = STATUS_LABELS[project.status] ?? { label: project.status, variant: 'muted' as const }

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="h-full transition-colors hover:border-accent/60">
        <CardContent className="flex items-center gap-4 p-5">
          <ProgressRing pct={pct} size={76} strokeWidth={7} />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="truncate font-semibold">{project.name}</h3>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            {project.address && (
              <p className="flex items-center gap-1 truncate text-xs text-text-muted">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {project.address}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {floorsQuery.data?.length ?? '—'} 階
              </span>
              <span>竣工予定: {formatDate(project.planned_end_date)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
