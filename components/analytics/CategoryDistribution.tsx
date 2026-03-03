import { CategoryIcon } from '@/components/ui/CategoryIcon'

type CategoryRow = {
  category: string
  pct: number
}

interface Props {
  data: CategoryRow[]
}

export function CategoryDistribution({ data }: Props) {
  if (!data.length) return null

  return (
    <div className="px-2">
      <p className="type-label text-text-label mb-5">Distribución</p>
      <div className="flex flex-col gap-[18px]">
        {data.map(({ category, pct }) => (
          <div key={category}>
            <div className="flex justify-between items-center mb-[7px]">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-primary">
                <CategoryIcon category={category} size={13} />
                {category}
              </span>
              <span className="text-[13px] font-bold text-primary tabular-nums tracking-[-0.01em]">
                {pct}%
              </span>
            </div>
            <div className="h-[5px] rounded-full bg-primary/8 overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-full bar-grow"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
