// src/app/layout.tsx
import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: '建設進捗プラットフォーム',
  description: 'AIによる現場写真解析と3Dモデルでの進捗可視化',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="dark">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
