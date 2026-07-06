// src/app/dashboard/projects/[id]/reports/page.tsx
'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ReportList } from '@/components/reports/ReportList'
import { useReports } from '@/hooks/useReports'
import { useQuery } from '@tanstack/react-query'
import { getFloors, getZones } from '@/lib/api'

export default function ReportsPage() {
  const params = useParams<{ id: string }>()
  const [selectedFloorId, setSelectedFloorId] = useState<string>('all')
  const [selectedZoneTaskId, setSelectedZoneTaskId] = useState<string>('all')

  // Fetch floors for filter
  const { data: floors = [] } = useQuery({
    queryKey: ['floors', params.id],
    queryFn: () => getFloors(params.id),
    staleTime: 60_000,
  })

  // Fetch zones for selected floor
  const { data: zones = [] } = useQuery({
    queryKey: ['zones', selectedFloorId],
    queryFn: () => getZones(selectedFloorId),
    enabled: selectedFloorId !== 'all',
    staleTime: 60_000,
  })

  // Reset zone when floor changes
  const handleFloorChange = (value: string) => {
    setSelectedFloorId(value)
    setSelectedZoneTaskId('all')
  }

  const pendingQuery = useReports({
    project_id: params.id,
    status: 'pending',
    limit: 100,
    zone_task_id: selectedZoneTaskId !== 'all' ? selectedZoneTaskId : undefined,
  })
  const pendingCount = pendingQuery.data?.length ?? 0

  return (
    <RoleGuard allow={['admin', 'manager', 'engineer']}>
      <div className="mx-auto max-w-6xl space-y-5 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">レポート</h1>

          {/* Floor + Zone filter */}
          <div className="flex items-center gap-2">
            <Select value={selectedFloorId} onValueChange={handleFloorChange}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="全フロア" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全フロア</SelectItem>
                {floors.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedFloorId !== 'all' && zones.length > 0 && (
              <Select value={selectedZoneTaskId} onValueChange={setSelectedZoneTaskId}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue placeholder="全ゾーン" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ゾーン</SelectItem>
                  {zones.flatMap((z) =>
                    (z.tasks ?? []).map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {z.name} — {t.template?.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              承認待ち
              {pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-warning/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-warning">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">履歴</TabsTrigger>
          </TabsList>

          {/* 
            Keep both tab contents mounted at all times with `forceMount`
            to prevent query destruction on tab switch.
            Hide inactive tab with CSS only.
          */}
          <TabsContent value="pending" forceMount className="mt-4 data-[state=inactive]:hidden">
            <ReportList
              projectId={params.id}
              status="pending"
              zoneTaskId={selectedZoneTaskId !== 'all' ? selectedZoneTaskId : undefined}
            />
          </TabsContent>

          <TabsContent value="history" forceMount className="mt-4 data-[state=inactive]:hidden">
            <ReportList
              projectId={params.id}
              status="approved"
              zoneTaskId={selectedZoneTaskId !== 'all' ? selectedZoneTaskId : undefined}
            />
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}