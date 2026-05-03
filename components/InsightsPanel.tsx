import { TrendingUp, Pause, Flame, AlertTriangle } from 'lucide-react'
import { Campaign } from '@/lib/types'

type InsightType = 'scale' | 'maintain' | 'optimize' | 'pause'
type ObjectiveGroup = 'sales' | 'traffic' | 'engagement' | 'leads' | 'awareness' | 'unknown'

interface CampaignInsight {
  campaign: Campaign
  type: InsightType
  reason: string
  metric: string
  metricLabel: string
}

const insightConfig: Record<InsightType, {
  label: string
  description: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
  textColor: string
}> = {
  scale: {
    label: 'Escalar',
    description: 'Alta performance — aumente o orçamento',
    icon: Flame,
    color: '#10b981',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border: '#86efac',
    textColor: '#065f46',
  },
  maintain: {
    label: 'Manter',
    description: 'Bom resultado — continue no ritmo atual',
    icon: TrendingUp,
    color: '#3b82f6',
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    border: '#93c5fd',
    textColor: '#1e40af',
  },
  optimize: {
    label: 'Otimizar',
    description: 'Resultados abaixo do esperado — ajuste a estratégia',
    icon: AlertTriangle,
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    border: '#fcd34d',
    textColor: '#92400e',
  },
  pause: {
    label: 'Pausar',
    description: 'Performance fraca — reavalie antes de continuar',
    icon: Pause,
    color: '#ef4444',
    bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    border: '#fca5a5',
    textColor: '#991b1b',
  },
}

function getObjectiveGroup(objective: string): ObjectiveGroup {
  const obj = (objective ?? '').toUpperCase()
  if (obj.includes('SALES') || obj === 'CONVERSIONS' || obj.includes('PURCHASE')) return 'sales'
  if (obj.includes('TRAFFIC') || obj === 'LINK_CLICKS') return 'traffic'
  if (obj.includes('ENGAGEMENT') || obj === 'POST_ENGAGEMENT') return 'engagement'
  if (obj.includes('LEAD')) return 'leads'
  if (obj.includes('AWARENESS') || obj === 'REACH' || obj.includes('VIDEO')) return 'awareness'
  return 'unknown'
}

function analyze(c: Campaign, avgRoas: number): { type: InsightType; reason: string; metric: string; metricLabel: string } {
  const group = getObjectiveGroup(c.objective)

  if (group === 'sales') {
    const m = `${c.roas.toFixed(2)}x`
    if (c.roas >= Math.max(3, avgRoas * 1.3))
      return { type: 'scale', metric: m, metricLabel: 'ROAS', reason: `ROAS ${c.roas.toFixed(2)}x acima da média (${avgRoas.toFixed(2)}x). ${c.conversions} conversões — escale o orçamento.` }
    if (c.roas >= 1.5)
      return { type: 'maintain', metric: m, metricLabel: 'ROAS', reason: `ROAS ${c.roas.toFixed(2)}x — campanha rentável. Mantenha o investimento.` }
    if (c.roas >= 0.8)
      return { type: 'optimize', metric: m, metricLabel: 'ROAS', reason: `ROAS ${c.roas.toFixed(2)}x — abaixo do break-even. Revise criativo, público e oferta.` }
    return { type: 'pause', metric: m, metricLabel: 'ROAS', reason: `ROAS ${c.roas.toFixed(2)}x — gerando prejuízo. Pause e reestruture antes de reinvestir.` }
  }

  if (group === 'traffic') {
    const m = `${c.ctr.toFixed(2)}%`
    if (c.ctr >= 2.0 && c.cpc <= 1.5)
      return { type: 'scale', metric: m, metricLabel: 'CTR', reason: `CTR ${c.ctr.toFixed(2)}% com CPC R$ ${c.cpc.toFixed(2)} — tráfego qualificado e eficiente.` }
    if (c.ctr >= 0.8)
      return { type: 'maintain', metric: m, metricLabel: 'CTR', reason: `CTR ${c.ctr.toFixed(2)}% — tráfego adequado. CPC médio R$ ${c.cpc.toFixed(2)}.` }
    if (c.ctr >= 0.3)
      return { type: 'optimize', metric: m, metricLabel: 'CTR', reason: `CTR ${c.ctr.toFixed(2)}% — abaixo do esperado. Teste novos criativos e refine o público.` }
    return { type: 'pause', metric: m, metricLabel: 'CTR', reason: `CTR ${c.ctr.toFixed(2)}% muito baixo. Reavalie criativo e segmentação.` }
  }

  if (group === 'engagement') {
    const m = `${c.ctr.toFixed(2)}%`
    if (c.ctr >= 3.0)
      return { type: 'scale', metric: m, metricLabel: 'CTR', reason: `CTR ${c.ctr.toFixed(2)}% — excelente engajamento. Considere ampliar o alcance.` }
    if (c.ctr >= 1.0)
      return { type: 'maintain', metric: m, metricLabel: 'CTR', reason: `CTR ${c.ctr.toFixed(2)}% — engajamento saudável para o objetivo da campanha.` }
    if (c.ctr >= 0.3)
      return { type: 'optimize', metric: m, metricLabel: 'CTR', reason: `CTR ${c.ctr.toFixed(2)}% — engajamento fraco. Teste criativos mais atrativos.` }
    return { type: 'pause', metric: m, metricLabel: 'CTR', reason: `CTR ${c.ctr.toFixed(2)}% — praticamente sem engajamento. Pause e revise a estratégia.` }
  }

  if (group === 'leads') {
    if (c.conversions > 0) {
      const cpl = c.spend / c.conversions
      const m = `R$ ${cpl.toFixed(2)}`
      if (cpl <= 20) return { type: 'scale', metric: m, metricLabel: 'CPL', reason: `${c.conversions} leads com CPL R$ ${cpl.toFixed(2)} — excelente custo por lead.` }
      if (cpl <= 50) return { type: 'maintain', metric: m, metricLabel: 'CPL', reason: `${c.conversions} leads com CPL R$ ${cpl.toFixed(2)} — custo aceitável.` }
      return { type: 'optimize', metric: m, metricLabel: 'CPL', reason: `CPL R$ ${cpl.toFixed(2)} — custo por lead elevado. Revise público e formulário.` }
    }
    return { type: 'optimize', metric: '0', metricLabel: 'Leads', reason: 'Nenhum lead gerado. Revise formulário, público e copy do anúncio.' }
  }

  if (group === 'awareness') {
    const m = `R$ ${c.cpm.toFixed(2)}`
    if (c.cpm <= 10) return { type: 'scale', metric: m, metricLabel: 'CPM', reason: `CPM R$ ${c.cpm.toFixed(2)} — alcance muito eficiente. Amplie o orçamento.` }
    if (c.cpm <= 25) return { type: 'maintain', metric: m, metricLabel: 'CPM', reason: `CPM R$ ${c.cpm.toFixed(2)} — custo de alcance dentro do esperado.` }
    if (c.cpm <= 50) return { type: 'optimize', metric: m, metricLabel: 'CPM', reason: `CPM R$ ${c.cpm.toFixed(2)} — alcance caro. Revise público e horários.` }
    return { type: 'pause', metric: m, metricLabel: 'CPM', reason: `CPM R$ ${c.cpm.toFixed(2)} — custo de alcance muito alto para awareness.` }
  }

  // Objetivo desconhecido — usa o melhor sinal disponível
  if (c.roas > 0) {
    const m = `${c.roas.toFixed(2)}x`
    if (c.roas >= 2) return { type: 'maintain', metric: m, metricLabel: 'ROAS', reason: `ROAS ${c.roas.toFixed(2)}x — retorno positivo.` }
    if (c.roas >= 0.8) return { type: 'optimize', metric: m, metricLabel: 'ROAS', reason: `ROAS ${c.roas.toFixed(2)}x — abaixo do ideal. Revise a estratégia.` }
    return { type: 'pause', metric: m, metricLabel: 'ROAS', reason: `ROAS ${c.roas.toFixed(2)}x — sem retorno. Pause e reavalie.` }
  }
  if (c.ctr >= 0.5)
    return { type: 'maintain', metric: `${c.ctr.toFixed(2)}%`, metricLabel: 'CTR', reason: `CTR ${c.ctr.toFixed(2)}% — campanha gerando cliques. Verifique se o pixel e as conversões estão configurados.` }
  return { type: 'optimize', metric: `${c.ctr.toFixed(2)}%`, metricLabel: 'CTR', reason: 'Métricas insuficientes para análise. Verifique pixel, conversões e objetivo da campanha.' }
}

interface InsightsPanelProps {
  campaigns: Campaign[]
}

export default function InsightsPanel({ campaigns }: InsightsPanelProps) {
  if (campaigns.length === 0) return null

  const active = campaigns.filter((c) => c.spend > 0)
  if (active.length === 0) return null

  const salesCampaigns = active.filter((c) => getObjectiveGroup(c.objective) === 'sales')
  const avgRoas = salesCampaigns.length > 0
    ? salesCampaigns.reduce((a, c) => a + c.roas, 0) / salesCampaigns.length
    : active.reduce((a, c) => a + c.roas, 0) / active.length

  const insights: CampaignInsight[] = active.map((campaign) => {
    const { type, reason, metric, metricLabel } = analyze(campaign, avgRoas)
    return { campaign, type, reason, metric, metricLabel }
  })

  const groups = (Object.keys(insightConfig) as InsightType[])
    .map((type) => ({ type, items: insights.filter((i) => i.type === type) }))
    .filter((g) => g.items.length > 0)

  const scaleCount = insights.filter((i) => i.type === 'scale').length
  const pauseCount = insights.filter((i) => i.type === 'pause').length

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Recomendações</h2>
          <p className="text-sm text-slate-500 mt-0.5">Análise por objetivo de campanha — cada tipo usa a métrica correta</p>
        </div>
        <div className="flex items-center gap-3">
          {scaleCount > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-lg">
              <Flame size={13} strokeWidth={2} />
              {scaleCount} para escalar
            </div>
          )}
          {pauseCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg">
              <AlertTriangle size={13} strokeWidth={2} />
              {pauseCount} para pausar
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {groups.map(({ type, items }) => {
          const cfg = insightConfig[type]
          const Icon = cfg.icon

          return (
            <div
              key={type}
              className="rounded-xl overflow-hidden shadow-sm border"
              style={{ borderColor: cfg.border }}
            >
              <div className="px-5 py-4 flex items-center gap-3" style={{ background: cfg.bg }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/60">
                  <Icon size={17} style={{ color: cfg.color }} strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm" style={{ color: cfg.textColor }}>{cfg.label}</p>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-white/60" style={{ color: cfg.color }}>
                      {items.length}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: cfg.textColor + 'bb' }}>{cfg.description}</p>
                </div>
              </div>

              <div className="bg-white divide-y divide-slate-50">
                {items.map(({ campaign, reason, metric, metricLabel }) => (
                  <div key={campaign.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{campaign.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{reason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold" style={{ color: cfg.color }}>{metric}</p>
                        <p className="text-[10px] text-slate-400">{metricLabel}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
