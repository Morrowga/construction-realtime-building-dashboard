// src/components/zones/ZoneForm.tsx
'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'
import { createZone } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const ZONE_TYPES = [
  { value: 'room', label: '居室' },
  { value: 'open_area', label: 'オープンエリア' },
  { value: 'corridor', label: '廊下' },
  { value: 'stairwell', label: '階段室' },
  { value: 'mechanical', label: '機械室' },
  { value: 'structural', label: '構造部' },
  { value: 'facade', label: 'ファサード' },
  { value: 'roof', label: '屋上' },
]

const zoneSchema = z.object({
  name: z.string().min(1, 'ゾーン名を入力してください'),
  zone_type: z.string().min(1),
  model_mesh_id: z.string().optional(),
})
type ZoneValues = z.infer<typeof zoneSchema>

/** Slide-over panel for creating a zone on the selected floor. */
export function ZoneForm({
  floorId, projectId, onClose,
}: { floorId: string; projectId: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const {
    register, handleSubmit, setValue, watch, formState: { errors },
  } = useForm<ZoneValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: { zone_type: 'room' },
  })

  const mutation = useMutation({
    mutationFn: (values: ZoneValues) =>
      createZone(floorId, {
        name: values.name,
        zone_type: values.zone_type,
        model_mesh_id: values.model_mesh_id || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones', floorId] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'progress'] })
      toast.success('ゾーンを追加しました')
      onClose()
    },
    onError: () => toast.error('ゾーンの追加に失敗しました'),
  })

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-border bg-surface p-5 animate-slide-in">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">ゾーンを追加</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary" aria-label="閉じる">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="zone-name">ゾーン名</Label>
            <Input id="zone-name" placeholder="リビングルーム" {...register('name')} />
            {errors.name && <p className="text-xs text-[#f85149]">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>ゾーン種別</Label>
            <Select value={watch('zone_type')} onValueChange={(v) => setValue('zone_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ZONE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zone-mesh">3Dメッシュ ID（任意）</Label>
            <Input id="zone-mesh" placeholder="Zone_LivingRoom_1F" {...register('model_mesh_id')} />
            <p className="text-xs text-text-muted">3Dモデル内のメッシュノード名と対応します</p>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            追加する
          </Button>
        </form>
      </div>
    </>
  )
}
