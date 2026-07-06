// src/components/model/ModelUpload.tsx
'use client'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, FileText, FileUp, Layers3, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { uploadModel } from '@/lib/api'
import { cn } from '@/lib/utils'

const FORMAT_ICONS = [
  { ext: '.ifc', label: 'IFC', icon: Layers3, note: 'BIMモデル（非同期解析）' },
  { ext: '.pdf', label: 'PDF', icon: FileText, note: '図面（AI解析）' },
  { ext: '.glb', label: 'GLB', icon: Box, note: '3Dモデル（即時反映）' },
  { ext: '.gltf', label: 'GLTF', icon: Box, note: '3Dモデル（即時反映）' },
]

export function ModelUpload({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (file: File) => uploadModel(projectId, file),
    onSuccess: (model) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'model'] })
      toast.success(
        model.parse_status === 'done'
          ? 'モデルをアップロードしました（反映済み）'
          : 'モデルをアップロードしました。解析を開始します…',
      )
    },
    onError: () => toast.error('アップロードに失敗しました。ファイル形式をご確認ください。'),
  })

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0]
      if (file) mutation.mutate(file)
    },
    [mutation],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
      'application/pdf': ['.pdf'],
      'application/octet-stream': ['.ifc'],
    },
  })

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
          isDragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-muted',
        )}
      >
        <input {...getInputProps()} />
        {mutation.isPending ? (
          <Loader2 className="h-7 w-7 animate-spin text-accent" />
        ) : (
          <FileUp className="h-7 w-7 text-text-muted" />
        )}
        <p className="text-sm">
          {isDragActive ? 'ここにドロップ' : 'ファイルをドラッグ、またはクリックして選択'}
        </p>
        <p className="text-xs text-text-muted">IFC / PDF / GLB / GLTF に対応</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FORMAT_ICONS.map((f) => (
          <div key={f.ext} className="flex items-center gap-2 rounded-md border border-border bg-surface p-2.5">
            <f.icon className="h-4 w-4 flex-shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-xs font-medium">{f.label}</p>
              <p className="truncate text-[10px] text-text-muted">{f.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
