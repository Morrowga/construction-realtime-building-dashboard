// src/components/projects/ProjectForm.tsx
'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createProject } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const projectSchema = z.object({
  name: z.string().min(1, 'プロジェクト名を入力してください'),
  address: z.string().min(1, '住所を入力してください'),
  planned_end_date: z.string().min(1, '竣工予定日を選択してください'),
  report_format: z.enum(['standard', 'nikken']),
  geo_lat: z.coerce.number().min(-90).max(90),
  geo_lng: z.coerce.number().min(-180).max(180),
})
type ProjectValues = z.infer<typeof projectSchema>

export function ProjectForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    register, handleSubmit, setValue, watch, formState: { errors },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { report_format: 'standard', geo_lat: 35.6812, geo_lng: 139.7671 },
  })

  const mutation = useMutation({
    mutationFn: (values: ProjectValues) => createProject(values),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('プロジェクトを作成しました')
      router.push(`/dashboard/projects/${project.id}`)
    },
    onError: () => toast.error('プロジェクトの作成に失敗しました'),
  })

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="max-w-lg space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="name">プロジェクト名</Label>
        <Input id="name" placeholder="〇〇マンション新築工事" {...register('name')} />
        {errors.name && <p className="text-xs text-[#f85149]">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">住所</Label>
        <Input id="address" placeholder="東京都渋谷区…" {...register('address')} />
        {errors.address && <p className="text-xs text-[#f85149]">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="planned_end_date">竣工予定日</Label>
          <Input id="planned_end_date" type="date" {...register('planned_end_date')} />
          {errors.planned_end_date && (
            <p className="text-xs text-[#f85149]">{errors.planned_end_date.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>レポート形式</Label>
          <Select
            value={watch('report_format')}
            onValueChange={(v) => setValue('report_format', v as 'standard' | 'nikken')}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">標準</SelectItem>
              <SelectItem value="nikken">日建形式</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="geo_lat">緯度</Label>
          <Input id="geo_lat" type="number" step="any" {...register('geo_lat')} />
          {errors.geo_lat && <p className="text-xs text-[#f85149]">{errors.geo_lat.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="geo_lng">経度</Label>
          <Input id="geo_lng" type="number" step="any" {...register('geo_lng')} />
          {errors.geo_lng && <p className="text-xs text-[#f85149]">{errors.geo_lng.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        プロジェクトを作成
      </Button>
    </form>
  )
}
