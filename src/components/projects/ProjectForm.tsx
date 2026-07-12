// src/components/projects/ProjectForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, ImagePlus, X } from 'lucide-react'
import { createProject, uploadProjectImage } from '@/lib/api'
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

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  const mutation = useMutation({
    mutationFn: async (values: ProjectValues) => {
      // Two-step by necessity: the image upload endpoint is
      // POST /projects/{project_id}/image, and project_id only exists
      // after creation. Image upload failing here is treated as
      // non-fatal — the project itself already exists at that point,
      // so we still navigate through rather than leaving the user
      // stuck on a form for a problem with just the image.
      const project = await createProject(values)
      if (imageFile) {
        try {
          await uploadProjectImage(project.id, imageFile)
        } catch {
          toast.error('プロジェクトは作成されましたが、画像のアップロードに失敗しました')
        }
      }
      return project
    },
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
        <Label>プロジェクト画像（任意）</Label>
        {imagePreview ? (
          <div className="relative h-40 w-full overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border text-text-muted hover:border-accent/60 hover:text-accent">
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs">クリックして画像を選択</span>
            <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleImagePick} />
          </label>
        )}
      </div>

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

      <Button
        type="submit"
        className="bg-gradient-to-r from-accent to-black hover:opacity-90 transition-opacity"
        disabled={mutation.isPending}
      >
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        プロジェクトを作成
      </Button>
    </form>
  )
}