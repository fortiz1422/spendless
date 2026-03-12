'use client'

import { useState } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'

interface Props {
  onBack: () => void
  onNext: () => void
  initialCurrency: 'ARS' | 'USD'
  month: string // YYYY-MM
}

export function StepConfiguracion({ onBack, onNext, initialCurrency, month }: Props) {
  const [currency, setCurrency] = useState<'ARS' | 'USD'>(initialCurrency)
  const [ingreso, setIngreso] = useState('')
  const [saldoInicial, setSaldoInicial] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const ingresoNum = parseFloat(ingreso) || 0
  const saldoInicialNum = parseFloat(saldoInicial) || 0
  const canContinue = ingresoNum > 0

  const handleContinue = async () => {
    if (!canContinue || isSaving) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/monthly-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          amount_ars: currency === 'ARS' ? ingresoNum : 0,
          amount_usd: currency === 'USD' ? ingresoNum : 0,
          saldo_inicial_ars: currency === 'ARS' ? saldoInicialNum : 0,
          saldo_inicial_usd: currency === 'USD' ? saldoInicialNum : 0,
        }),
      })
      if (!res.ok) throw new Error()
      onNext()
    } catch {
      alert('Error al guardar. Intentá de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary px-5 pb-10 pt-safe">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <button onClick={onBack} className="p-1 -ml-1">
          <ArrowLeft size={20} weight="bold" className="text-text-tertiary" />
        </button>
        <span className="text-xs text-text-tertiary">Paso 1 de 2</span>
        <div className="w-6" />
      </div>

      <div className="mt-6 flex-1">
        <h2 className="text-2xl font-semibold text-text-primary">
          ¿Cuánto tenés disponible este mes?
        </h2>
        <p className="mt-2 text-sm text-text-tertiary">
          Podés ajustarlo después en cualquier momento.
        </p>

        {/* Toggle ARS/USD */}
        <div className="mt-6 flex w-fit rounded-full bg-bg-secondary p-1">
          {(['ARS', 'USD'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                currency === c
                  ? 'bg-primary text-bg-primary'
                  : 'text-text-secondary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Ingreso */}
        <div className="mt-6">
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
            Ingreso del mes
          </label>
          <div className="flex items-center rounded-full border border-border-ocean/30 bg-bg-secondary px-4 py-3 focus-within:border-primary/40 transition-colors">
            <span className="mr-2 text-sm text-text-tertiary">$</span>
            <input
              type="number"
              inputMode="numeric"
              value={ingreso}
              onChange={(e) => setIngreso(e.target.value)}
              placeholder="0"
              autoFocus
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-dim outline-none"
            />
          </div>
        </div>

        {/* Saldo inicial */}
        <div className="mt-5">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
            Saldo inicial (opcional)
          </label>
          <p className="mb-2 text-xs text-text-tertiary">
            Si ya tenés algo ahorrado este mes, sumalo acá.
          </p>
          <div className="flex items-center rounded-full border border-border-ocean/30 bg-bg-secondary px-4 py-3 focus-within:border-primary/40 transition-colors">
            <span className="mr-2 text-sm text-text-tertiary">$</span>
            <input
              type="number"
              inputMode="numeric"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-dim outline-none"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!canContinue || isSaving}
        className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-bg-primary transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSaving ? 'Guardando...' : 'Continuar'}
      </button>
    </div>
  )
}
