// src/components/landing/CinematicBackground.tsx
'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

const STAGES = [
  '/landing/stage-1.png',
  '/landing/stage-2.png',
  '/landing/stage-3.png',
  '/landing/stage-4.png',
  '/landing/stage-5.png',
]

const HOLD_MS = 4000
const FADE_MS = 1500

export function CinematicBackground() {
  const [current, setCurrent] = useState(0)
  const [next, setNext] = useState(1)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const holdTimer = setTimeout(() => setFading(true), HOLD_MS)
    return () => clearTimeout(holdTimer)
  }, [current])

  useEffect(() => {
    if (!fading) return
    const fadeTimer = setTimeout(() => {
      setCurrent(next)
      setNext((next + 1) % STAGES.length)
      setFading(false)
    }, FADE_MS)
    return () => clearTimeout(fadeTimer)
  }, [fading, next])

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#03151f]">
      <Image
        src={STAGES[current]}
        alt=""
        fill
        priority
        className="object-cover animate-[kenburns_18s_ease-in-out_infinite]"
      />
      <Image
        src={STAGES[next]}
        alt=""
        fill
        className="object-cover animate-[kenburns_18s_ease-in-out_infinite] transition-opacity"
        style={{ opacity: fading ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#03151f]/40 via-transparent to-[#03151f]/70" />

      <style jsx global>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
      `}</style>
    </div>
  )
}