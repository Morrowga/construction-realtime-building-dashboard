// src/components/reports/ApprovalForm.tsx
'use client'
import { useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { useApproveReport } from '@/hooks/useReports'
import type { Report } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'

/**
 * Manager action block on a pending report.
 * final_pct defaults to the AI estimate (fallback: engineer estimate).
 */
export function ApprovalForm({ report, projectId }: { report: Report; projectId: string }) {
  const defaultPct = Math.round(report.ai_progress_pct ?? report.engineer_progress_pct ?? 0)
  const [finalPct, setFinalPct] = useState(defaultPct)
  const [comment, setComment] = useState('')
  const approve = useApproveReport(projectId)

  const submit = (action: 'approved' | 'rejected') =>
    approve.mutate({
      reportId: report.id,
      action,
      comment: comment || undefined,
      final_pct: action === 'approved' ? finalPct : undefined,
    })

  return (
    <div className="space-y-3 rounded-md border border-border bg-background p-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">確定進捗率</Label>
          <span className="text-sm font-semibold tabular-nums text-accent">{finalPct}%</span>
        </div>
        <Slider
          min={0} max={100} step={1}
          value={[finalPct]}
          onValueChange={(v) => setFinalPct(v[0] ?? 0)}
          aria-label="確定進捗率"
        />
        <p className="text-xs text-text-muted">
          初期値はAI推定値です。写真を確認のうえ調整してください。
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`comment-${report.id}`} className="text-xs">コメント（任意）</Label>
        <Textarea
          id={`comment-${report.id}`}
          placeholder="承認・差し戻しの理由やメモ"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="success"
          className="flex-1"
          disabled={approve.isPending}
          onClick={() => submit('approved')}
        >
          {approve.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          承認する（{finalPct}%）
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          disabled={approve.isPending}
          onClick={() => submit('rejected')}
        >
          <X className="h-4 w-4" />
          差し戻す
        </Button>
      </div>
    </div>
  )
}
