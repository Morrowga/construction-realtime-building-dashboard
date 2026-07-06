// src/components/zones/ZoneList.tsx
'use client'
import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getFloors, getZones } from '@/lib/api'
import { categoryHex, cn } from '@/lib/utils'
import { useProjectStore } from '@/store/projectStore'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ColourSignalBadge } from '@/components/shared/ColourSignalBadge'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { ZoneForm } from '@/components/zones/ZoneForm'

export function ZoneList({ projectId }: { projectId: string }) {
  const { user } = useAuth()
  const progress = useProjectStore((s) => s.progress)
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null)
  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const floorsQuery = useQuery({
    queryKey: ['projects', projectId, 'floors'],
    queryFn: () => getFloors(projectId),
  })
  const floors = floorsQuery.data ?? []
  const floorId = selectedFloorId ?? floors[0]?.id ?? null

  const zonesQuery = useQuery({
    queryKey: ['zones', floorId],
    queryFn: () => getZones(floorId!),
    enabled: !!floorId,
  })

  const zoneProgressById = useMemo(() => {
    const map = new Map<string, (typeof progress extends null ? never : NonNullable<typeof progress>)['floors'][number]['zones'][number]>()
    progress?.floors.forEach((f) => f.zones.forEach((z) => map.set(z.zone_id, z)))
    return map
  }, [progress])

  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  if (floorsQuery.isLoading) {
    return <Skeleton className="h-48 w-full" />
  }
  if (!floors.length) {
    return (
      <p className="rounded-md border border-dashed border-border py-10 text-center text-sm text-text-muted">
        先に「階・ゾーン」画面で階を登録してください。
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-44">
          <Select value={floorId ?? undefined} onValueChange={setSelectedFloorId}>
            <SelectTrigger><SelectValue placeholder="階を選択" /></SelectTrigger>
            <SelectContent>
              {floors.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canEdit && floorId && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            ゾーンを追加
          </Button>
        )}
      </div>

      {zonesQuery.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !zonesQuery.data?.length ? (
        <p className="rounded-md border border-dashed border-border py-10 text-center text-sm text-text-muted">
          この階にはまだゾーンがありません。
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>ゾーン名</TableHead>
              <TableHead>種別</TableHead>
              <TableHead>メッシュ ID</TableHead>
              <TableHead>タスク数</TableHead>
              <TableHead className="w-52">進捗</TableHead>
              <TableHead>状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zonesQuery.data.map((zone) => {
              const zp = zoneProgressById.get(zone.id)
              const expanded = expandedZoneId === zone.id
              return (
                <>
                  <TableRow
                    key={zone.id}
                    className="cursor-pointer"
                    onClick={() => setExpandedZoneId(expanded ? null : zone.id)}
                  >
                    <TableCell>
                      {expanded
                        ? <ChevronDown className="h-4 w-4 text-text-muted" />
                        : <ChevronRight className="h-4 w-4 text-text-muted" />}
                    </TableCell>
                    <TableCell className="font-medium">{zone.name}</TableCell>
                    <TableCell className="text-text-muted">{zone.zone_type ?? '—'}</TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      {zone.model_mesh_id ?? '—'}
                    </TableCell>
                    <TableCell className="tabular-nums text-text-muted">
                      {zp?.tasks.length ?? 0}
                    </TableCell>
                    <TableCell>
                      <ProgressBar pct={zp?.pct ?? 0} signal={zp?.colour_signal} />
                    </TableCell>
                    <TableCell>
                      <ColourSignalBadge signal={zp?.colour_signal ?? 'grey'} />
                    </TableCell>
                  </TableRow>
                  {expanded && (
                    <TableRow key={`${zone.id}-tasks`} className="bg-background/40">
                      <TableCell />
                      <TableCell colSpan={6}>
                        {zp?.tasks.length ? (
                          <div className="space-y-1.5 py-1">
                            {[...zp.tasks]
                              .sort((a, b) => a.layer_order - b.layer_order)
                              .map((task) => (
                                <div key={task.zone_task_id} className="flex items-center gap-3 text-sm">
                                  <span className="w-6 text-right text-xs tabular-nums text-muted">
                                    {task.layer_order}
                                  </span>
                                  <span
                                    className="h-2.5 w-2.5 rounded-sm"
                                    style={{ backgroundColor: categoryHex(task.task_category) }}
                                  />
                                  <span
                                    className={cn(
                                      'w-44 truncate',
                                      task.colour_signal === 'grey' && 'text-text-muted',
                                    )}
                                  >
                                    {task.task_name}
                                  </span>
                                  <ProgressBar
                                    pct={task.pct}
                                    signal={task.colour_signal}
                                    className="max-w-xs flex-1"
                                  />
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="py-1 text-xs text-text-muted">タスクが割り当てられていません</p>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )
            })}
          </TableBody>
        </Table>
      )}

      {showForm && floorId && (
        <ZoneForm floorId={floorId} projectId={projectId} onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
