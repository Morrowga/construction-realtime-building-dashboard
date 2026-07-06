// src/components/layout/Header.tsx
'use client'
import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const ROLE_LABELS: Record<string, string> = {
  admin: '管理者', manager: '現場監督', engineer: '施工担当', client: '施主',
}

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, signOut } = useAuth()
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick} aria-label="メニュー">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold tracking-wide">
          建設進捗プラットフォーム
        </span>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="hidden text-sm text-text-muted sm:inline">{user.full_name}</span>
            <Badge variant="outline">{ROLE_LABELS[user.role] ?? user.role}</Badge>
          </>
        )}
        <Button variant="ghost" size="icon" onClick={signOut} aria-label="ログアウト">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
