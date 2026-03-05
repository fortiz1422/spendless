'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLineDown } from '@phosphor-icons/react'
import { TitularHero } from './TitularHero'
import { InsightChips } from './InsightChips'
import { CategoriaRow } from './CategoriaRow'
import type { Metrics } from '@/lib/analytics/computeMetrics'
import type { InsightResult } from '@/lib/analytics/insights'

interface Props {
  metrics: Metrics
  insight: InsightResult
}

export function AnalyticsClient({ metrics, insight }: Props) {
  const [expanded, setExpanded] = useState(false)

  const { currency } = metrics
  const visibleCategorias = expanded
    ? metrics.categorias
    : metrics.categorias.slice(0, 5)

  return (
    <div>
      <TitularHero titular={insight.titular} sentiment={insight.sentiment} />

      {!metrics.esPrimerosDias && (
        <>
          <InsightChips chips={insight.chips} />

          {!metrics.hasIngreso && (
            <div className="bg-warning/10 border border-warning/20 rounded-card px-4 py-3 mx-5 mb-3">
              <p className="type-meta text-text-primary">
                Cargá tu ingreso del mes para ver métricas de ahorro.{' '}
                <Link href="/settings" className="underline">
                  Ir a configuración
                </Link>
              </p>
            </div>
          )}

          {metrics.categorias.length > 0 && (
            <section className="mt-2 px-5">
              <p className="type-label text-text-label mb-3">ESTE MES GASTASTE EN</p>

              {visibleCategorias.map((cat, idx) => (
                <div
                  key={cat.category}
                  className={idx >= 5 ? 'slide-up' : undefined}
                  style={
                    idx >= 5
                      ? { animationDelay: `${(idx - 5) * 40}ms` }
                      : undefined
                  }
                >
                  <CategoriaRow cat={cat} currency={currency} />
                </div>
              ))}

              {metrics.categorias.length > 5 && (
                <div className="flex justify-center mt-2 mb-4">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="glass-1 border border-border-ocean rounded-full px-3 py-1.5 type-meta text-text-secondary"
                  >
                    {expanded
                      ? 'Ver menos'
                      : `Ver todas (${metrics.categorias.length})`}
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      )}

      <div className="px-5 pt-2 pb-2">
        <a
          href="/api/export"
          download
          className="flex w-full items-center justify-center gap-2 rounded-button py-3 type-meta text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <ArrowLineDown weight="duotone" size={14} />
          Exportar gastos (CSV)
        </a>
      </div>
    </div>
  )
}
