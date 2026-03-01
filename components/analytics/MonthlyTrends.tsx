import { formatCompact } from '@/lib/format'

type TrendMonth = {
  month: string   // YYYY-MM
  label: string   // "Oct"
  expenses: number
  income: number
  isSelected: boolean
}

interface Props {
  data: TrendMonth[]
  currency: 'ARS' | 'USD'
}

const COLS = 6
const BAR_H = 72
const GRID = `repeat(${COLS}, 1fr)`

export function MonthlyTrends({ data, currency }: Props) {
  const maxExp = Math.max(...data.map((d) => d.expenses), 1)
  const maxInc = Math.max(...data.map((d) => d.income), 1)
  const hasData = data.some((d) => d.expenses > 0 || d.income > 0)

  if (!hasData) {
    return (
      <div className="rounded-card bg-bg-secondary p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
          Tendencias mensuales
        </p>
        <p className="mt-2 text-sm text-text-tertiary">
          Cargá gastos en varios meses para ver la evolución.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-card bg-bg-secondary p-4">
      {/* Header con leyenda */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
          Tendencias mensuales
        </p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[9px] text-text-tertiary">
            <span className="inline-block h-1.5 w-2.5 rounded-sm bg-primary/70" /> Gastos
          </span>
          <span className="flex items-center gap-1 text-[9px] text-text-tertiary">
            <span className="inline-block h-1.5 w-2.5 rounded-sm bg-success/70" /> Ingresos
          </span>
        </div>
      </div>

      {/* Barras — grid de 6 columnas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID,
          alignItems: 'end',
          height: BAR_H,
          gap: 6,
        }}
      >
        {data.map(({ month, expenses, income, isSelected }) => {
          const expPx = expenses > 0 ? Math.max(Math.round((expenses / maxExp) * BAR_H), 4) : 0
          const incPx = income > 0 ? Math.max(Math.round((income / maxInc) * BAR_H), 4) : 0
          return (
            <div
              key={month}
              style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: '100%' }}
            >
              <div
                style={{
                  flex: 1,
                  height: expPx,
                  borderRadius: '2px 2px 0 0',
                  backgroundColor: isSelected ? '#38bdf8' : 'rgba(56,189,248,0.4)',
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: incPx,
                  borderRadius: '2px 2px 0 0',
                  backgroundColor: isSelected ? '#4ade80' : 'rgba(74,222,128,0.4)',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Labels — mismo grid, alineación perfecta */}
      <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 6, marginTop: 6 }}>
        {data.map(({ month, label, isSelected }) => (
          <div key={month} style={{ textAlign: 'center' }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? '#38bdf8' : '#94a3b8',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Montos compactos */}
      <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 6, marginTop: 2 }}>
        {data.map(({ month, expenses, isSelected }) => (
          <div key={month} style={{ textAlign: 'center' }}>
            <span
              style={{
                fontSize: 9,
                fontVariantNumeric: 'tabular-nums',
                color: isSelected ? '#38bdf8' : '#64748b',
              }}
            >
              {formatCompact(expenses, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
