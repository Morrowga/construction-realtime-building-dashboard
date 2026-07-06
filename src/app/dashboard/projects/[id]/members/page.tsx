// src/app/dashboard/projects/[id]/members/page.tsx
'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, UserPlus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getProjectMembers, inviteMember } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const ROLE_LABELS: Record<string, string> = {
  admin: '管理者', manager: '現場監督', engineer: '施工担当', client: '施主',
}

export default function MembersPage() {
  const params = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('engineer')

  const membersQuery = useQuery({
    queryKey: ['projects', params.id, 'members'],
    queryFn: () => getProjectMembers(params.id),
  })

  const invite = useMutation({
    mutationFn: () => inviteMember(params.id, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', params.id, 'members'] })
      toast.success('メンバーを招待しました')
      setEmail('')
    },
    onError: () => toast.error('招待に失敗しました。メールアドレスが登録済みユーザーか確認してください。'),
  })

  return (
    <RoleGuard allow={['admin', 'manager']}>
      <div className="mx-auto max-w-5xl space-y-5 p-5">
        <h1 className="text-lg font-semibold">メンバー</h1>

        <form
          className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface p-3"
          onSubmit={(e) => { e.preventDefault(); if (email) invite.mutate() }}
        >
          <Input
            type="email"
            placeholder="user@example.com"
            className="w-64"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="w-36">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">現場監督</SelectItem>
                <SelectItem value="engineer">施工担当</SelectItem>
                <SelectItem value="client">施主</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="sm" disabled={!email || invite.isPending}>
            {invite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            招待
          </Button>
        </form>

        {membersQuery.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !membersQuery.data?.length ? (
          <p className="rounded-md border border-dashed border-border py-10 text-center text-sm text-text-muted">
            まだメンバーがいません。上のフォームから招待できます。
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>メール</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>参加日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersQuery.data.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.user.full_name}</TableCell>
                  <TableCell className="text-text-muted">{member.user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ROLE_LABELS[member.role] ?? member.role}</Badge>
                  </TableCell>
                  <TableCell className="text-text-muted">{formatDate(member.joined_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </RoleGuard>
  )
}
