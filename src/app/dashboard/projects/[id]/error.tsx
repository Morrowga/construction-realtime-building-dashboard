// src/app/dashboard/projects/[id]/error.tsx
'use client'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProjectError({
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <AlertTriangle className="h-8 w-8 text-warning" />
      <p className="text-sm text-text-muted">プロジェクトの読み込みに失敗しました。</p>
      <Button variant="outline" size="sm" onClick={reset}>再試行</Button>
    </div>
  )
}
