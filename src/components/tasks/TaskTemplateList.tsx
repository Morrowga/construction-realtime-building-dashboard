// src/components/tasks/TaskTemplateList.tsx
'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createTaskTemplate, getTaskTemplates } from '@/lib/api'
import { CATEGORY_COLOURS, CATEGORY_LABELS, categoryHex, cn } from '@/lib/utils'
import type { TaskTemplate } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'

const CATEGORIES = Object.keys(CATEGORY_LABELS)

export function TaskTemplateList({
  onSelect, selectedId,
}: {
  onSelect?: (template: TaskTemplate) => void
  selectedId?: string | null
}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [category, setCategory] = useState<string>('all')
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('other')
  const [showCreate, setShowCreate] = useState(false)

  const templatesQuery = useQuery({
    queryKey: ['task-templates', category],
    queryFn: () => getTaskTemplates(category === 'all' ? undefined : category),
  })

  const createMutation = useMutation({
    mutationFn: () => createTaskTemplate({ name: newName, category: newCategory }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] })
      toast.success('テンプレートを作成しました')
      setNewName('')
      setShowCreate(false)
    },
    onError: () => toast.error('テンプレートの作成に失敗しました'),
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-40">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての工種</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {user?.role === 'admin' && (
          <Button variant="ghost" size="sm" onClick={() => setShowCreate((s) => !s)}>
            <Plus className="h-4 w-4" />
            新規
          </Button>
        )}
      </div>

      {showCreate && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background p-2">
          <Input
            placeholder="テンプレート名"
            className="w-44"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="w-36">
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" disabled={!newName || createMutation.isPending} onClick={() => createMutation.mutate()}>
            作成
          </Button>
        </div>
      )}

      {templatesQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      ) : !templatesQuery.data?.length ? (
        <p className="rounded-md border border-dashed border-border py-8 text-center text-sm text-text-muted">
          テンプレートがありません
        </p>
      ) : (
        <ul className="space-y-1">
          {templatesQuery.data.map((template) => (
            <li key={template.id}>
              <button
                type="button"
                onClick={() => onSelect?.(template)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors',
                  selectedId === template.id
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-surface hover:border-muted',
                )}
              >
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: categoryHex(template.category) }}
                />
                <span className="flex-1 truncate">{template.name}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `${CATEGORY_COLOURS[template.category] ?? '#8b949e'}22`,
                    color: CATEGORY_COLOURS[template.category] ?? '#8b949e',
                  }}
                >
                  {CATEGORY_LABELS[template.category] ?? template.category}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
