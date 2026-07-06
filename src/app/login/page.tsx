// src/app/login/page.tsx
'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CinematicBackground } from '@/components/landing/CinematicBackground'
import { AuthCard } from '@/components/auth/AuthCard'

function LoginPageContent() {
  const params = useSearchParams()
  const initialMode = params.get('mode') === 'register' ? 'register' : 'login'

  return (
    <main className="relative flex h-screen w-full items-center justify-end overflow-hidden bg-[#03151f] px-6 sm:px-16">
      <CinematicBackground />
      <div className="relative z-10">
        <AuthCard initialMode={initialMode} />
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}