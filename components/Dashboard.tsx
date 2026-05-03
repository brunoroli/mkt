'use client'

import { useState, useMemo } from 'react'
import {
  CreditCard, TrendingUp, Zap, CheckCircle2,
  Eye, MousePointer2, Target, Tag, LayoutGrid,
} from 'lucide-react'
import { BM, DailyMetric } from '@/lib/types'
import MetricCard from './MetricCard'
import { SpendChart, ROASChart } from './SpendChart'
import CampaignsTable from './CampaignsTable'
import InsightsPanel from './InsightsPanel'

interface DashboardProps {
  bm: BM
  selectedAccountId: string
}

const DATE_RANGES = [
  { label: '7 dias', days: 7 },
  { label: '14 dias', days: 14 },
  { label: '30 dias', days: 30 },
]

function fmt(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtShort(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString('pt-BR')
}

function sumMetrics(metrics: DailyMetric[]) {
  const spend = metrics.reduce((a, d) => a + d.spend, 0)
  const revenue = metrics.reduce((a, d) => a + d.revenue, 0)
  const impressions = metrics.reduce((a, d) => a + d.impressions, 0)
  const clicks = metrics.reduce((a, d) => a + d.clicks, 0)
  const conversions = metrics.reduce((a, d) => a + d.conversions, 0)
  const roas = spend > 0 ? revenue / spend : 0
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
  const cpc = clicks > 0 ? spend / clicks : 0
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0
  return { spend, revenue, impressions, clicks, conversions, roas, ctr, cpc, cpm }
}

function mergeDailyMetrics(allMetrics: DailyMetric[][]): DailyMetric[] {
  const map = new Map<string, DailyMetric>()
  for (const metrics of allMetrics) {
    for (const m of metrics) {
      const ex = map.get(m.date)
      if (ex) {
        ex.spend += m.spend
        ex.revenue += m.revenue
        ex.impressions += m.impressions
        ex.clicks += m.clicks
        ex.conversions += m.conversions
      } else {
        map.set(m.date, { ...m })
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({ ...m, roas: m.spend > 0 ? Math.round((m.revenue / m.spend) * 100) / 100 : 0 }))
}

export default function Dashboard({ bm, selectedAccountId }: DashboardProps) {
  const [selectedDays, setSelectedDays] = useState(30)

  const activeAccount = selectedAccountId !== 'all'
    ? bm.adAccounts.find((a) => a.id === selectedAccountId) ?? null
    : null

  const mergedMetrics = useMemo(() => {
    if (!activeAccount) {
      return mergeDailyMetrics(bm.adAccounts.map((acc) => acc.dailyMetrics))
    }
    return activeAccount.dailyMetrics
  }, [bm, activeAccount])

  const filteredMetrics = useMemo(
    () => mergedMetrics.slice(-selectedDays),
    [mergedMetrics, selectedDays]
  )

  const totals = useMemo(() => sumMetrics(filteredMetrics), [filteredMetrics])

  const campaigns = useMemo(() => {
    if (!activeAccount) return bm.adAccounts.flatMap((acc) => acc.campaigns)
    return activeAccount.campaigns
  }, [bm, activeAccount])

  const headerTitle = activeAccount ? activeAccount.name : bm.name
  const headerSub = activeAccount
    ? bm.name
    : `${bm.adAccounts.length} contas de anúncio`

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0"
            style={{ backgroundColor: bm.color }}
          >
            {bm.letter}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{headerTitle}</h1>
            <p className="text-sm text-slate-500">{headerSub}</p>
          </div>
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          {DATE_RANGES.map((range) => (
            <button
              key={range.days}
              onClick={() => setSelectedDays(range.days)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                selectedDays === range.days ? 'text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
              style={selectedDays === range.days ? { backgroundColor: bm.color } : {}}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
        <MetricCard label="Gasto Total"   value={`R$ ${fmt(totals.spend)}`}             icon={CreditCard}    color="#ef4444" bg="#fef2f2" />
        <MetricCard label="Receita Total" value={`R$ ${fmt(totals.revenue)}`}           icon={TrendingUp}    color="#10b981" bg="#f0fdf4" />
        <MetricCard
          label="ROAS"
          value={`${totals.roas.toFixed(2)}x`}
          subtitle={totals.roas >= 3 ? '↑ Acima da meta' : '↓ Abaixo da meta'}
          icon={Zap}
          color="#3b82f6"
          bg="#eff6ff"
        />
        <MetricCard label="Conversões" value={fmtShort(totals.conversions)} icon={CheckCircle2}   color="#10b981" bg="#f0fdf4" />
        <MetricCard label="Impressões"  value={fmtShort(totals.impressions)} icon={Eye}            color="#8b5cf6" bg="#faf5ff" />
        <MetricCard label="Cliques"     value={fmtShort(totals.clicks)}      icon={MousePointer2}  color="#f59e0b" bg="#fffbeb" />
        <MetricCard label="CTR"         value={`${totals.ctr.toFixed(2)}%`}  icon={Target}         color="#06b6d4" bg="#ecfeff" />
        <MetricCard label="CPC Médio"   value={`R$ ${totals.cpc.toFixed(2)}`} icon={Tag}           color="#ec4899" bg="#fdf2f8" />
        <MetricCard label="CPM"         value={`R$ ${totals.cpm.toFixed(2)}`} icon={LayoutGrid}    color="#64748b" bg="#f8fafc" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <SpendChart metrics={filteredMetrics} color={bm.color} />
        <ROASChart metrics={filteredMetrics} color={bm.color} />
      </div>

      {/* Campaigns Table */}
      <CampaignsTable campaigns={campaigns} />

      {/* Insights */}
      <InsightsPanel campaigns={campaigns} />
    </div>
  )
}
