'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'

interface Props {
  month: string // YYYY-MM
  currency: 'ARS' | 'USD'
}

function getMonthLabel(month: string): string {
  const label = new Date(month + '-15').toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function IncomeSetupModal({ month, currency }: Props) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [amountArs, setAmountArs] = useState('')
  const [amountUsd, setAmountUsd] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Avoid SSR / hydration mismatch with createPortal
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const save = async (ars: number, usd: number) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/monthly-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, amount_ars: ars, amount_usd: usd }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert('No se pudo guardar el ingreso. Intentá de nuevo.')
      setIsSaving(false)
    }
  }

  const handleSave = () => save(Number(amountArs) || 0, Number(amountUsd) || 0)
  const handleSkip = () => save(0, 0)

  return (
    <Modal open onClose={handleSkip}>
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-text-disabled sm:hidden" />

      <h2 className="text-lg font-semibold text-text-primary">Configurar Saldo Vivo</h2>
      <p className="mb-5 mt-1 text-xs text-text-tertiary">
        Ingresá tu ingreso de {getMonthLabel(month)} para ver cuánto te queda disponible.
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Ingreso en ARS
          </label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amountArs}
            onChange={(e) => setAmountArs(e.target.value)}
            className="w-full rounded-input border border-transparent bg-bg-tertiary px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Ingreso en USD
          </label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
            className="w-full rounded-input border border-transparent bg-bg-tertiary px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-button bg-gradient-to-r from-primary to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 hover:scale-[1.02] disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar ingreso'}
        </button>
        <button
          onClick={handleSkip}
          disabled={isSaving}
          className="w-full rounded-button py-3 text-sm text-text-secondary transition-colors hover:bg-white/5"
        >
          Omitir por ahora
        </button>
      </div>
    </Modal>
  )
}
