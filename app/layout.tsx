import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { BM_CONFIG } from '@/lib/bmConfig'

const bms = BM_CONFIG.map((cfg) => ({
  id: cfg.id,
  slug: cfg.slug,
  name: cfg.name,
  color: cfg.color,
  letter: cfg.letter,
  adAccounts: cfg.accounts.map((acc) => ({ id: acc.id, name: acc.name, campaigns: [], dailyMetrics: [] })),
}))

export const metadata: Metadata = {
  title: 'Meta Ads Dashboard',
  description: 'Dashboard de performance Meta Ads',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full">
        <div className="flex h-screen overflow-hidden bg-slate-50">
          <Suspense fallback={<div className="w-64 min-w-64 bg-slate-900" />}>
            <Sidebar bms={bms} />
          </Suspense>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
