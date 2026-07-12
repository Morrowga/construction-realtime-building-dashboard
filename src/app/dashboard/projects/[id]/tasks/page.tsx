// src/app/dashboard/projects/[id]/tasks/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskTemplateList } from '@/components/tasks/TaskTemplateList'
import { ZoneTaskAssign } from '@/components/tasks/ZoneTaskAssign'
import { getProjectProgress } from '@/lib/api'
import { useProjectStore } from '@/store/projectStore'
import type { TaskTemplate } from '@/types/api'

export default function TasksPage() {
  const params = useParams<{ id: string }>()
  const [pendingTemplate, setPendingTemplate] = useState<TaskTemplate | null>(null)
  const setProgress = useProjectStore((s) => s.setProgress)

  // projectStore has no fetching logic of its own (pure setters) — it
  // relies entirely on whichever page is currently mounted to populate
  // it. Previously this page never did that itself, so landing here
  // directly (not navigated from a page that happened to populate the
  // store first, e.g. overview or the 3D viewer) left `progress` null,
  // meaning ZoneTaskAssign's "already assigned tasks" section had no
  // data to show — not a bug in that component, just missing data.
  const progressQuery = useQuery({
    queryKey: ['projects', params.id, 'progress'],
    queryFn: () => getProjectProgress(params.id),
  })

  useEffect(() => {
    if (progressQuery.data) setProgress(progressQuery.data)
  }, [progressQuery.data, setProgress])

  return (
    <RoleGuard allow={['admin', 'manager']}>
      <div className="mx-auto max-w-6xl space-y-5 p-5">
        <h1 className="text-lg font-semibold">工程管理</h1>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">工程テンプレート</CardTitle></CardHeader>
            <CardContent>
              <TaskTemplateList
                onSelect={setPendingTemplate}
                selectedId={pendingTemplate?.id ?? null}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">ゾーンへの割り当て</CardTitle></CardHeader>
            <CardContent>
              <ZoneTaskAssign
                projectId={params.id}
                pendingTemplate={pendingTemplate}
                onConsumeTemplate={() => setPendingTemplate(null)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}