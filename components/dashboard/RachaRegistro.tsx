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
  const activeCount = days.filter((d) => d.active).length

  return (
    <div className="px-2">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
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
                    : 'rgba(148,210,255,0.08)',
                border: day.isToday && !day.active ? '1.5px solid rgba(148,210,255,0.2)' : 'none',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 10, color: '#4B6472' }}>
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
