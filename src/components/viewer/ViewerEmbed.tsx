// src/components/viewer/ViewerEmbed.tsx
'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getAccessToken } from '@/lib/auth'

/**
 * Embeds the 3D viewer via Next.js rewrite proxy (/viewer → backend /viewer).
 * Config (token, project ID, GLB keys) passed as URL params — no dialog shown.
 *
 * IMPORTANT: the iframe `src` is only computed once the auth token has
 * settled to a real value. Previously this component read
 * `storeToken ?? getAccessToken()` on every render — on first paint the
 * Zustand store is often still hydrating (null), so it fell back to
 * getAccessToken(); a moment later the store hydrates and storeToken
 * becomes non-null, producing a *new* src string and remounting the
 * iframe. That remount re-ran startViewer() inside viewer.html, causing
 * a second GET /api/v1/projects/{id}/progress call. Gating on `ready`
 * and keying the iframe on the final token value fixes both the double
 * fetch and any WebSocket double-connect that came with it.
 */
export function ViewerEmbed({ projectId }: { projectId: string }) {
  const storeToken = useAuthStore((s) => s.token)
  const [ready, setReady] = useState(false)
  const [token, setToken] = useState('')

  useEffect(() => {
    const resolved = storeToken ?? getAccessToken() ?? ''
    if (resolved && !ready) {
      setToken(resolved)
      setReady(true)
    }
  }, [storeToken, ready])

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        読み込み中...
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        認証トークンが見つかりません。再ログインしてください。
      </div>
    )
  }

  const src =
    '/viewer?' +
    new URLSearchParams({
      token,
      pid: projectId,
      skel: `projects/${projectId}/model/original.glb`,
      env: `projects/${projectId}/model/envelope.glb`,
      int: `projects/${projectId}/model/interior.glb`,
    }).toString()

  return (
    <iframe
      key={token}
      src={src}
      title="3Dビューアー"
      className="h-full w-full rounded-lg border-0"
      allow="accelerometer; camera; fullscreen"
    />
  )
}