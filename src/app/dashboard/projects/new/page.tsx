// src/app/dashboard/projects/new/page.tsx
import { RoleGuard } from '@/components/layout/RoleGuard'
import { ProjectForm } from '@/components/projects/ProjectForm'

export default function NewProjectPage() {
  return (
    <RoleGuard allow={['admin']}>
      <div className="mx-auto max-w-3xl space-y-5 p-5">
        <h1 className="text-lg font-semibold">新規プロジェクト</h1>
        <ProjectForm />
      </div>
    </RoleGuard>
  )
}
