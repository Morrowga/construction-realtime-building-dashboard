// src/app/dashboard/organization/members/page.tsx
'use client'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { AddTeamMemberDialog } from '@/components/organization/AddTeamMemberDialog'
import { TeamMemberList } from '@/components/organization/TeamMemberList'
import { useOrganization } from '@/hooks/useOrganization'

function TeamManagementContent() {
  const { data: org } = useOrganization()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">チーム管理</h1>
          <p className="text-sm text-text-muted">
            {org?.name ?? '組織'} のメンバーと役割を管理します
          </p>
        </div>
        <AddTeamMemberDialog />
      </div>

      <TeamMemberList />
    </div>
  )
}

export default function OrganizationMembersPage() {
  return (
    <RoleGuard allow={['admin']}>
      <TeamManagementContent />
    </RoleGuard>
  )
}