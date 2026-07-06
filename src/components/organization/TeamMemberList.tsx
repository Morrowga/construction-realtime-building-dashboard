// src/components/organization/TeamMemberList.tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { useOrgMembers, useUpdateMember } from '@/hooks/useOrganization'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import type { TeamMember, UserRole } from '@/types/api'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理者',
  manager: 'マネージャー',
  engineer: 'エンジニア',
  client: 'クライアント',
}

const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  admin: 'bg-accent/15 text-accent',
  manager: 'bg-blue-500/15 text-blue-400',
  engineer: 'bg-emerald-500/15 text-emerald-400',
  client: 'bg-amber-500/15 text-amber-400',
}

export function TeamMemberList() {
  const { user: currentUser } = useAuth()
  const { data: members, isLoading } = useOrgMembers()
  const updateMember = useUpdateMember()

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  const handleRoleChange = (member: TeamMember, role: UserRole) => {
    updateMember.mutate({ userId: member.id, payload: { role } })
  }

  const handleActiveToggle = (member: TeamMember, is_active: boolean) => {
    updateMember.mutate({ userId: member.id, payload: { is_active } })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>氏名</TableHead>
          <TableHead>メールアドレス</TableHead>
          <TableHead>役割</TableHead>
          <TableHead className="text-right">有効</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members?.map((member) => {
          const isSelf = member.id === currentUser?.id
          return (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.full_name ?? '—'}</TableCell>
              <TableCell className="text-text-muted">{member.email}</TableCell>
              <TableCell>
                {isSelf ? (
                  <span
                    translate="no"
                    className={`notranslate inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE_CLASS[member.role]}`}
                  >
                    {ROLE_LABELS[member.role]}
                  </span>
                ) : (
                  <Select
                    value={member.role}
                    onValueChange={(v) => handleRoleChange(member, v as UserRole)}
                  >
                    <SelectTrigger translate="no" className="notranslate h-8 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent translate="no" className="notranslate">
                      {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                        <SelectItem key={r} value={r} translate="no" className="notranslate">
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Switch
                  checked={member.is_active}
                  disabled={isSelf}
                  onCheckedChange={(checked) => handleActiveToggle(member, checked)}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}