import { formatAmount } from '@/lib/format'
import { CATEGORY_ICONS } from '@/lib/categories'
import type { DashboardData } from '@/types/database'

interface Props {
  data: DashboardData['top_3']
  currency: 'ARS' | 'USD'
}

export function Top3({ data, currency }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-card bg-bg-secondary p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">Top Categorías</p>
        <p className="mt-2 text-sm text-text-tertiary">Sin gastos registrados este mes.</p>
      </div>
    )
  }

  const maxTotal = Math.max(...data.map((d) => d.total))

  return (
    <div className="rounded-card bg-bg-secondary p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Top Categorías</p>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.category}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">
                  {CATEGORY_ICONS[item.category] ?? '📦'}
                </span>
                <span className="text-sm text-text-primary">{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">
                  {formatAmount(item.total, currency)}
                </span>
                <span className="text-xs text-text-tertiary">{item.count}x</span>
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
              <div
                className="h-full rounded-full bg-primary opacity-60"
                style={{ width: `${(item.total / maxTotal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
