// src/hooks/useReports.ts
'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getReports, approveReport, rollbackReport, type ReportFilters,
} from '@/lib/api'
import type { Report } from '@/types/api'

export function useReports(filters: ReportFilters) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => getReports(filters),
    // Keep data alive when switching tabs — prevents empty list on tab re-focus
    staleTime: 30_000,
    // Keep previous data visible while refetching
    placeholderData: (prev) => prev,
  })
}

export function useApproveReport(projectId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      reportId, action, comment, final_pct,
    }: {
      reportId: string
      action: 'approved' | 'rejected'
      comment?: string
      final_pct?: number
    }) => approveReport(reportId, { action, comment, final_pct }),

    onMutate: async ({ reportId, action }) => {
      await queryClient.cancelQueries({ queryKey: ['reports'] })
      const snapshots = queryClient.getQueriesData<Report[]>({ queryKey: ['reports'] })
      snapshots.forEach(([key, reports]) => {
        if (!reports) return
        queryClient.setQueryData<Report[]>(
          key,
          reports.map((r) => (r.id === reportId ? { ...r, status: action } : r)),
        )
      })
      return { snapshots }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error('承認処理に失敗しました。もう一度お試しください。')
    },
    onSuccess: (_data, { action }) => {
      toast.success(action === 'approved' ? 'レポートを承認しました' : 'レポートを差し戻しました')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'progress'] })
      }
    },
  })
}

export function useRollbackReport(projectId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reportId, reason }: { reportId: string; reason: string }) =>
      rollbackReport(reportId, reason),
    onSuccess: (result) => {
      toast.warning(
        `承認を取り消しました: ${Math.round(result.previous_pct)}% → ${Math.round(result.reverted_to_pct)}%`,
      )
    },
    onError: () => toast.error('取り消しに失敗しました'),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'progress'] })
      }
    },
  })
}