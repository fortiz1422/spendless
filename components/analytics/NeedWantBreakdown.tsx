import { CategoryIcon } from '@/components/ui/CategoryIcon'

type Row = {
  category: string
  wantAmount: number
  needAmount: number
  wantCount: number
  needCount: number
  wantPct: number
}

interface Props {
  data: Row[]
}

function getWantLabelClass(wantPct: number): string {
  if (wantPct >= 60) return 'text-want'
  if (wantPct <= 30) return 'text-success'
  return 'text-text-label'
}

export function NeedWantBreakdown({ data }: Props) {
  if (!data.length) return null

  return (
    <div className="px-2">
      <p className="type-label text-text-label mb-5">Necesidades vs. Deseos</p>
      <div className="flex flex-col gap-[18px]">
        {data.map(({ category, wantCount, needCount, wantPct }) => (
          <div key={category}>
            <div className="flex justify-between items-center mb-[7px]">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-primary">
                <CategoryIcon category={category} size={13} />
                {category}
              </span>
              <span className={`text-[12px] font-bold tabular-nums ${getWantLabelClass(wantPct)}`}>
                {wantPct}% deseo
              </span>
            </div>
            <div className="h-[5px] rounded-full overflow-hidden bg-primary/6 flex">
              <div className="bg-success" style={{ width: `${100 - wantPct}%` }} />
              <div className="bg-want" style={{ width: `${wantPct}%` }} />
            </div>
            <p className="mt-[5px] text-[10px] text-text-dim">
              {needCount} necesidad{needCount !== 1 ? 'es' : ''} · {wantCount} deseo{wantCount !== 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
