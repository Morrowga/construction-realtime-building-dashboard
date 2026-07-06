// src/components/floors/FloorForm.tsx
'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createFloor } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const floorSchema = z.object({
  name: z.string().min(1, '階名を入力してください（例: 1F）'),
  level_number: z.coerce.number().int('整数で入力してください'),
})
type FloorValues = z.infer<typeof floorSchema>

export function FloorForm({ projectId, onDone }: { projectId: string; onDone?: () => void }) {
  const queryClient = useQueryClient()
  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<FloorValues>({ resolver: zodResolver(floorSchema) })

  const mutation = useMutation({
    mutationFn: (values: FloorValues) => createFloor(projectId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'floors'] })
      toast.success('階を追加しました')
      reset()
      onDone?.()
    },
    onError: () => toast.error('階の追加に失敗しました'),
  })

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-background p-3"
      noValidate
    >
      <div className="space-y-1">
        <Label htmlFor="floor-name" className="text-xs">階名</Label>
        <Input id="floor-name" placeholder="1F" className="w-28" {...register('name')} />
        {errors.name && <p className="text-xs text-[#f85149]">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="floor-level" className="text-xs">階数</Label>
        <Input id="floor-level" type="number" placeholder="1" className="w-24" {...register('level_number')} />
        {errors.level_number && <p className="text-xs text-[#f85149]">{errors.level_number.message}</p>}
      </div>
      <Button type="submit" size="sm" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        追加
      </Button>
    </form>
  )
}
