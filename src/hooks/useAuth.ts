// src/hooks/useAuth.ts
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { login as apiLogin, getMe, registerOrganization, type OrganizationRegisterPayload } from '@/lib/api'
import { storeTokens, getAccessToken, isTokenExpired } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'

// Only these roles can use the web dashboard — engineer/client are
// mobile-app-only (once that exists). Kept here, next to the login
// redirect logic, rather than duplicated across every guard.
const WEB_DASHBOARD_ROLES = ['admin', 'manager']

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, token, setUser, setToken, logout } = useAuthStore()

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: !!token && !isTokenExpired(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (meQuery.data) setUser(meQuery.data)
  }, [meQuery.data, setUser])

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiLogin(email, password),
    onSuccess: async (tokens) => {
      storeTokens(tokens)
      setToken(tokens.access_token)
      const me = await getMe()
      setUser(me)
      queryClient.setQueryData(['auth', 'me'], me)
      // Route by role right here, at the source — engineer/client go
      // straight to the mobile-only notice instead of ever rendering the
      // dashboard shell first and getting bounced out by RoleGuard a beat
      // later (which would show a visible flash of dashboard UI).
      router.push(WEB_DASHBOARD_ROLES.includes(me.role) ? '/dashboard' : '/mobile-only')
    },
  })

  // Organization signup — creates the Organization + its first admin user
  // in one call, then logs them straight in. Always admin, so always goes
  // to /dashboard.
  const registerMutation = useMutation({
    mutationFn: (payload: OrganizationRegisterPayload) => registerOrganization(payload),
    onSuccess: async (tokens) => {
      storeTokens(tokens)
      setToken(tokens.access_token)
      const me = await getMe()
      setUser(me)
      queryClient.setQueryData(['auth', 'me'], me)
      router.push('/dashboard')
    },
  })

  const signOut = () => {
    logout()
    queryClient.clear()
    router.push('/login')
  }

  const currentToken = token ?? getAccessToken()
  const isAuthenticated = !!currentToken && !isTokenExpired(currentToken)

  return {
    user,
    token,
    isLoading: meQuery.isLoading,
    isAuthenticated,
    login: loginMutation,
    registerOrganization: registerMutation,
    signOut,
  }
}