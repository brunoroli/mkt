'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { BarChart2 } from 'lucide-react'
import { BM } from '@/lib/types'

interface SidebarProps {
  bms: BM[]
}

export default function Sidebar({ bms }: SidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentAcc = searchParams.get('acc')
  const currentSlug = pathname.startsWith('/bm/') ? pathname.split('/bm/')[1] : ''

  const [expandedSlug, setExpandedSlug] = useState(currentSlug)

  useEffect(() => {
    if (currentSlug) setExpandedSlug(currentSlug)
  }, [currentSlug])

  return (
    <div className="w-64 min-w-64 bg-slate-900 flex flex-col h-full border-r border-slate-800">
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <BarChart2 size={17} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Meta Dashboard</p>
            <p className="text-slate-400 text-xs mt-0.5">Gestão de portfólios</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
          Portfólios
        </p>
        <nav className="space-y-0.5">
          {bms.map((bm) => {
            const isBMActive = currentSlug === bm.slug
            const isExpanded = expandedSlug === bm.slug

            return (
              <div key={bm.slug}>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/bm/${bm.slug}`}
                    onClick={() => setExpandedSlug(bm.slug)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all flex-1 min-w-0 ${
                      isBMActive && !currentAcc ? 'bg-slate-700/80' : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: bm.color }}
                    >
                      {bm.letter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isBMActive ? 'text-white' : 'text-slate-200'}`}>
                        {bm.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {bm.adAccounts.length} contas
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={() => setExpandedSlug(isExpanded ? '' : bm.slug)}
                    className="p-2 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {isExpanded && (
                  <div className="ml-5 mt-1 mb-1 space-y-0.5 border-l-2 border-slate-700/50 pl-3">
                    <Link
                      href={`/bm/${bm.slug}`}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-xs ${
                        isBMActive && !currentAcc
                          ? 'text-white font-medium'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${isBMActive && !currentAcc ? 'bg-blue-400' : 'bg-slate-600'}`} />
                      <span>Visão geral</span>
                    </Link>

                    {bm.adAccounts.map((acc) => {
                      const isAccActive = isBMActive && currentAcc === acc.id
                      return (
                        <Link
                          key={acc.id}
                          href={`/bm/${bm.slug}?acc=${acc.id}`}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-xs ${
                            isAccActive
                              ? 'text-white font-medium'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: isAccActive ? bm.color : '#475569' }}
                          />
                          <span className="truncate">{acc.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-slate-500 text-xs">Dados em tempo real · Meta API</p>
        </div>
      </div>
    </div>
  )
}
