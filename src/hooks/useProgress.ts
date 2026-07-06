// src/hooks/useProgress.ts
'use client'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProjectProgress } from '@/lib/api'
import { useProjectStore } from '@/store/projectStore'

export function useProgress(projectId: string | undefined) {
  const setProgress = useProjectStore((s) => s.setProgress)

  const query = useQuery({
    queryKey: ['projects', projectId, 'progress'],
    queryFn: () => getProjectProgress(projectId!),
    enabled: !!projectId,
  })

  useEffect(() => {
    if (query.data) setProgress(query.data)
  }, [query.data, setProgress])

  return query
}
