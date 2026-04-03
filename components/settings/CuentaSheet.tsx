'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bank, CreditCard, CaretRight, X, ArrowsClockwise } from '@phosphor-icons/react'
import { Modal } from '@/components/ui/Modal'
import { CuentasSubSheet } from '@/components/settings/CuentasSubSheet'
import { TarjetasSubSheet } from '@/components/settings/TarjetasSubSheet'
import { SubscriptionsSubSheet } from '@/components/settings/SubscriptionsSubSheet'
import { createClient } from '@/lib/supabase/client'
import type { RolloverMode } from '@/types/database'

interface Props {
  open: boolean
  onClose: () => void
  userEmail: string
}

export function CuentaSheet({ open, onClose, userEmail }: Props) {
  const router = useRouter()
  const [cuentasOpen, setCuentasOpen] = useState(false)
  const [tarjetasOpen, setTarjetasOpen] = useState(false)
  const [subscriptionsOpen, setSubscriptionsOpen] = useState(false)
  const [accountCount, setAccountCount] = useState(0)
  const [cardCount, setCardCount] = useState(0)
  const [subscriptionCount, setSubscriptionCount] = useState(0)
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS')
  const [rolloverMode, setRolloverMode] = useState<RolloverMode>('off')
  const [isSavingCurrency, setIsSavingCurrency] = useState(false)
  const [isSavingRollover, setIsSavingRollover] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!open) return
    Promise.all([
      fetch('/api/accounts').then((r) => r.json()),
      fetch('/api/cards').then((r) => r.json()),
      fetch('/api/subscriptions').then((r) => r.json()),
      fetch('/api/user-config').then((r) => r.json()),
    ])
      .then(([accounts, cards, subscriptions, config]) => {
        setAccountCount(Array.isArray(accounts) ? accounts.filter((a: { archived: boolean }) => !a.archived).length : 0)
        setCardCount(Array.isArray(cards) ? cards.length : 0)
        setSubscriptionCount(Array.isArray(subscriptions) ? subscriptions.length : 0)
        if (config?.default_currency) setCurrency(config.default_currency)
        if (config?.rollover_mode) setRolloverMode(config.rollover_mode)
      })
      .catch(() => {})
  }, [open])

  const handleCurrencyChange = async (next: 'ARS' | 'USD') => {
    if (next === currency) return
    const prev = currency
    setCurrency(next)
    setIsSavingCurrency(true)
    try {
      const res = await fetch('/api/user-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_currency: next }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setCurrency(prev)
    } finally {
      setIsSavingCurrency(false)
    }
  }

  const handleRolloverToggle = async () => {
    const next: RolloverMode = rolloverMode === 'auto' ? 'off' : 'auto'
    setRolloverMode(next)
    setIsSavingRollover(true)
    try {
      await fetch('/api/user-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollover_mode: next }),
      })
    } catch {
      setRolloverMode(rolloverMode)
    } finally {
      setIsSavingRollover(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
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

  const initial = userEmail.charAt(0).toUpperCase()
  const isRolloverOn = rolloverMode === 'auto'

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="space-y-6">
          {/* Close button */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">Mi cuenta</h2>
            <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary">
              <X size={20} />
            </button>
          </div>

          {/* Perfil */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary">
              <span className="text-lg font-bold text-white">{initial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{userEmail}</p>
              <p className="text-[11px] text-text-tertiary">Usuario</p>
            </div>
          </div>

          {/* Configuración */}
          <div
            className="rounded-card overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.38)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.70)',
            }}
          >
            <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-label">
              Configuración
            </p>

            <button
              onClick={() => setCuentasOpen(true)}
              className="flex w-full items-center gap-3 px-4 py-3 border-b border-border-subtle text-left transition-colors hover:bg-primary/5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/8">
                <Bank weight="duotone" size={15} className="text-text-label" />
              </div>
              <span className="flex-1 text-sm text-text-primary">
                Cuentas{accountCount > 0 ? ` (${accountCount})` : ''}
              </span>
              <CaretRight size={14} className="text-text-dim" />
            </button>

            <button
              onClick={() => setTarjetasOpen(true)}
              className="flex w-full items-center gap-3 px-4 py-3 border-b border-border-subtle text-left transition-colors hover:bg-primary/5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/8">
                <CreditCard weight="duotone" size={15} className="text-text-label" />
              </div>
              <span className="flex-1 text-sm text-text-primary">
                Tarjetas{cardCount > 0 ? ` (${cardCount})` : ''}
              </span>
              <CaretRight size={14} className="text-text-dim" />
            </button>

            <button
              onClick={() => setSubscriptionsOpen(true)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-primary/5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/8">
                <ArrowsClockwise weight="duotone" size={15} className="text-text-label" />
              </div>
              <span className="flex-1 text-sm text-text-primary">
                Suscripciones{subscriptionCount > 0 ? ` (${subscriptionCount})` : ''}
              </span>
              <CaretRight size={14} className="text-text-dim" />
            </button>
          </div>

          {/* Preferencias */}
          <div
            className="rounded-card overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.38)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.70)',
            }}
          >
            <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-label">
              Preferencias
            </p>

            {/* Moneda predeterminada */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <span className="text-sm text-text-primary">Moneda predeterminada</span>
              <div
                className="inline-flex items-center rounded-full border border-border-ocean p-0.5"
                style={{ background: 'rgba(255,255,255,0.50)' }}
              >
                {(['ARS', 'USD'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCurrencyChange(c)}
                    disabled={isSavingCurrency}
                    className={`px-2.5 py-1 rounded-button text-[11px] font-semibold transition-colors duration-150 disabled:opacity-50 ${
                      currency === c ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Rollover */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex-1 pr-4">
                <p className="text-sm text-text-primary">Rollover automático</p>
                <p className="mt-0.5 text-[11px] text-text-tertiary">
                  Tu saldo al cierre se traslada al mes siguiente.
                </p>
              </div>
              <button
                onClick={handleRolloverToggle}
                disabled={isSavingRollover}
                aria-label={isRolloverOn ? 'Desactivar rollover' : 'Activar rollover'}
                className={`relative h-[26px] w-[46px] shrink-0 overflow-hidden rounded-full transition-colors duration-200 disabled:opacity-50 ${
                  isRolloverOn ? 'bg-primary' : 'bg-bg-elevated'
                }`}
              >
                <span
                  className={`absolute top-[3px] h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
                    isRolloverOn ? 'translate-x-[23px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Cuenta */}
          <div className="space-y-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full rounded-button border border-border-ocean py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
            >
              {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
            </button>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full rounded-button bg-danger/10 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
              >
                Eliminar mi cuenta
              </button>
            ) : (
              <div className="space-y-3 rounded-card bg-danger/10 p-3">
                <p className="text-xs font-medium text-danger">
                  ¿Estás seguro? Esta acción es irreversible. Se eliminarán todos tus datos.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 rounded-button py-2 text-xs text-text-secondary transition-colors hover:bg-primary/5 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 rounded-button bg-danger py-2 text-xs font-semibold text-bg-primary disabled:opacity-50"
                  >
                    {isDeleting ? 'Eliminando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <CuentasSubSheet open={cuentasOpen} onClose={() => setCuentasOpen(false)} />
      <TarjetasSubSheet open={tarjetasOpen} onClose={() => setTarjetasOpen(false)} />
      <SubscriptionsSubSheet
        open={subscriptionsOpen}
        onClose={() => setSubscriptionsOpen(false)}
        defaultCurrency={currency}
      />
    </>
  )
}
