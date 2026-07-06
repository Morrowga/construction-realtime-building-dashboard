// src/components/model/ModelUpload.tsx
'use client'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, Check, FileText, FileUp, Layers3, Loader2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getModelFile, uploadModel, type ModelFileType } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { ModelFile } from '@/types/api'

const SKELETON_FORMATS = [
  { ext: '.ifc', label: 'IFC', icon: Layers3, note: 'BIMモデル（非同期解析）' },
  { ext: '.pdf', label: 'PDF', icon: FileText, note: '図面（AI解析）' },
  { ext: '.glb', label: 'GLB', icon: Box, note: '3Dモデル（即時反映）' },
  { ext: '.gltf', label: 'GLTF', icon: Box, note: '3Dモデル（即時反映）' },
]

interface LayerConfig {
  fileType: ModelFileType
  title: string
  subtitle: string
  accept: Record<string, string[]>
  hint: string
  isAttached: (model: ModelFile | undefined) => boolean
}

const LAYERS: LayerConfig[] = [
  {
    fileType: 'skeleton',
    title: '骨格',
    subtitle: 'IFC / PDF / GLB / GLTF に対応',
    accept: {
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
      'application/pdf': ['.pdf'],
      'application/octet-stream': ['.ifc'],
    },
    hint: '構造フレーム（常時表示）',
    isAttached: (m) => !!m?.gltf_s3_key,
  },
  {
    fileType: 'envelope',
    title: '外壁',
    subtitle: 'GLB / GLTF のみ対応',
    accept: {
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
    },
    hint: '外装シェル（進捗で色分け）',
    isAttached: (m) => !!m?.envelope_s3_key,
  },
  {
    fileType: 'interior',
    title: '内装',
    subtitle: 'GLB / GLTF のみ対応',
    accept: {
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
    },
    hint: '室内サーフェス（進捗で色分け）',
    isAttached: (m) => !!m?.interior_s3_key,
  },
]

function LayerDropzone({
  projectId, layer, model,
}: { projectId: string; layer: LayerConfig; model: ModelFile | undefined }) {
  const queryClient = useQueryClient()
  const attached = layer.isAttached(model)

  const mutation = useMutation({
    mutationFn: (file: File) => uploadModel(projectId, file, layer.fileType),
    onSuccess: (updated) => {
      queryClient.setQueryData(['projects', projectId, 'model'], updated)
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'model'] })
      toast.success(
        layer.fileType === 'skeleton' && updated.parse_status !== 'done'
          ? `${layer.title}をアップロードしました。解析を開始します…`
          : `${layer.title}をアップロードしました（反映済み）`,
      )
    },
    onError: () => toast.error(`${layer.title}のアップロードに失敗しました。ファイル形式をご確認ください。`),
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
    accept: layer.accept,
  })

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
          isDragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-muted',
        )}
      >
        <input {...getInputProps()} />
        {mutation.isPending ? (
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        ) : attached ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15">
            <Check className="h-4 w-4 text-emerald-500" />
          </div>
        ) : (
          <FileUp className="h-6 w-6 text-text-muted" />
        )}
        <div>
          <p className="text-sm font-medium">
            {layer.title}
            {attached && !mutation.isPending && (
              <span className="ml-1.5 text-xs font-normal text-emerald-500">設定済み</span>
            )}
          </p>
          <p className="text-xs text-text-muted">{layer.hint}</p>
        </div>
        <p className="text-[10px] text-text-muted">
          {isDragActive ? 'ここにドロップ' : attached ? 'クリックして再アップロード' : 'ドラッグ、またはクリックして選択'}
        </p>
      </div>
      <p className="text-center text-[10px] text-text-muted">{layer.subtitle}</p>
    </div>
  )
}

export function ModelUpload({ projectId }: { projectId: string }) {
  const { data: model } = useQuery({
    queryKey: ['projects', projectId, 'model'],
    queryFn: () => getModelFile(projectId),
    retry: false, // 404 is expected when no model has been uploaded yet
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LAYERS.map((layer) => (
          <LayerDropzone key={layer.fileType} projectId={projectId} layer={layer} model={model} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SKELETON_FORMATS.map((f) => (
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