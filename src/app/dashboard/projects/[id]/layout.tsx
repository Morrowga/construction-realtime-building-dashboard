// src/app/dashboard/projects/[id]/layout.tsx
'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getProject } from '@/lib/api'
import { useProjectStore } from '@/store/projectStore'
import { useProgress } from '@/hooks/useProgress'
import { WebSocketProvider } from '@/components/shared/WebSocketProvider'

/**
 * Project scope: loads the project into the store, keeps the progress tree
 * fresh, and holds the WebSocket open for live updates on every sub-page.
 */
export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>()
  const projectId = params.id
  const setActiveProject = useProjectStore((s) => s.setActiveProject)

  const projectQuery = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
  })
  useProgress(projectId)

  useEffect(() => {
    if (projectQuery.data) setActiveProject(projectQuery.data)
    return () => setActiveProject(null)
  }, [projectQuery.data, setActiveProject])

  return <WebSocketProvider projectId={projectId}>{children}</WebSocketProvider>
}
