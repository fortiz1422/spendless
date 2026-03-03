'use client'

import { useRouter } from 'next/navigation'

interface Props {
  month: string // YYYY-MM
  basePath?: string // default '/'
}

function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function DashboardHeader({ month, basePath = '/' }: Props) {
  const router = useRouter()
  const current = getCurrentMonth()
  const min = addMonths(current, -12)

  const label = new Date(month + '-15').toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })
  const labelCap = label.charAt(0).toUpperCase() + label.slice(1)

  const go = (delta: number) => {
    const next = addMonths(month, delta)
    router.push(next === current ? basePath : `${basePath}?month=${next}`)
  }

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 8, paddingRight: 8, marginBottom: 4 }}>
      <button
        onClick={() => go(-1)}
        disabled={month <= min}
        aria-label="Mes anterior"
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          fontSize: 22,
          color: '#7B98B8',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          opacity: month <= min ? 0.25 : 1,
          transition: 'opacity 150ms',
        }}
      >
        ‹
      </button>

      <button
        onClick={() => go(0)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#f0f9ff',
            letterSpacing: '-0.02em',
          }}
        >
          {labelCap.split(' ')[0]}
        </span>
      </button>

      <button
        onClick={() => go(1)}
        disabled={month >= current}
        aria-label="Mes siguiente"
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          fontSize: 22,
          color: '#7B98B8',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          opacity: month >= current ? 0.25 : 1,
          transition: 'opacity 150ms',
        }}
      >
        ›
      </button>
    </header>
  )
}
