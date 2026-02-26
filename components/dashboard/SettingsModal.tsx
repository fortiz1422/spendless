'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import type { Card } from '@/types/database'

// ─── Section: Datos ──────────────────────────────────────────────────────────
function DatosSection() {
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await fetch('/api/export')
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gota-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Error al exportar datos. Intentá de nuevo.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      alert('Error al eliminar la cuenta. Intentá de nuevo.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Export */}
      <div>
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
          Exportar datos
        </p>
        <p className="mb-2 text-xs text-text-tertiary">
          Descargá todos tus gastos en formato CSV.
        </p>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full rounded-button bg-bg-tertiary py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-elevated disabled:opacity-50"
        >
          {isExporting ? 'Exportando...' : 'Descargar CSV'}
        </button>
      </div>

      {/* Delete account */}
      <div>
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
          Eliminar cuenta
        </p>
        {!showDeleteConfirm ? (
          <>
            <p className="mb-2 text-xs text-text-tertiary">
              Elimina tu cuenta y todos tus datos de forma permanente.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full rounded-button bg-danger/10 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
            >
              Eliminar mi cuenta
            </button>
          </>
        ) : (
          <div className="space-y-3 rounded-input bg-danger/10 p-3">
            <p className="text-xs font-medium text-danger">
              ¿Estás seguro? Esta acción es irreversible. Se eliminarán todos tus
              gastos, ingresos y configuración.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 rounded-button py-2 text-xs text-text-secondary hover:bg-white/5 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 rounded-button bg-danger py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
  email: string
  currency: 'ARS' | 'USD'
  cards: Card[]
  month: string // current month YYYY-MM
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(month: string): string {
  const label = new Date(month + '-15').toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// ─── Section: Currency ──────────────────────────────────────────────────────
function CurrencySection({
  currency,
  onSaved,
}: {
  currency: 'ARS' | 'USD'
  onSaved: () => void
}) {
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
      onSaved()
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
              selected === c
                ? 'bg-primary text-white'
                : 'bg-bg-tertiary text-text-secondary'
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

// ─── Section: Cards ──────────────────────────────────────────────────────────
function CardsSection({
  cards: initialCards,
  onSaved,
}: {
  cards: Card[]
  onSaved: () => void
}) {
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [newName, setNewName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const saveCards = async (updated: Card[]) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: updated }),
      })
      if (!res.ok) throw new Error()
      setCards(updated)
      onSaved()
    } catch {
      alert('Error al guardar tarjetas.')
    } finally {
      setIsSaving(false)
    }
  }

  const addCard = () => {
    const name = newName.trim()
    if (!name) return
    const newCard: Card = { id: crypto.randomUUID(), name, archived: false }
    setNewName('')
    saveCards([...cards, newCard])
  }

  const toggleArchive = (id: string) => {
    const updated = cards.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c))
    saveCards(updated)
  }

  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
        Tarjetas
      </p>
      <div className="space-y-1.5">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between rounded-input bg-bg-tertiary px-3 py-2"
          >
            <span
              className={`text-sm ${card.archived ? 'text-text-disabled line-through' : 'text-text-primary'}`}
            >
              {card.name}
            </span>
            <button
              onClick={() => toggleArchive(card.id)}
              disabled={isSaving}
              className="text-[10px] text-text-tertiary hover:text-text-secondary disabled:opacity-50"
            >
              {card.archived ? 'Restaurar' : 'Archivar'}
            </button>
          </div>
        ))}
      </div>

      {/* Add card */}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCard()}
          placeholder="Nueva tarjeta"
          className="flex-1 rounded-input border border-transparent bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
        />
        <button
          onClick={addCard}
          disabled={!newName.trim() || isSaving}
          className="rounded-button bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>
  )
}

// ─── Section: Income ─────────────────────────────────────────────────────────
function IncomeSection({ defaultMonth, onSaved }: { defaultMonth: string; onSaved: () => void }) {
  const currentMonth = getCurrentMonth()
  const [month, setMonth] = useState(defaultMonth)
  const [amountArs, setAmountArs] = useState('')
  const [amountUsd, setAmountUsd] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const minMonth = addMonths(currentMonth, -12)

  // Load income when month changes
  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/monthly-income?month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        setAmountArs(data.amount_ars > 0 ? String(data.amount_ars) : '')
        setAmountUsd(data.amount_usd > 0 ? String(data.amount_usd) : '')
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [month])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/monthly-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          amount_ars: Number(amountArs) || 0,
          amount_usd: Number(amountUsd) || 0,
        }),
      })
      if (!res.ok) throw new Error()
      onSaved()
    } catch {
      alert('Error al guardar ingreso.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
        Ingresos mensuales
      </p>

      {/* Month picker */}
      <div className="mb-3 flex items-center justify-between rounded-input bg-bg-tertiary px-3 py-2">
        <button
          onClick={() => setMonth((m) => addMonths(m, -1))}
          disabled={month <= minMonth}
          className="text-xl text-text-secondary disabled:opacity-30"
        >
          ‹
        </button>
        <span className="text-sm text-text-primary">{getMonthLabel(month)}</span>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          disabled={month >= currentMonth}
          className="text-xl text-text-secondary disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <span className="spinner" />
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Ingreso ARS"
            value={amountArs}
            onChange={(e) => setAmountArs(e.target.value)}
            className="w-full rounded-input border border-transparent bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Ingreso USD"
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
            className="w-full rounded-input border border-transparent bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-button bg-primary py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar ingreso'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Modal ──────────────────────────────────────────────────────────────
export function SettingsModal({ open, onClose, email, currency, cards, month }: Props) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<'cuenta' | 'config' | 'datos'>('config')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSaved = () => {
    router.refresh()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-text-disabled sm:hidden" />
      <h2 className="mb-4 text-lg font-semibold text-text-primary">Configuración</h2>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-input bg-bg-tertiary p-1">
        {(['cuenta', 'config', 'datos'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-input py-1.5 text-xs font-medium capitalize transition-colors ${
              tab === t ? 'bg-bg-elevated text-text-primary' : 'text-text-secondary'
            }`}
          >
            {t === 'cuenta' ? 'Cuenta' : t === 'config' ? 'Config' : 'Datos'}
          </button>
        ))}
      </div>

      {/* Cuenta */}
      {tab === 'cuenta' && (
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              Email
            </p>
            <p className="rounded-input bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary">
              {email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full rounded-button py-2.5 text-sm font-medium text-danger transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
          </button>
        </div>
      )}

      {/* Config */}
      {tab === 'config' && (
        <div className="space-y-5">
          <CurrencySection currency={currency} onSaved={handleSaved} />
          <CardsSection cards={cards} onSaved={handleSaved} />
          <IncomeSection defaultMonth={month} onSaved={handleSaved} />
        </div>
      )}

      {/* Datos */}
      {tab === 'datos' && <DatosSection />}
    </Modal>
  )
}
