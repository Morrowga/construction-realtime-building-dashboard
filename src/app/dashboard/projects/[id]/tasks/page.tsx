// src/app/dashboard/projects/[id]/tasks/page.tsx
'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskTemplateList } from '@/components/tasks/TaskTemplateList'
import { ZoneTaskAssign } from '@/components/tasks/ZoneTaskAssign'
import type { TaskTemplate } from '@/types/api'

export default function TasksPage() {
  const params = useParams<{ id: string }>()
  const [pendingTemplate, setPendingTemplate] = useState<TaskTemplate | null>(null)

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
