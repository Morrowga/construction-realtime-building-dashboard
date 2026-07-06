// src/components/organization/AddTeamMemberDialog.tsx
'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useCreateMember } from '@/hooks/useOrganization'
import type { UserRole } from '@/types/api'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理者',
  manager: 'マネージャー',
  engineer: 'エンジニア',
  client: 'クライアント',
}

export function AddTeamMemberDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('engineer')
  const [sentTo, setSentTo] = useState<string | null>(null)

  const createMember = useCreateMember()

  const reset = () => {
    setEmail('')
    setFullName('')
    setRole('engineer')
    setSentTo(null)
    createMember.reset()
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMember.mutateAsync(
      { email, full_name: fullName || undefined, role },
      { onSuccess: () => setSentTo(email) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          メンバーを追加
        </Button>
      </DialogTrigger>
      <DialogContent>
        {sentTo ? (
          <div className="flex flex-col gap-3 py-2">
            <DialogHeader>
              <DialogTitle>招待を送信しました</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-muted">
              <span className="font-medium text-text-primary">{sentTo}</span>{' '}
              にログイン情報を記載したメールを送信しました。本人がログイン後にパスワードを変更できます。
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => handleOpenChange(false)}>閉じる</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>チームメンバーを追加</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="member-email">メールアドレス</Label>
              <Input
                id="member-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="member-name">氏名</Label>
              <Input
                id="member-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="任意"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="member-role">役割</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger id="member-role" translate="no" className="notranslate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent translate="no" className="notranslate">
                  {(Object.keys(ROLE_LABELS) as UserRole[])
                    .filter((r) => r !== 'admin')
                    .map((r) => (
                      <SelectItem key={r} value={r} translate="no" className="notranslate">
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {createMember.isError && (
              <p className="text-sm text-destructive">
                追加に失敗しました。メールアドレスが既に使われていないか確認してください。
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={createMember.isPending}>
                {createMember.isPending ? '送信中...' : '招待を送信'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}