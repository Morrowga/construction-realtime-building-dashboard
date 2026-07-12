// src/app/dashboard/projects/[id]/page.tsx
'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Box, FileText, ImagePlus, Layers, ListChecks, Loader2, Trash2, Users, View,
} from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useProjectStore } from '@/store/projectStore'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import { deleteProject, resolveProjectImageUrl, uploadProjectImage } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { ProgressRing } from '@/components/projects/ProgressRing'
import { FloorProgressChart } from '@/components/projects/FloorProgressChart'

const TABS = [
  { label: '階・フロア', sub: '階の登録と進捗', href: 'floors', icon: Layers },
  { label: 'ゾーン', sub: 'ゾーンとタスク', href: 'zones', icon: Box },
  { label: '工程管理', sub: 'タスクの割り当て', href: 'tasks', icon: ListChecks },
  { label: 'モデル', sub: '3Dモデルの管理', href: 'model', icon: View },
  { label: 'メンバー', sub: '関係者の管理', href: 'members', icon: Users },
  { label: 'レポート', sub: '承認と履歴', href: 'reports', icon: FileText },
]

export default function ProjectOverviewPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const project = useProjectStore((s) => s.activeProject)
  const progress = useProjectStore((s) => s.progress)
  const [confirmOpen, setConfirmOpen] = useState(false)
  // Overrides the displayed image immediately after a successful upload,
  // without needing to know projectStore's internal update API — the
  // upload response already returns the full updated Project, so we just
  // track its image key locally rather than guessing at how to push a
  // refetch through the store.
  const [localImageKey, setLocalImageKey] = useState<string | null | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(params.id),
    onSuccess: () => {
      toast.success('プロジェクトを削除しました')
      router.push('/dashboard')
    },
    onError: () => toast.error('削除に失敗しました'),
  })

  const imageMutation = useMutation({
    mutationFn: (file: File) => uploadProjectImage(params.id, file),
    onSuccess: (updated) => {
      setLocalImageKey(updated.image_s3_key ?? null)
      toast.success('画像を更新しました')
    },
    onError: () => toast.error('画像の更新に失敗しました'),
  })

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) imageMutation.mutate(file)
    e.target.value = '' // allow picking the same file again later
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-5">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const imageUrl = resolveProjectImageUrl({
    ...project,
    image_s3_key: localImageKey !== undefined ? localImageKey : project.image_s3_key,
  })

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-5">
      {/* header: name, status, live overall ring, project image as
          background with a dark overlay so text stays readable
          regardless of what's in the photo */}
      <div className="relative overflow-hidden rounded-lg border border-border">
        {imageUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={project.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/40" />
          </>
        )}
        <div className={`relative flex flex-wrap items-center gap-5 p-5 ${imageUrl ? '' : 'bg-surface'}`}>
          <ProgressRing pct={progress?.overall_pct ?? 0} size={96} />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className={`text-lg font-semibold ${imageUrl ? 'text-white' : ''}`}>{project.name}</h1>
              <Badge variant="warning">{project.status}</Badge>
            </div>
            {project.address && (
              <p className={`text-sm ${imageUrl ? 'text-white/80' : 'text-text-muted'}`}>{project.address}</p>
            )}
            <p className={`mt-1 text-xs ${imageUrl ? 'text-white/70' : 'text-text-muted'}`}>
              竣工予定: {formatDate(project.planned_end_date)}
            </p>
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleImagePick}
              />
              <Button
                variant="outline"
                className={imageUrl ? 'gap-1.5 border-white/30 bg-white/10 text-white hover:bg-white/20' : 'gap-1.5'}
                disabled={imageMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {imageMutation.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <ImagePlus className="h-4 w-4" />}
                画像を変更
              </Button>
              {user?.role === 'admin' && (
                <Button
                  variant="outline"
                  className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  プロジェクトを削除
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* tab cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {TABS.map((tab) => (
          <Link key={tab.href} href={`/dashboard/projects/${params.id}/${tab.href}`}>
            <Card className="h-full transition-colors hover:border-accent/60">
              <CardContent className="flex flex-col items-start gap-2 p-4">
                <tab.icon className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-medium">{tab.label}</p>
                  <p className="text-[11px] text-text-muted">{tab.sub}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* per-floor progress chart (live via WebSocket invalidation) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">階別進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <FloorProgressChart floors={progress?.floors ?? []} />
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>本当に削除しますか？</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-muted">
            「{project.name}」を削除すると、階・ゾーン・工程・レポート・承認履歴・3Dモデルを含む
            すべてのデータが完全に削除されます。<strong className="text-destructive">この操作は取り消せません。</strong>
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              キャンセル
            </Button>
            <Button
              className="gap-1.5 bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              削除する
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}