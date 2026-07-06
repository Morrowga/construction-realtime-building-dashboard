// src/hooks/useWebSocket.ts
'use client'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { projectWS } from '@/lib/websocket'
import { getAccessToken } from '@/lib/auth'
import type { WSEvent, WSProgressRollback, WSProgressUpdate } from '@/types/api'

/**
 * Connects the singleton project WebSocket while mounted and wires events
 * into the TanStack Query cache:
 *  - progress_update    → invalidate progress
 *  - progress_rollback  → invalidate progress + reports, toast
 *  - ai_analysis_complete → invalidate reports, toast
 */
export function useWebSocket(projectId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!projectId) return
    const token = getAccessToken()
    if (!token) return

    projectWS.connect(projectId, token)

    const unsubscribe = projectWS.subscribe((event: WSEvent) => {
      switch (event.type) {
        case 'progress_update': {
          const e = event as WSProgressUpdate
          queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'progress'] })
          queryClient.invalidateQueries({ queryKey: ['zones'] })
          toast.success(`進捗更新: ${e.active_layer_name ?? ''} ${Math.round(e.new_pct)}%`)
          break
        }
        case 'progress_rollback': {
          const e = event as WSProgressRollback
          queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'progress'] })
          queryClient.invalidateQueries({ queryKey: ['reports'] })
          toast.warning(
            `差し戻し: ${Math.round(e.previous_pct)}% → ${Math.round(e.reverted_to_pct)}%（${e.rolled_back_by}）`,
          )
          break
        }
        case 'ai_analysis_complete': {
          queryClient.invalidateQueries({ queryKey: ['reports'] })
          toast.info('AI解析が完了しました')
          break
        }
        default:
          break
      }
    })

    return () => {
      unsubscribe()
      projectWS.disconnect()
    }
  }, [projectId, queryClient])
}
