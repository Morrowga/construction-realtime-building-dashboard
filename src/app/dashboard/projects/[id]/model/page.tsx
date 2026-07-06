// src/app/dashboard/projects/[id]/model/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { View } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getModelFile, saveZoneMap } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ModelStatus } from '@/components/model/ModelStatus'
import { ModelUpload } from '@/components/model/ModelUpload'

export default function ModelPage() {
  const params = useParams<{ id: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [edits, setEdits] = useState<Record<string, string>>({})

  const modelQuery = useQuery({
    queryKey: ['projects', params.id, 'model'],
    queryFn: () => getModelFile(params.id),
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.parse_status === 'processing' ? 4000 : false,
  })

  const saveMutation = useMutation({
    mutationFn: (zone_map: Record<string, string>) => saveZoneMap(params.id, zone_map),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', params.id, 'model'] })
      toast.success('ゾーンマップを保存しました')
      setEdits({})
    },
    onError: () => toast.error('ゾーンマップの保存に失敗しました'),
  })

  const model = modelQuery.data ?? null
  const zoneMap = model?.zone_map ?? {}
  const merged = { ...zoneMap, ...edits }
  const canUpload = user?.role === 'admin'  // managers are read-only here

  return (
    <RoleGuard allow={['admin', 'manager']}>
      <div className="mx-auto max-w-5xl space-y-5 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">3Dモデル</h1>
          <Link href={`/dashboard/projects/${params.id}/viewer`}>
            <Button variant="outline" size="sm">
              <View className="h-4 w-4" />
              3Dビューアーで確認
            </Button>
          </Link>
        </div>

        {modelQuery.isLoading ? <Skeleton className="h-16 w-full" /> : <ModelStatus model={model} />}

        {canUpload && <ModelUpload projectId={params.id} />}
        {!canUpload && (
          <p className="text-xs text-text-muted">
            モデルのアップロードは管理者のみ可能です（閲覧のみ）。
          </p>
        )}

        {Object.keys(merged).length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium">ゾーンマップ（メッシュ ID ↔ ゾーン名）</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>メッシュ ID</TableHead>
                  <TableHead>ゾーン名</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(merged).map(([meshId, zoneName]) => (
                  <TableRow key={meshId}>
                    <TableCell className="font-mono text-xs">{meshId}</TableCell>
                    <TableCell>
                      {canUpload ? (
                        <Input
                          value={zoneName}
                          onChange={(e) => setEdits((prev) => ({ ...prev, [meshId]: e.target.value }))}
                          className="h-8 max-w-xs"
                        />
                      ) : (
                        zoneName
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {canUpload && Object.keys(edits).length > 0 && (
              <Button size="sm" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(merged)}>
                ゾーンマップを保存
              </Button>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
