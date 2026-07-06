// src/app/mobile-only/page.tsx
'use client'
import { Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function MobileOnlyPage() {
  const { signOut } = useAuth()

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15">
            <Smartphone className="h-6 w-6 text-accent" />
          </div>
          <CardTitle>モバイルアプリをご利用ください</CardTitle>
          <CardDescription>
            このアカウントは Web ダッシュボードにアクセスできません。
            現場での進捗報告や確認はモバイルアプリからご利用いただけます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => signOut()}>
            ログアウト
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}