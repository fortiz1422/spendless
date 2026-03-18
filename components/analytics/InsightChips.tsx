'use client'

import type { Chip } from '@/lib/heroEngine/types'

interface Props {
  chips: Chip[]
}

const EMPHASIS_CLASS: Record<NonNullable<Chip['emphasis']>, string> = {
  neutral: 'glass-1 border-border-ocean text-text-secondary',
  warning: 'bg-warning/8 border-warning/30 text-warning',
  positive: 'bg-success/8 border-success/30 text-success',
}

export function InsightChips({ chips }: Props) {
  if (chips.length === 0) return null

  return (
    <div className="w-full flex gap-2 overflow-x-auto px-5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((chip, i) => (
        <span
          key={i}
          className={`border rounded-full px-2.5 py-1 type-micro whitespace-nowrap shrink-0 ${
            EMPHASIS_CLASS[chip.emphasis ?? 'neutral']
          }`}
        >
          {chip.label}
        </span>
      ))}
    </div>
  )
}
