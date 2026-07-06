// src/app/dashboard/projects/[id]/viewer/page.tsx
'use client'
import { useParams } from 'next/navigation'
import { ViewerEmbed } from '@/components/viewer/ViewerEmbed'

/** Full-height, no padding — the iframe fills the whole content area. */
export default function ViewerPage() {
  const params = useParams<{ id: string }>()
  return (
    <div className="h-full p-0">
      <ViewerEmbed projectId={params.id} />
    </div>
  )
}
