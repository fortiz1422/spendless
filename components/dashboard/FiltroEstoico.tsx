import type { DashboardData } from '@/types/database'

interface Props {
  data: DashboardData['filtro_estoico']
}

export function FiltroEstoico({ data }: Props) {
  if (!data || data.total_count === 0) return null

  const totalAmount = data.necesidad_amount + data.deseo_amount
  const necesidadPct =
    totalAmount > 0
      ? Math.round((data.necesidad_amount / totalAmount) * 100)
      : Math.round((data.necesidad_count / data.total_count) * 100)
  const deseoPct = 100 - necesidadPct

  return (
    <div className="px-2">
      <p className="type-label text-text-label mb-3">Tipo de gasto</p>
      {/* Labels */}
      <div className="flex justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-label">Necesidad · {necesidadPct}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-label">Deseo · {deseoPct}%</span>
      </div>

      {/* Battery bar */}
      <div className="h-1 rounded-full overflow-hidden bg-border-subtle flex">
        <div className="bg-success rounded-l-full bar-grow" style={{ width: `${necesidadPct}%` }} />
        <div className="w-px bg-bg-primary shrink-0" />
        <div className="flex-1 bg-want rounded-r-full" />
      </div>

      {/* Sublabels */}
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-text-dim">
          {data.necesidad_count} {data.necesidad_count === 1 ? 'gasto' : 'gastos'}
        </span>
        <span className="text-[10px] text-text-dim">
          {data.deseo_count} {data.deseo_count === 1 ? 'gasto' : 'gastos'}
        </span>
      </div>
    </div>
  )
}
