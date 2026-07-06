// src/components/auth/LoginForm.tsx
'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})
type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login } = useAuth()
  const {
    register, handleSubmit, formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = (values: LoginValues) => login.mutate(values)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15">
          <Building2 className="h-6 w-6 text-accent" />
        </div>
        <CardTitle>建設進捗プラットフォーム</CardTitle>
        <CardDescription>アカウントにログイン</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-xs text-[#f85149]">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && <p className="text-xs text-[#f85149]">{errors.password.message}</p>}
          </div>
          {login.isError && (
            <p className="text-xs text-[#f85149]">
              メールアドレスまたはパスワードが正しくありません
            </p>
          )}
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            ログイン
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
