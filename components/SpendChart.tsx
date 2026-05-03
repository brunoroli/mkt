'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { DailyMetric } from '@/lib/types'

interface ChartProps {
  metrics: DailyMetric[]
  color: string
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parts[2]}/${parts[1]}`
}

export function SpendChart({ metrics, color }: ChartProps) {
  const data = metrics.map((m) => ({
    date: formatDate(m.date),
    Gasto: m.spend,
    Receita: m.revenue,
  }))

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Gasto vs Receita</h3>
      <p className="text-xs text-slate-400 mb-4">Valores em R$</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradRevenue-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`gradSpend-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={Math.floor(data.length / 6)} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 10, color: '#f1f5f9', fontSize: 12, padding: '8px 12px' }}
            formatter={(val) => [`R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
            labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#64748b', paddingTop: 8 }} />
          <Area type="monotone" dataKey="Receita" stroke="#10b981" fill={`url(#gradRevenue-${color})`} strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="Gasto" stroke={color} fill={`url(#gradSpend-${color})`} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ROASChart({ metrics, color }: ChartProps) {
  const data = metrics.map((m) => ({
    date: formatDate(m.date),
    ROAS: m.roas,
  }))

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Evolução do ROAS</h3>
      <p className="text-xs text-slate-400 mb-4">Retorno sobre gasto em anúncios</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={Math.floor(data.length / 6)} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toFixed(1)}x`} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 10, color: '#f1f5f9', fontSize: 12, padding: '8px 12px' }}
            formatter={(val) => [`${Number(val).toFixed(2)}x`, 'ROAS']}
            labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
          />
          <Line type="monotone" dataKey="ROAS" stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
