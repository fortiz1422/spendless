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
    <header className="mb-6 grid grid-cols-3 items-center">
      <button
        onClick={() => go(-1)}
        disabled={month <= min}
        aria-label="Mes anterior"
        className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-text-secondary transition-colors hover:bg-white/5 disabled:opacity-30"
      >
        ‹
      </button>

      <h1 className="whitespace-nowrap text-center text-sm font-medium text-text-secondary">
        {labelCap}
      </h1>

      <div className="flex items-center justify-end">
        <button
          onClick={() => go(1)}
          disabled={month >= current}
          aria-label="Mes siguiente"
          className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-text-secondary transition-colors hover:bg-white/5 disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </header>
  )
}
