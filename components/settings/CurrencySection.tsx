'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CurrencySection({ currency }: { currency: 'ARS' | 'USD' }) {
  const router = useRouter()
  const [selected, setSelected] = useState(currency)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmChange, setConfirmChange] = useState(false)

  const handleSave = async (newCurrency: 'ARS' | 'USD') => {
    if (newCurrency === currency) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/user-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_currency: newCurrency }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert('Error al cambiar moneda. Intentá de nuevo.')
      setSelected(currency)
    } finally {
      setIsSaving(false)
      setConfirmChange(false)
    }
  }

  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
        Moneda predeterminada
      </p>
      <div className="flex gap-2">
        {(['ARS', 'USD'] as const).map((c) => (
          <button
            key={c}
            onClick={() => {
              setSelected(c)
              if (c !== currency) setConfirmChange(true)
              else setConfirmChange(false)
            }}
            className={`flex-1 rounded-button py-2 text-sm font-medium transition-colors ${
              selected === c ? 'bg-primary text-white' : 'bg-bg-tertiary text-text-secondary'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {confirmChange && (
        <div className="mt-2 space-y-2 rounded-input bg-bg-tertiary p-3">
          <p className="text-xs text-text-secondary">
            Cambiar la moneda afecta cómo se muestra el Saldo Vivo. ¿Continuar?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelected(currency)
                setConfirmChange(false)
              }}
              className="flex-1 rounded-button py-1.5 text-xs text-text-secondary hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSave(selected)}
              disabled={isSaving}
              className="flex-1 rounded-button bg-primary py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              {isSaving ? '...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
