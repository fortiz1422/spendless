import { CATEGORY_ICONS } from '@/lib/categories'

type CategoryRow = {
  category: string
  pct: number
}

interface Props {
  data: CategoryRow[]
}

export function CategoryDistribution({ data }: Props) {
  if (!data.length) {
    return (
      <div className="rounded-card bg-bg-secondary p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
          Distribución por categoría
        </p>
        <p className="mt-2 text-sm text-text-tertiary">Sin gastos este mes.</p>
      </div>
    )
  }

  return (
    <div className="rounded-card bg-bg-secondary p-4">
      <p className="mb-4 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
        Distribución por categoría
      </p>
      <div className="space-y-3">
        {data.map(({ category, pct }) => (
          <div key={category}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm text-text-primary">
                {CATEGORY_ICONS[category] ?? '•'} {category}
              </span>
              <span className="text-xs tabular-nums text-text-secondary">{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
              <div className="h-full rounded-full bg-primary/50" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
