// src/components/landing/ContactDialog.tsx
'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitContact } from '@/lib/api'

export function ContactDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  const reset = () => {
    setEmail('')
    setDescription('')
    setSent(false)
    setError(false)
  }

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) reset()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(false)
    try {
      await submitContact({ email, description })
      setSent(true)
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {sent ? (
          <div className="flex flex-col gap-3 py-2">
            <DialogHeader>
              <DialogTitle>お問い合わせを送信しました</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-muted">担当者よりご連絡いたします。</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => handleOpenChange(false)}>閉じる</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>お問い合わせ</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-email">メールアドレス</Label>
              <Input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-description">お問い合わせ内容</Label>
              <Textarea
                id="contact-description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ご質問・ご要望をご記入ください"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">送信に失敗しました。もう一度お試しください。</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? '送信中...' : '送信'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}