// src/components/reports/RollbackButton.tsx
'use client'
import { useState } from 'react'
import { Loader2, Undo2 } from 'lucide-react'
import { useRollbackReport } from '@/hooks/useReports'
import type { Report } from '@/types/api'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/**
 * Rolls an approved report back to pending. Requires a reason; shows the
 * percentage the zone task will revert to before confirming.
 */
export function RollbackButton({ report, projectId }: { report: Report; projectId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const rollback = useRollbackReport(projectId)

  const currentPct = report.final_progress_pct ?? report.approval?.final_pct ?? null

  const confirm = () =>
    rollback.mutate(
      { reportId: report.id, reason },
      { onSuccess: () => setOpen(false) },
    )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Undo2 className="h-3.5 w-3.5" />
          承認を取り消す
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>承認の取り消し</DialogTitle>
          <DialogDescription>
            この操作でレポートは「承認待ち」に戻り、ゾーンの進捗は承認前の値に差し戻されます。
            {currentPct !== null && (
              <span className="mt-1 block">
                現在の確定値: <span className="font-semibold tabular-nums text-warning">{Math.round(currentPct)}%</span>
                {' '}→ 直前の承認値（ない場合は 0%）に戻ります
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={`rollback-reason-${report.id}`}>取り消し理由（必須）</Label>
          <Textarea
            id={`rollback-reason-${report.id}`}
            placeholder="例: 写真と進捗率が一致しないため再確認"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>キャンセル</Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || rollback.isPending}
            onClick={confirm}
          >
            {rollback.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            取り消しを実行
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
