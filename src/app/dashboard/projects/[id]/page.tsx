// src/app/dashboard/projects/[id]/page.tsx
'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Box, FileText, Layers, ListChecks, Users, View,
} from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ProgressRing } from '@/components/projects/ProgressRing'
import { FloorProgressChart } from '@/components/projects/FloorProgressChart'

const TABS = [
  { label: '階・フロア', sub: '階の登録と進捗', href: 'floors', icon: Layers },
  { label: 'ゾーン', sub: 'ゾーンとタスク', href: 'zones', icon: Box },
  { label: '工程管理', sub: 'タスクの割り当て', href: 'tasks', icon: ListChecks },
  { label: 'モデル', sub: '3Dモデルの管理', href: 'model', icon: View },
  { label: 'メンバー', sub: '関係者の管理', href: 'members', icon: Users },
  { label: 'レポート', sub: '承認と履歴', href: 'reports', icon: FileText },
]

export default function ProjectOverviewPage() {
  const params = useParams<{ id: string }>()
  const project = useProjectStore((s) => s.activeProject)
  const progress = useProjectStore((s) => s.progress)

  if (!project) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-5">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-5">
      {/* header: name, status, live overall ring */}
      <div className="flex flex-wrap items-center gap-5 rounded-lg border border-border bg-surface p-5">
        <ProgressRing pct={progress?.overall_pct ?? 0} size={96} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold">{project.name}</h1>
            <Badge variant="warning">{project.status}</Badge>
          </div>
          {project.address && <p className="text-sm text-text-muted">{project.address}</p>}
          <p className="mt-1 text-xs text-text-muted">
            竣工予定: {formatDate(project.planned_end_date)}
          </p>
        </div>
      </div>

      {/* tab cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {TABS.map((tab) => (
          <Link key={tab.href} href={`/dashboard/projects/${params.id}/${tab.href}`}>
            <Card className="h-full transition-colors hover:border-accent/60">
              <CardContent className="flex flex-col items-start gap-2 p-4">
                <tab.icon className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-medium">{tab.label}</p>
                  <p className="text-[11px] text-text-muted">{tab.sub}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* per-floor progress chart (live via WebSocket invalidation) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">階別進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <FloorProgressChart floors={progress?.floors ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
