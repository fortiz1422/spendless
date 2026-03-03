import { formatCompact } from '@/lib/format'

type TrendMonth = {
  month: string   // YYYY-MM
  label: string   // «Oct»
  expenses: number
  income: number
  isSelected: boolean
}

interface Props {
  data: TrendMonth[]
  currency: 'ARS' | 'USD'
}

const W = 375
const H = 120
const PAD_Y = 16

// SVG presentation attributes can't use Tailwind — resolved from design tokens
const COLORS = {
  primary:    '#38bdf8',
  success:    '#4ade80',
  bgPrimary:  '#050A14',
  textDim:    '#4B6472',
} as const

export function MonthlyTrends({ data, currency }: Props) {
  const hasData = data.some((d) => d.expenses > 0 || d.income > 0)

  if (!hasData) {
    return (
      <div className="px-2 py-4">
        <p className="type-label text-text-label mb-2">Tendencias</p>
        <p className="text-[13px] text-text-dim">
          Cargá gastos en varios meses para ver la evolución.
        </p>
      </div>
    )
  }

  const maxExp = Math.max(...data.map((d) => d.expenses), 1)
  const maxInc = Math.max(...data.map((d) => d.income), 1)
  const maxAll = Math.max(maxExp, maxInc)

  const n = data.length
  const px = (i: number) => (n <= 1 ? W / 2 : (i / (n - 1)) * W)
  const py = (v: number, max: number) => H - PAD_Y - (v / max) * (H - PAD_Y * 2)

  const wave = (values: number[], max: number, close: boolean): string => {
    const pts = values.map((v, i) => [px(i), py(v, max)] as [number, number])
    let d = `M${pts[0][0]},${pts[0][1]}`
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i]
      const [x1, y1] = pts[i + 1]
      const dx = x1 - x0
      d += ` C${x0 + dx * 0.42},${y0 + (y1 - y0) * 0.06} ${x1 - dx * 0.56},${y1 - (y1 - y0) * 0.2} ${x1},${y1}`
    }
    if (close) {
      d += ` L${pts[pts.length - 1][0]},${H + 8} L${pts[0][0]},${H + 8} Z`
    }
    return d
  }

  const expValues = data.map((d) => d.expenses)
  const incValues = data.map((d) => d.income)

  const legends = [
    { dotClass: 'bg-primary',  label: 'Gastos'   },
    { dotClass: 'bg-success',  label: 'Ingresos' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center px-4 pb-3">
        <div className="flex gap-4">
          {legends.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${l.dotClass}`} />
              <span className="text-[10px] text-text-label">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Selected month summary */}
        {(() => {
          const sel = data.find((d) => d.isSelected)
          const prev = data[data.findIndex((d) => d.isSelected) - 1]
          if (!sel) return null
          return (
            <div className="flex gap-3 text-[11px]">
              {prev && prev.expenses > 0 && (
                <span className="text-text-dim">
                  {prev.label}{' '}
                  <span className="text-text-primary font-semibold">
                    {formatCompact(prev.expenses, currency)}
                  </span>
                </span>
              )}
              <span className="text-primary">
                {sel.label}{' '}
                <span className="text-text-primary font-semibold">
                  {formatCompact(sel.expenses, currency)}
                </span>
              </span>
            </div>
          )
        })()}
      </div>

      {/* Edge-to-edge wave SVG */}
      <svg
        viewBox={`0 0 ${W} ${H + 28}`}
        width="100%"
        style={{ display: 'block' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="tg-inc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={COLORS.success} stopOpacity="0.3" />
            <stop offset="100%" stopColor={COLORS.success} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="tg-exp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={COLORS.primary} stopOpacity="0.25" />
            <stop offset="100%" stopColor={COLORS.primary} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fills */}
        {incValues.some((v) => v > 0) && (
          <path d={wave(incValues, maxAll, true)} fill="url(#tg-inc)" />
        )}
        {expValues.some((v) => v > 0) && (
          <path d={wave(expValues, maxAll, true)} fill="url(#tg-exp)" />
        )}

        {/* Lines */}
        {incValues.some((v) => v > 0) && (
          <path
            d={wave(incValues, maxAll, false)}
            fill="none"
            stroke={COLORS.success}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}
        {expValues.some((v) => v > 0) && (
          <path
            d={wave(expValues, maxAll, false)}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}

        {/* Dots — expenses */}
        {data.map((d, i) =>
          d.expenses > 0 ? (
            <g key={`e-${i}`}>
              <circle cx={px(i)} cy={py(d.expenses, maxAll)} r="5" fill={COLORS.primary} fillOpacity="0.12" />
              <circle
                cx={px(i)}
                cy={py(d.expenses, maxAll)}
                r={d.isSelected ? 3.5 : 2.5}
                fill={COLORS.primary}
                stroke={COLORS.bgPrimary}
                strokeWidth="1.5"
              />
            </g>
          ) : null
        )}

        {/* Dots — income */}
        {data.map((d, i) =>
          d.income > 0 ? (
            <g key={`inc-${i}`}>
              <circle cx={px(i)} cy={py(d.income, maxAll)} r="5" fill={COLORS.success} fillOpacity="0.12" />
              <circle
                cx={px(i)}
                cy={py(d.income, maxAll)}
                r={d.isSelected ? 3.5 : 2.5}
                fill={COLORS.success}
                stroke={COLORS.bgPrimary}
                strokeWidth="1.5"
              />
            </g>
          ) : null
        )}

        {/* Month labels */}
        {data.map((d, i) => (
          <text
            key={`lbl-${i}`}
            x={px(i)}
            y={H + 20}
            textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
            fontSize="9"
            fontFamily="monospace"
            fill={d.isSelected ? COLORS.primary : COLORS.textDim}
            fontWeight={d.isSelected ? '700' : '400'}
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  )
}
