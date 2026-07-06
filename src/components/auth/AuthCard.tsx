// src/components/auth/AuthCard.tsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Mode = 'login' | 'register'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})
type LoginValues = z.infer<typeof loginSchema>

const registerSchema = z
  .object({
    organization_name: z.string().min(2, '会社名を入力してください'),
    full_name: z.string().optional(),
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上にしてください'),
    confirm_password: z.string().min(1, '確認用パスワードを入力してください'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'パスワードが一致しません',
    path: ['confirm_password'],
  })
type RegisterValues = z.infer<typeof registerSchema>

function LoginFields() {
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <form onSubmit={handleSubmit((v) => login.mutate(v))} className="flex flex-col gap-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-white/80">メールアドレス</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-xs text-[#f85149]">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-white/80">パスワード</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
        {errors.password && <p className="text-xs text-[#f85149]">{errors.password.message}</p>}
      </div>
      {login.isError && (
        <p className="text-xs text-[#f85149]">メールアドレスまたはパスワードが正しくありません</p>
      )}
      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        ログイン
      </Button>
    </form>
  )
}

function RegisterFields() {
  const { registerOrganization } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (values: RegisterValues) => {
    registerOrganization.mutate({
      organization_name: values.organization_name,
      full_name: values.full_name,
      email: values.email,
      password: values.password,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="organization_name" className="text-white/80">会社名</Label>
        <Input id="organization_name" autoComplete="organization" {...register('organization_name')} />
        {errors.organization_name && (
          <p className="text-xs text-[#f85149]">{errors.organization_name.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="full_name" className="text-white/80">氏名</Label>
        <Input id="full_name" autoComplete="name" {...register('full_name')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg_email" className="text-white/80">メールアドレス</Label>
        <Input id="reg_email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-xs text-[#f85149]">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg_password" className="text-white/80">パスワード</Label>
        <Input id="reg_password" type="password" autoComplete="new-password" {...register('password')} />
        {errors.password && <p className="text-xs text-[#f85149]">{errors.password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm_password" className="text-white/80">パスワード（確認）</Label>
        <Input id="confirm_password" type="password" autoComplete="new-password" {...register('confirm_password')} />
        {errors.confirm_password && (
          <p className="text-xs text-[#f85149]">{errors.confirm_password.message}</p>
        )}
      </div>
      {registerOrganization.isError && (
        <p className="text-xs text-[#f85149]">
          作成に失敗しました。メールアドレスが既に使われていないか確認してください。
        </p>
      )}
      <Button type="submit" className="w-full" disabled={registerOrganization.isPending}>
        {registerOrganization.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        アカウントを作成
      </Button>
    </form>
  )
}

export function AuthCard({ initialMode = 'login' }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode)

  return (
    <div
      className="rounded-lg border border-white/15 bg-black/40 p-8 backdrop-blur-md transition-[width] duration-300"
      style={{ width: mode === 'register' ? '460px' : '400px' }}
    >
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white">建設進捗プラットフォーム</h2>
      </div>

      <div key={mode} style={{ animation: 'authSlideIn 350ms ease-out' }}>
        {mode === 'login' ? <LoginFields /> : <RegisterFields />}
      </div>

      <p className="mt-5 text-center text-xs text-white/60">
        {mode === 'login' ? (
          <>
            会社アカウントをお持ちでないですか？{' '}
            <button
              type="button"
              onClick={() => setMode('register')}
              className="font-medium text-white underline-offset-2 hover:underline"
            >
              アカウントを作成
            </button>
          </>
        ) : (
          <>
            すでにアカウントをお持ちですか？{' '}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="font-medium text-white underline-offset-2 hover:underline"
            >
              ログイン
            </button>
          </>
        )}
      </p>

      <style jsx global>{`
        @keyframes authSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}