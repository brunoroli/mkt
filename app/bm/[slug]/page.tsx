import { notFound } from 'next/navigation'
import { bms as mockBms } from '@/lib/mockData'
import { BM_CONFIG } from '@/lib/bmConfig'
import { fetchBM } from '@/lib/metaApi'
import Dashboard from '@/components/Dashboard'

export default async function BMPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ acc?: string }>
}) {
  const { slug } = await params
  const { acc } = await searchParams

  const config = BM_CONFIG.find((b) => b.slug === slug)
  if (!config) notFound()

  let bm

  if (process.env.META_ACCESS_TOKEN) {
    try {
      bm = await fetchBM(config)
    } catch (err) {
      console.error(`[Meta API] Erro ao buscar dados de "${config.name}":`, err)
      bm = mockBms.find((b) => b.slug === slug)
    }
  } else {
    bm = mockBms.find((b) => b.slug === slug)
  }

  if (!bm) notFound()

  return <Dashboard bm={bm} selectedAccountId={acc ?? 'all'} />
}

export function generateStaticParams() {
  return BM_CONFIG.map((b) => ({ slug: b.slug }))
}
