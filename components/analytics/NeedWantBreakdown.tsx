import { CATEGORY_ICONS } from '@/lib/categories'

type Row = {
  category: string
  want: number
  need: number
  wantPct: number
}

interface Props {
  data: Row[]
}

export function NeedWantBreakdown({ data }: Props) {
  if (!data.length) {
    return (
      <div className="rounded-card bg-bg-secondary p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
          Comportamiento por categoría
        </p>
        <p className="mt-2 text-sm text-text-tertiary">
          Sin gastos clasificados este mes.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-card bg-bg-secondary p-4">
      <p className="mb-4 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
        Comportamiento por categoría
      </p>
      <div className="space-y-3">
        {data.map(({ category, want, need, wantPct }) => (
          <div key={category}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm text-text-primary">
                {CATEGORY_ICONS[category] ?? '•'} {category}
              </span>
              <span
                className={`text-xs tabular-nums ${
                  wantPct >= 60
                    ? 'text-want'
                    : wantPct <= 30
                      ? 'text-success'
                      : 'text-text-secondary'
                }`}
              >
                {wantPct}% deseo
              </span>
            </div>
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
              <div className="h-full bg-success" style={{ width: `${100 - wantPct}%` }} />
              <div className="h-full bg-want" style={{ width: `${wantPct}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-text-disabled">
              {need} necesidad{need !== 1 ? 'es' : ''} · {want} deseo{want !== 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
