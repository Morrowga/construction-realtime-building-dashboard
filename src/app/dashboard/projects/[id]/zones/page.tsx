// src/app/dashboard/projects/[id]/zones/page.tsx
'use client'
import { useParams } from 'next/navigation'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { ZoneList } from '@/components/zones/ZoneList'

export default function ZonesPage() {
  const params = useParams<{ id: string }>()
  return (
    <RoleGuard allow={['admin', 'manager']}>
      <div className="mx-auto max-w-6xl space-y-5 p-5">
        <h1 className="text-lg font-semibold">ゾーン</h1>
        <ZoneList projectId={params.id} />
      </div>
    </RoleGuard>
  )
}
