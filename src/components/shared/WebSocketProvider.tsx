// src/components/shared/WebSocketProvider.tsx
'use client'
import { useWebSocket } from '@/hooks/useWebSocket'

/**
 * Mount once per project scope — keeps the project WebSocket alive and wired
 * to the TanStack Query cache while any project page is open.
 */
export function WebSocketProvider({
  projectId, children,
}: { projectId: string; children: React.ReactNode }) {
  useWebSocket(projectId)
  return <>{children}</>
}
