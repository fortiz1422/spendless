'use client'

interface Props {
  total: number
  current: number // 0-indexed
}

export function ProgressDots({ total, current }: Props) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? 'h-2 w-4 bg-primary'
              : i < current
                ? 'h-2 w-2 bg-primary/40'
                : 'h-2 w-2 bg-border-subtle'
          }`}
        />
      ))}
    </div>
  )
}
