'use client'

import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Bank, DeviceMobileSpeaker, Star, Wallet, X } from '@phosphor-icons/react'
import { Modal } from '@/components/ui/Modal'
import { CATEGORIES } from '@/lib/validation/schemas'
import { getCurrentMonth } from '@/lib/dates'
import type { Account, Card, Subscription } from '@/types/database'

interface Props {
  subscription: Subscription | null
  cards: Card[]
  accounts: Account[]
  defaultCurrency: 'ARS' | 'USD'
  onClose: () => void
  onSave: (subscription: Subscription) => void
  onArchive: (id: string) => void
}

function AccountIcon({ type, size = 13 }: { type: Account['type']; size?: number }) {
  if (type === 'cash') return <Wallet weight="duotone" size={size} />
  if (type === 'digital') return <DeviceMobileSpeaker weight="duotone" size={size} />
  return <Bank weight="duotone" size={size} />
}

export function SubscriptionBottomSheet({
  subscription,
  cards,
  accounts,
  defaultCurrency,
  onClose,
  onSave,
  onArchive,
}: Props) {
  const queryClient = useQueryClient()
  const activeCards = useMemo(() => cards.filter((c) => !c.archived), [cards])
  const bankDigital = useMemo(() => accounts.filter((a) => a.type !== 'cash'), [accounts])
  const cashAccount = useMemo(() => accounts.find((a) => a.type === 'cash') ?? null, [accounts])
  const primaryAccount = bankDigital.find((a) => a.is_primary) ?? bankDigital[0] ?? null

  const [description, setDescription] = useState(subscription?.description ?? '')
  const [amount, setAmount] = useState(subscription ? String(subscription.amount) : '')
  const [currency, setCurrency] = useState<'ARS' | 'USD'>(subscription?.currency ?? defaultCurrency)
  const [category, setCategory] = useState<string>(subscription?.category ?? CATEGORIES[16])
  const [dayOfMonth, setDayOfMonth] = useState(
    subscription ? String(subscription.day_of_month) : '1',
  )
  const [paymentMethod, setPaymentMethod] = useState<'DEBIT' | 'CREDIT'>(
    subscription?.payment_method ?? 'DEBIT',
  )
  const [cardId, setCardId] = useState<string | null>(subscription?.card_id ?? activeCards[0]?.id ?? null)
  const [selectedAccountKey, setSelectedAccountKey] = useState<string | null>(() => {
    if (subscription?.account_id) return subscription.account_id
    return primaryAccount?.id ?? (cashAccount ? 'cash' : null)
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null)

  const scrollOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => e.target.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 300)
  }

  const resolveAccountId = (): string | null => {
    if (!selectedAccountKey || selectedAccountKey === 'cash') return cashAccount?.id ?? null
    return selectedAccountKey
  }

  const invalidateData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['account-breakdown'] }),
      queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    ])
  }

  const handleSave = async () => {
    const num = Number(amount)
    const day = Number(dayOfMonth)
    if (!description.trim() || !num || num <= 0 || !day || day < 1 || day > 31) return
    if (paymentMethod === 'CREDIT' && !cardId) return

    const basePayload = {
      description: description.trim(),
      category,
      amount: num,
      currency,
      payment_method: paymentMethod,
      card_id: paymentMethod === 'CREDIT' ? cardId : null,
      account_id: paymentMethod === 'DEBIT' ? resolveAccountId() : null,
      day_of_month: day,
    }

    const applyPayload = {
      ...basePayload,
      last_reviewed_at: new Date().toISOString(),
      month: getCurrentMonth(),
    }

    setIsSaving(true)
    try {
      if (!subscription) {
        const res = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(basePayload),
        })
        if (!res.ok) throw new Error()
        const saved = (await res.json()) as Subscription
        await invalidateData()
        onSave(saved)
        onClose()
        return
      }

      const res = await fetch(`/api/subscriptions/${subscription.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applyPayload),
      })

      if (res.status === 409) {
        setPendingPayload(applyPayload)
        return
      }

      if (!res.ok) throw new Error()
      const result = (await res.json()) as { subscription: Subscription }
      await invalidateData()
      onSave(result.subscription)
      onClose()
    } catch {
      alert('Error al guardar la suscripcion. Intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleApplyScope = async (scope: 'current_only' | 'current_and_future' | 'future_only') => {
    if (!subscription || !pendingPayload) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/subscriptions/${subscription.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pendingPayload, scope }),
      })
      if (!res.ok) throw new Error()
      const result = (await res.json()) as { subscription: Subscription }
      await invalidateData()
      onSave(result.subscription)
      setPendingPayload(null)
      onClose()
    } catch {
      alert('Error al aplicar cambios a la suscripcion.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!subscription) return
    setIsArchiving(true)
    try {
      const res = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      })
      if (!res.ok) throw new Error()
      await invalidateData()
      onArchive(subscription.id)
      onClose()
    } catch {
      alert('Error al archivar la suscripcion. Intenta de nuevo.')
    } finally {
      setIsArchiving(false)
    }
  }

  const chipBase =
    'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border'
  const chipActive = 'border-primary bg-primary/15 text-primary'
  const chipInactive = 'border-border-ocean bg-primary/[0.03] text-text-tertiary'
  const canSave =
    description.trim().length > 0 &&
    Number(amount) > 0 &&
    Number(dayOfMonth) >= 1 &&
    Number(dayOfMonth) <= 31 &&
    (paymentMethod !== 'CREDIT' || !!cardId)

  return (
    <Modal open onClose={onClose}>
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-text-disabled sm:hidden" />
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          {subscription ? 'Editar suscripcion' : 'Nueva suscripcion'}
        </h2>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Descripcion
          </label>
          <input
            type="text"
            placeholder="Ej. Netflix, Spotify, Gym..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={scrollOnFocus}
            maxLength={100}
            className="w-full rounded-input border border-transparent bg-bg-tertiary px-4 py-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Monto
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={scrollOnFocus}
              className="flex-1 rounded-input border border-transparent bg-bg-tertiary px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
            <div className="flex rounded-input bg-bg-tertiary p-1">
              {(['ARS', 'USD'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`rounded-button px-3 py-1.5 text-sm font-medium transition-colors ${
                    currency === c ? 'bg-primary text-bg-primary' : 'text-text-secondary'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Categoria
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`${chipBase} ${category === cat ? chipActive : chipInactive}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Que dia se debita
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={31}
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              onFocus={scrollOnFocus}
              className="w-24 rounded-input border border-transparent bg-bg-tertiary px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
            <span className="text-xs text-text-tertiary">de cada mes (1-31)</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Metodo de pago
          </label>
          <div className="flex gap-2">
            {(['DEBIT', 'CREDIT'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                  paymentMethod === m
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border-subtle bg-bg-tertiary text-text-tertiary'
                }`}
              >
                {m === 'DEBIT' ? 'Debito' : 'Credito'}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'DEBIT' && accounts.length > 0 && (
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              Cuenta
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {bankDigital.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccountKey(acc.id)}
                  className={`${chipBase} ${selectedAccountKey === acc.id ? chipActive : chipInactive}`}
                >
                  <AccountIcon type={acc.type} size={13} />
                  <span>{acc.name}</span>
                  {acc.is_primary && (
                    <Star
                      weight="fill"
                      size={9}
                      className={selectedAccountKey === acc.id ? 'text-primary' : 'text-text-disabled'}
                    />
                  )}
                </button>
              ))}
              {cashAccount && (
                <button
                  onClick={() => setSelectedAccountKey('cash')}
                  className={`${chipBase} ${selectedAccountKey === 'cash' ? chipActive : chipInactive}`}
                >
                  <Wallet weight="duotone" size={13} />
                  <span>{cashAccount.name}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {paymentMethod === 'CREDIT' && activeCards.length > 0 && (
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              Tarjeta
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {activeCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setCardId(card.id)}
                  className={`${chipBase} ${cardId === card.id ? chipActive : chipInactive}`}
                >
                  {card.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className="w-full rounded-button bg-primary py-3 text-sm font-semibold text-white transition-transform active:scale-95 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : subscription ? 'Guardar cambios' : 'Guardar suscripcion'}
        </button>

        {subscription && (
          <button
            onClick={handleArchive}
            disabled={isArchiving}
            className="w-full rounded-button bg-danger/10 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
          >
            {isArchiving ? 'Archivando...' : 'Archivar suscripcion'}
          </button>
        )}

        <button
          onClick={onClose}
          disabled={isSaving || isArchiving}
          className="w-full rounded-button py-3 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          Cancelar
        </button>
      </div>

      {pendingPayload && (
        <Modal open onClose={() => setPendingPayload(null)}>
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-text-disabled sm:hidden" />
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Aplicar cambios</h3>
              <p className="mt-1 text-xs text-text-tertiary">
                Ya existe un débito generado este mes para esta suscripción. Elegí cómo aplicar la edición.
              </p>
            </div>

            <button
              onClick={() => handleApplyScope('current_only')}
              disabled={isSaving}
              className="w-full rounded-button border border-border-ocean px-4 py-3 text-left transition-colors hover:bg-primary/5 disabled:opacity-50"
            >
              <span className="block text-sm font-medium text-text-primary">This month only</span>
              <span className="mt-1 block text-[11px] text-text-tertiary">
                Corrige el débito ya generado de este mes sin cambiar los próximos.
              </span>
            </button>

            <button
              onClick={() => handleApplyScope('current_and_future')}
              disabled={isSaving}
              className="w-full rounded-button border border-border-ocean px-4 py-3 text-left transition-colors hover:bg-primary/5 disabled:opacity-50"
            >
              <span className="block text-sm font-medium text-text-primary">This and future</span>
              <span className="mt-1 block text-[11px] text-text-tertiary">
                Corrige este mes y además actualiza la suscripción para los próximos.
              </span>
            </button>

            <button
              onClick={() => handleApplyScope('future_only')}
              disabled={isSaving}
              className="w-full rounded-button border border-border-ocean px-4 py-3 text-left transition-colors hover:bg-primary/5 disabled:opacity-50"
            >
              <span className="block text-sm font-medium text-text-primary">Future only</span>
              <span className="mt-1 block text-[11px] text-text-tertiary">
                Deja intacto el débito de este mes y aplica el cambio solo hacia adelante.
              </span>
            </button>

            <button
              onClick={() => setPendingPayload(null)}
              disabled={isSaving}
              className="w-full rounded-button py-3 text-sm text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  )
}
