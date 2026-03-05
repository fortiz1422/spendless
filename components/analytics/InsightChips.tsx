'use client'

interface Props {
  chips: string[]
}

export function InsightChips({ chips }: Props) {
  if (chips.length === 0) return null

  return (
    <div
      className="w-full flex gap-2 overflow-x-auto px-5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {chips.map((chip, i) => (
        <span
          key={i}
          className="glass-1 border border-border-ocean rounded-full px-2.5 py-1 type-micro text-text-secondary whitespace-nowrap shrink-0"
        >
          {chip}
        </span>
      ))}
    </div>
  )
}
