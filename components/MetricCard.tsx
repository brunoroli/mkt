import { type LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  subtitle?: string
  icon: LucideIcon
  color: string
  bg: string
}

export default function MetricCard({ label, value, subtitle, icon: Icon, color, bg }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs mt-1 font-medium" style={{ color }}>{subtitle}</p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bg }}
        >
          <Icon size={18} style={{ color }} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}
