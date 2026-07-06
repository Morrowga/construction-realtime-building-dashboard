// src/app/dashboard/error.tsx
'use client'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error, reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <AlertTriangle className="h-8 w-8 text-warning" />
      <p className="text-sm text-text-muted">
        画面の表示中にエラーが発生しました。再読み込みしても解決しない場合は、
        バックエンドの接続状況をご確認ください。
      </p>
      <Button variant="outline" size="sm" onClick={reset}>再読み込み</Button>
    </div>
  )
}
