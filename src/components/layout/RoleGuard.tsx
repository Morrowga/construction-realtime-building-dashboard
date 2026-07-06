// src/components/layout/RoleGuard.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { getAccessToken, isTokenExpired } from '@/lib/auth'
import type { UserRole } from '@/types/api'
import { Skeleton } from '@/components/ui/skeleton'

const EXPIRY_CHECK_INTERVAL_MS = 15_000

export function RoleGuard({
  allow, redirectTo = '/dashboard', children,
}: { allow?: UserRole[]; redirectTo?: string; children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    // Wrong role for this section entirely — e.g. engineer/client hitting
    // the web dashboard, which is admin/manager only (they get the mobile
    // app instead). redirectTo lets the top-level dashboard layout send
    // these users somewhere other than back into /dashboard itself, which
    // would otherwise loop since /dashboard is exactly what's guarded.
    if (!isLoading && user && allow && !allow.includes(user.role)) {
      router.replace(redirectTo)
    }
  }, [mounted, isAuthenticated, isLoading, user, allow, redirectTo, router])

  useEffect(() => {
    if (!mounted) return

    const checkExpiry = () => {
      const token = getAccessToken()
      if (isTokenExpired(token)) {
        useAuthStore.getState().logout()
        router.replace('/login')
      }
    }

    checkExpiry()
    const interval = setInterval(checkExpiry, EXPIRY_CHECK_INTERVAL_MS)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkExpiry()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [mounted, router])

  if (!mounted) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!isAuthenticated || isLoading || !user) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (allow && !allow.includes(user.role)) return null

  return <>{children}</>
}