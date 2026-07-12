// src/app/dashboard/page.tsx
'use client'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getProjects } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectCard } from '@/components/projects/ProjectCard'

export default function DashboardPage() {
  const { user } = useAuth()
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: getProjects })
  const canCreate = user?.role === 'admin'

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">プロジェクト一覧</h1>
        {canCreate && (
          <Link href="/dashboard/projects/new">
            <Button size="sm" className="bg-gradient-to-r from-accent to-black">
              <Plus className="h-4 w-4" />
              新規プロジェクト
            </Button>
          </Link>
        )}
      </div>

      {projectsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : !projectsQuery.data?.length ? (
        <p className="rounded-md border border-dashed border-border py-16 text-center text-sm text-text-muted">
          参加中のプロジェクトはありません。
          {canCreate && '「新規プロジェクト」から作成できます。'}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projectsQuery.data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
