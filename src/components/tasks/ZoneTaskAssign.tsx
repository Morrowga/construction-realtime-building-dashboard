// src/components/tasks/ZoneTaskAssign.tsx
'use client'
import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Loader2, Trash2, Wand2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { assignTask, deleteZoneTask, getFloors, getTaskTemplates, getZones } from '@/lib/api'
import { categoryHex, CATEGORY_LABELS, ZONE_TASK_SEQUENCES } from '@/lib/utils'
import type { TaskTemplate } from '@/types/api'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useProjectStore } from '@/store/projectStore'

interface PendingTask {
  template: TaskTemplate
  layer_order: number
}

/**
 * Right-hand panel of the 工程管理 screen: pick a zone, queue templates in
 * layer order (reorder with ↑/↓), optionally load a suggested sequence,
 * then assign everything with `layer_order` included on each call.
 *
 * Also shows the zone's ALREADY-ASSIGNED tasks (from live progress data)
 * with a real delete action — previously the only Trash2 button in this
 * component removed items from the local pending queue before submission,
 * there was no way to remove a task that had already been saved.
 */
export function ZoneTaskAssign({
  projectId, pendingTemplate, onConsumeTemplate,
}: {
  projectId: string
  pendingTemplate: TaskTemplate | null
  onConsumeTemplate: () => void
}) {
  const queryClient = useQueryClient()
  const progress = useProjectStore((s) => s.progress)
  const [floorId, setFloorId] = useState<string | null>(null)
  const [zoneId, setZoneId] = useState<string | null>(null)
  const [queue, setQueue] = useState<PendingTask[]>([])
  const [sequenceKey, setSequenceKey] = useState<string>('')

  const floorsQuery = useQuery({
    queryKey: ['projects', projectId, 'floors'],
    queryFn: () => getFloors(projectId),
  })
  const effectiveFloorId = floorId ?? floorsQuery.data?.[0]?.id ?? null

  const zonesQuery = useQuery({
    queryKey: ['zones', effectiveFloorId],
    queryFn: () => getZones(effectiveFloorId!),
    enabled: !!effectiveFloorId,
  })

  const allTemplatesQuery = useQuery({
    queryKey: ['task-templates', 'all'],
    queryFn: () => getTaskTemplates(),
  })

  // Already-assigned tasks for the selected zone, sorted by layer_order —
  // sourced from live progress data (same store the 3D viewer/dashboard
  // reads), so this always reflects real saved state, not local queue state.
  const existingTasks = useMemo(() => {
    if (!zoneId || !progress) return []
    for (const floor of progress.floors) {
      const zone = floor.zones.find((z) => z.zone_id === zoneId)
      if (zone) return [...zone.tasks].sort((a, b) => (a.layer_order ?? 0) - (b.layer_order ?? 0))
    }
    return []
  }, [zoneId, progress])

  const existingCount = existingTasks.length

  // A template clicked in the library gets appended to the queue.
  useEffect(() => {
    if (!pendingTemplate) return
    setQueue((q) => [
      ...q,
      { template: pendingTemplate, layer_order: existingCount + q.length + 1 },
    ])
    onConsumeTemplate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTemplate])

  const loadSequence = (key: string) => {
    setSequenceKey(key)
    const seq = ZONE_TASK_SEQUENCES[key]
    const templates = allTemplatesQuery.data ?? []
    if (!seq) return
    const matched: PendingTask[] = []
    const missing: string[] = []
    seq.forEach((step) => {
      const template = templates.find((t) => t.name === step.name && t.category === step.category)
        ?? templates.find((t) => t.category === step.category)
      if (template) {
        matched.push({ template, layer_order: existingCount + matched.length + 1 })
      } else {
        missing.push(step.name)
      }
    })
    setQueue(matched)
    if (missing.length) {
      toast.warning(`テンプレート未登録: ${missing.join('、')}`)
    }
  }

  const move = (index: number, dir: -1 | 1) => {
    setQueue((q) => {
      const next = [...q]
      const j = index + dir
      if (j < 0 || j >= next.length) return q
      ;[next[index], next[j]] = [next[j], next[index]]
      return next.map((item, i) => ({ ...item, layer_order: existingCount + i + 1 }))
    })
  }

  const remove = (index: number) => {
    setQueue((q) =>
      q.filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, layer_order: existingCount + i + 1 })),
    )
  }

  const assignMutation = useMutation({
    mutationFn: async () => {
      for (const item of queue) {
        // sequential to preserve layer order server-side
        // eslint-disable-next-line no-await-in-loop
        await assignTask(zoneId!, {
          task_template_id: item.template.id,
          layer_order: item.layer_order,
        })
      }
    },
    onSuccess: () => {
      toast.success(`${queue.length}件のタスクを割り当てました`)
      setQueue([])
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'progress'] })
      queryClient.invalidateQueries({ queryKey: ['zones'] })
    },
    onError: () => toast.error('タスクの割り当てに失敗しました'),
  })

  const deleteMutation = useMutation({
    mutationFn: (zoneTaskId: string) => deleteZoneTask(zoneId!, zoneTaskId),
    onSuccess: () => {
      toast.success('工程を削除しました')
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'progress'] })
      queryClient.invalidateQueries({ queryKey: ['zones'] })
    },
    onError: () => toast.error('削除に失敗しました。この工程にすでに報告が紐づいている可能性があります'),
  })

  const handleDeleteExisting = (zoneTaskId: string, taskName: string) => {
    if (!window.confirm(`「${taskName}」を削除しますか？関連する報告・承認履歴もすべて削除されます。`)) return
    deleteMutation.mutate(zoneTaskId)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select value={effectiveFloorId ?? undefined} onValueChange={(v) => { setFloorId(v); setZoneId(null) }}>
          <SelectTrigger><SelectValue placeholder="階" /></SelectTrigger>
          <SelectContent>
            {(floorsQuery.data ?? []).map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={zoneId ?? undefined} onValueChange={setZoneId}>
          <SelectTrigger><SelectValue placeholder="ゾーン" /></SelectTrigger>
          <SelectContent>
            {(zonesQuery.data ?? []).map((z) => (
              <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {zoneId && existingTasks.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-text-muted">割り当て済みの工程（{existingTasks.length}件）</p>
          <ul className="space-y-1.5">
            {existingTasks.map((task) => {
              const isDeleting = deleteMutation.isPending && deleteMutation.variables === task.zone_task_id
              const sigColor = task.colour_signal === 'green' ? '#2ea043'
                : task.colour_signal === 'amber' ? '#d29922' : 'var(--grey)'
              return (
                <li
                  key={task.zone_task_id}
                  className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm"
                >
                  <span className="w-6 text-right text-xs font-semibold tabular-nums text-text-muted">
                    {task.layer_order}
                  </span>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sigColor }} />
                  <span className="flex-1 truncate">{task.task_name}</span>
                  <span className="text-xs tabular-nums text-text-muted">{task.pct.toFixed(0)}%</span>
                  <button
                    onClick={() => handleDeleteExisting(task.zone_task_id, task.task_name ?? '')}
                    disabled={isDeleting}
                    className="text-text-muted hover:text-[#f85149] disabled:opacity-50"
                    aria-label="削除"
                  >
                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-text-muted" />
        <div className="flex-1">
          <Select value={sequenceKey} onValueChange={loadSequence}>
            <SelectTrigger><SelectValue placeholder="標準工程シーケンスを読み込む" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="structural_slab">構造スラブ</SelectItem>
              <SelectItem value="room_residential">居室（住宅）</SelectItem>
              <SelectItem value="bathroom">浴室・水回り</SelectItem>
              <SelectItem value="terrace">テラス</SelectItem>
              <SelectItem value="rooftop">屋上</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!zoneId ? (
        <p className="rounded-md border border-dashed border-border py-8 text-center text-sm text-text-muted">
          ゾーンを選択すると、左のテンプレートをクリックして工程を積み上げられます
        </p>
      ) : queue.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-8 text-center text-sm text-text-muted">
          左のテンプレートをクリック、またはシーケンスを読み込んでください
          {existingCount > 0 && (
            <span className="mt-1 block text-xs">（既存タスク: {existingCount}件 → 次はレイヤー {existingCount + 1}）</span>
          )}
        </p>
      ) : (
        <>
          <ul className="space-y-1.5">
            {queue.map((item, index) => (
              <li
                key={`${item.template.id}-${index}`}
                className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm"
              >
                <span className="w-6 text-right text-xs font-semibold tabular-nums text-text-muted">
                  {item.layer_order}
                </span>
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: categoryHex(item.template.category) }}
                />
                <span className="flex-1 truncate">{item.template.name}</span>
                <span className="text-xs text-text-muted">
                  {CATEGORY_LABELS[item.template.category] ?? item.template.category}
                </span>
                <button onClick={() => move(index, -1)} className="text-text-muted hover:text-text-primary" aria-label="上へ">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => move(index, 1)} className="text-text-muted hover:text-text-primary" aria-label="下へ">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => remove(index)} className="text-text-muted hover:text-[#f85149]" aria-label="削除">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <Button
            className="w-full"
            disabled={assignMutation.isPending}
            onClick={() => assignMutation.mutate()}
          >
            {assignMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {queue.length}件を割り当て
          </Button>
        </>
      )}
    </div>
  )
}