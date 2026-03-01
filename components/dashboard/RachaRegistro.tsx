interface DayMark {
  date: string
  active: boolean
  isToday: boolean
}

interface Props {
  days: DayMark[]
  streak: number
}

export function RachaRegistro({ days, streak }: Props) {
  return (
    <div className="rounded-card bg-bg-secondary px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {days.map((day) => (
            <div
              key={day.date}
              style={{
                width: day.isToday ? 10 : 8,
                height: day.isToday ? 10 : 8,
                borderRadius: '50%',
                backgroundColor: day.active
                  ? day.isToday
                    ? '#38bdf8'
                    : 'rgba(56,189,248,0.55)'
                  : day.isToday
                    ? 'transparent'
                    : '#1e293b',
                border: day.isToday && !day.active ? '1.5px solid #334155' : 'none',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
        <span className="text-[10px] text-text-tertiary">
          {streak >= 3
            ? `${streak} días seguidos · ${days.filter((d) => d.active).length} de 10`
            : days.some((d) => d.active)
              ? `${days.filter((d) => d.active).length} de 10${streak > 0 ? ` · racha ${streak}` : ''}`
              : 'Empezá tu racha hoy'}
        </span>
      </div>
    </div>
  )
}
