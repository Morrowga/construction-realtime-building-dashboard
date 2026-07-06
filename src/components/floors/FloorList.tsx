// src/components/floors/FloorList.tsx
'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getFloors } from '@/lib/api'
import { formatPct } from '@/lib/utils'
import { useProjectStore } from '@/store/projectStore'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { FloorForm } from '@/components/floors/FloorForm'

export function FloorList({ projectId }: { projectId: string }) {
  const [showForm, setShowForm] = useState(false)
  const { user } = useAuth()
  const progress = useProjectStore((s) => s.progress)

  const floorsQuery = useQuery({
    queryKey: ['projects', projectId, 'floors'],
    queryFn: () => getFloors(projectId),
  })

  if (floorsQuery.isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  const floors = floorsQuery.data ?? []
  const progressByFloor = new Map(
    (progress?.floors ?? []).map((f) => [f.floor_id, f]),
  )
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  return (
    <div className="space-y-4">
      {canEdit && (
        <div>
          {showForm ? (
            <FloorForm projectId={projectId} onDone={() => setShowForm(false)} />
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              階を追加
            </Button>
          )}
        </div>
      )}

      {floors.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-10 text-center text-sm text-text-muted">
          まだ階が登録されていません。「階を追加」から始めましょう。
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>階名</TableHead>
              <TableHead>階数</TableHead>
              <TableHead>ゾーン数</TableHead>
              <TableHead className="w-56">平均進捗</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {floors.map((floor) => {
              const fp = progressByFloor.get(floor.id)
              return (
                <TableRow key={floor.id}>
                  <TableCell className="font-medium">{floor.name}</TableCell>
                  <TableCell className="tabular-nums text-text-muted">{floor.level_number}</TableCell>
                  <TableCell className="tabular-nums text-text-muted">
                    {floor.zone_count ?? fp?.zones.length ?? 0}
                  </TableCell>
                  <TableCell>
                    {fp ? <ProgressBar pct={fp.pct} /> : <span className="text-xs text-text-muted">{formatPct(0)}</span>}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
