// src/components/layout/Sidebar.tsx
'use client'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import {
  Box, FileText, LayoutDashboard, Layers, ListChecks, Settings, UserCog, Users, View, X,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { getReports } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useProjectStore } from '@/store/projectStore'
import type { UserRole } from '@/types/api'

interface NavItem {
  label: string
  href: (id: string) => string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
  badge?: 'pendingReports'
}

const PROJECT_NAV: NavItem[] = [
  { label: '概要', href: (id) => `/dashboard/projects/${id}`, icon: LayoutDashboard, roles: ['admin', 'manager', 'engineer', 'client'] },
  { label: '3Dビューアー', href: (id) => `/dashboard/projects/${id}/viewer`, icon: View, roles: ['admin', 'manager', 'engineer', 'client'] },
  { label: '階・ゾーン', href: (id) => `/dashboard/projects/${id}/floors`, icon: Layers, roles: ['admin', 'manager'] },
  { label: '工程管理', href: (id) => `/dashboard/projects/${id}/tasks`, icon: ListChecks, roles: ['admin', 'manager'] },
  { label: 'モデル', href: (id) => `/dashboard/projects/${id}/model`, icon: Box, roles: ['admin', 'manager'] },
  { label: 'メンバー', href: (id) => `/dashboard/projects/${id}/members`, icon: Users, roles: ['admin', 'manager'] },
  { label: 'レポート', href: (id) => `/dashboard/projects/${id}/reports`, icon: FileText, roles: ['admin', 'manager', 'engineer'], badge: 'pendingReports' },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const params = useParams<{ id?: string }>()
  const { user } = useAuth()
  const activeProject = useProjectStore((s) => s.activeProject)
  const projectId = params?.id

  const canApprove = user?.role === 'admin' || user?.role === 'manager'
  const pendingQuery = useQuery({
    queryKey: ['reports', { project_id: projectId, status: 'pending', limit: 100 }],
    queryFn: () => getReports({ project_id: projectId, status: 'pending', limit: 100 }),
    enabled: !!projectId && canApprove,
    refetchInterval: 60_000,
  })
  const pendingCount = pendingQuery.data?.length ?? 0

  const linkClass = (href: string) =>
    cn(
      'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
      pathname === href
        ? 'bg-accent/15 text-accent'
        : 'text-text-muted hover:bg-surface hover:text-text-primary',
    )

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-60 border-r border-border bg-[#0d1117] p-3 transition-transform md:static md:translate-x-0',
          open ? 'translate-x-0 animate-slide-in' : '-translate-x-full',
        )}
      >
        <div className="mb-2 flex items-center justify-between px-2 md:hidden">
          <span className="text-sm font-semibold">メニュー</span>
          <button onClick={onClose} aria-label="閉じる" className="text-text-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-0.5">
          <Link href="/dashboard" className={linkClass('/dashboard')} onClick={onClose}>
            <LayoutDashboard className="h-4 w-4" />
            ダッシュボード
          </Link>

          {projectId && user && (
            <div className="mt-4">
              <p className="mb-1 truncate px-3 text-xs font-medium uppercase tracking-wider text-muted">
                {activeProject?.name ?? 'プロジェクト'}
              </p>
              {PROJECT_NAV.filter((item) => item.roles.includes(user.role)).map((item) => {
                const href = item.href(projectId)
                return (
                  <Link key={href} href={href} className={linkClass(href)} onClick={onClose}>
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge === 'pendingReports' && canApprove && pendingCount > 0 && (
                      <span className="rounded-full bg-warning/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-warning">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-4 border-t border-border pt-3">
            {user?.role === 'admin' && (
              <Link
                href="/dashboard/organization/members"
                className={linkClass('/dashboard/organization/members')}
                onClick={onClose}
              >
                <UserCog className="h-4 w-4" />
                チーム管理
              </Link>
            )}
            <Link href="/dashboard/settings" className={linkClass('/dashboard/settings')} onClick={onClose}>
              <Settings className="h-4 w-4" />
              設定
            </Link>
          </div>
        </nav>
      </aside>
    </>
  )
}