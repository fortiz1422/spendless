interface DayMark {
  date: string
  active: boolean
  isToday: boolean
}

interface Props {
  days: DayMark[]
  streak: number
}

function getDotClass(day: DayMark): string {
  const size = day.isToday ? 'size-2.5' : 'size-2'
  const color = day.active
    ? day.isToday
      ? 'bg-primary'
      : 'bg-primary/55'
    : day.isToday
      ? 'bg-transparent border border-primary/20'
      : 'bg-primary/8'
  return `rounded-full shrink-0 ${size} ${color}`
}

export function RachaRegistro({ days, streak }: Props) {
  const activeCount = days.filter((d) => d.active).length

  return (
    <div className="px-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[5px]">
          {days.map((day) => (
            <div key={day.date} className={getDotClass(day)} />
          ))}
        </div>
        <span className="text-[10px] text-text-dim">
          {streak >= 3
            ? `${streak} días seguidos · ${activeCount} de 10`
            : activeCount > 0
              ? `${activeCount} de 10${streak > 0 ? ` · racha ${streak}` : ''}`
              : 'Empezá tu racha hoy'}
        </span>
      </div>
    </div>
  )
}
