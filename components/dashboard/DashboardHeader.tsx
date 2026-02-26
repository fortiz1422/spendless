'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings } from 'lucide-react'
import { SettingsModal } from './SettingsModal'
import type { Card } from '@/types/database'

interface Props {
  month: string // YYYY-MM
  email: string
  currency: 'ARS' | 'USD'
  cards: Card[]
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

export function DashboardHeader({ month, email, currency, cards }: Props) {
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const current = getCurrentMonth()
  const min = addMonths(current, -12)

  const label = new Date(month + '-15').toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })
  const labelCap = label.charAt(0).toUpperCase() + label.slice(1)

  const go = (delta: number) => {
    const next = addMonths(month, delta)
    router.push(next === current ? '/' : `/?month=${next}`)
  }

  return (
    <>
      <header className="mb-6 grid grid-cols-3 items-center">
        <button
          onClick={() => go(-1)}
          disabled={month <= min}
          aria-label="Mes anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-text-tertiary transition-colors hover:bg-white/5 disabled:opacity-30"
        >
          ‹
        </button>

        <h1 className="text-center text-base font-medium text-text-secondary">{labelCap}</h1>

        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => go(1)}
            disabled={month >= current}
            aria-label="Mes siguiente"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-text-tertiary transition-colors hover:bg-white/5 disabled:opacity-30"
          >
            ›
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Configuración"
            className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-white/5"
          >
            <Settings size={16} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        email={email}
        currency={currency}
        cards={cards}
        month={month}
      />
    </>
  )
}
