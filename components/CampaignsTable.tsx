import { Campaign } from '@/lib/types'

const statusConfig: Record<string, { label: string; cls: string }> = {
  ACTIVE:   { label: 'Ativo',     cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  PAUSED:   { label: 'Pausado',   cls: 'bg-amber-50 text-amber-700 border border-amber-100' },
  ARCHIVED: { label: 'Arquivado', cls: 'bg-slate-100 text-slate-500 border border-slate-200' },
}

const objectiveLabels: Record<string, string> = {
  CONVERSIONS:   'Conversões',
  TRAFFIC:       'Tráfego',
  LEADS:         'Geração de leads',
  REACH:         'Alcance',
  VIDEO_VIEWS:   'Visualizações de vídeo',
  CATALOG_SALES: 'Vendas do catálogo',
  ENGAGEMENT:    'Engajamento',
}

interface CampaignsTableProps {
  campaigns: Campaign[]
}

export default function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const sorted = [...campaigns].sort((a, b) => b.spend - a.spend)

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Campanhas</h3>
          <p className="text-xs text-slate-400 mt-0.5">Resultados acumulados — últimos 30 dias</p>
        </div>
        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1">
          {campaigns.length} campanhas
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80">
              {['Campanha', 'Status', 'Gasto', 'Receita', 'ROAS', 'Impressões', 'Cliques', 'CTR', 'CPC', 'Conversões'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${i > 1 ? 'text-right' : 'text-left'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sorted.map((c) => {
              const st = statusConfig[c.status] ?? statusConfig.ARCHIVED
              const roasColor = c.roas >= 3 ? 'text-emerald-600' : c.roas >= 1.5 ? 'text-amber-600' : 'text-red-500'

              return (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5 max-w-xs">
                    <p className="font-medium text-slate-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{objectiveLabels[c.objective] ?? c.objective}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-800 whitespace-nowrap">
                    R$ {c.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-emerald-700 whitespace-nowrap">
                    R$ {c.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-bold text-base ${roasColor}`}>{c.roas.toFixed(2)}x</span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-600 whitespace-nowrap">{c.impressions.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3.5 text-right text-slate-600 whitespace-nowrap">{c.clicks.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3.5 text-right text-slate-600">{c.ctr}%</td>
                  <td className="px-4 py-3.5 text-right text-slate-600 whitespace-nowrap">R$ {c.cpc.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-right text-slate-600">{c.conversions.toLocaleString('pt-BR')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
