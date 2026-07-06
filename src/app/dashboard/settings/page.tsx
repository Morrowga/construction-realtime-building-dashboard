// src/app/dashboard/settings/page.tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const { user } = useAuth()
  return (
    <div className="mx-auto max-w-3xl space-y-5 p-5">
      <h1 className="text-lg font-semibold">設定</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">アカウント</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm text-text-muted">
          <p>名前: {user?.full_name ?? '—'}</p>
          <p>メール: {user?.email ?? '—'}</p>
          <p>ロール: {user?.role ?? '—'}</p>
        </CardContent>
      </Card>
    </div>
  )
}
