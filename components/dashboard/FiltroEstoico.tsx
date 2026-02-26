import type { DashboardData } from '@/types/database'

interface Props {
  data: DashboardData['filtro_estoico']
}

export function FiltroEstoico({ data }: Props) {
  if (!data || data.total_count === 0) {
    return (
      <div className="rounded-card bg-bg-secondary p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Necesidades vs. Deseos
        </p>
        <p className="mt-2 text-sm text-text-tertiary">Sin gastos clasificados este mes.</p>
      </div>
    )
  }

  const necesidadPct = Math.round((data.necesidad_count / data.total_count) * 100)
  const deseoPct = 100 - necesidadPct

  return (
    <div className="rounded-card bg-bg-secondary p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Necesidades vs. Deseos
        </p>
        <p className="text-xs text-text-tertiary">{data.total_count} gastos</p>
      </div>

      <div className="mb-3 flex justify-between text-sm">
        <span className="text-success">
          Necesidad · {data.necesidad_count} · {necesidadPct}%
        </span>
        <span className="text-want">
          Deseo · {data.deseo_count} · {deseoPct}%
        </span>
      </div>

      <div className="flex h-2 w-full overflow-hidden rounded-full bg-bg-tertiary">
        <div className="h-full bg-success" style={{ width: `${necesidadPct}%` }} />
        <div className="h-full bg-want" style={{ width: `${deseoPct}%` }} />
      </div>
    </div>
  )
}
