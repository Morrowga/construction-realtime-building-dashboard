// src/app/page.tsx
'use client'
import { useState } from 'react'
import { LandingHero } from '@/components/landing/LandingHero'
import { ContactDialog } from '@/components/landing/ContactDialog'

export default function LandingPage() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <main className="h-screen overflow-hidden">
      <LandingHero />
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </main>
  )
}