// src/app/dashboard/projects/[id]/floors/page.tsx
'use client'
import { useParams } from 'next/navigation'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { FloorList } from '@/components/floors/FloorList'

export default function FloorsPage() {
  const params = useParams<{ id: string }>()
  return (
    <RoleGuard allow={['admin', 'manager']}>
      <div className="mx-auto max-w-5xl space-y-5 p-5">
        <h1 className="text-lg font-semibold">階・フロア</h1>
        <FloorList projectId={params.id} />
      </div>
    </RoleGuard>
  )
}
