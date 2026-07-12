// src/components/landing/LandingHero.tsx
'use client'
import Link from 'next/link'
import { CinematicBackground } from '@/components/landing/CinematicBackground'

export function LandingHero() {
  return (
    <section className="relative flex h-screen w-full flex-col justify-end overflow-hidden bg-[#03151f]">
      <CinematicBackground />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 pb-24 text-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            建設進捗プラットフォーム
          </h1>
          <p className="mt-2 text-sm text-white/70 sm:text-base">
            現場の進捗を、リアルタイムに可視化する
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-md bg-white px-6 py-2.5 text-sm font-medium text-[#03151f] transition-colors hover:bg-white/90"
          >
            ログイン
          </Link>
          <Link
            href="/login?mode=register"
            className="rounded-md border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            新規登録
          </Link>
        </div>
      </div>

      <p className="absolute bottom-4 left-0 right-0 z-10 text-center text-xs text-white/50">
        © 2026 Construction Progress Platform. All rights reserved.
      </p>
    </section>
  )
}