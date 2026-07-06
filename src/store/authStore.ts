// src/store/authStore.ts
'use client'
import { create } from 'zustand'
import type { User } from '@/types/api'
import { getAccessToken, clearTokens } from '@/lib/auth'

interface AuthState {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? getAccessToken() : null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => {
    clearTokens()
    set({ user: null, token: null })
  },
}))
