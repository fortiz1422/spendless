'use client'

import { useState } from 'react'
import { Plus, ArrowFatLineUp, ArrowsClockwise, X, CreditCard } from '@phosphor-icons/react'
import { Modal } from '@/components/ui/Modal'
import { IncomeModal } from './IncomeModal'
import { SubscriptionSheet } from '@/components/subscriptions/SubscriptionSheet'
import { CuotasEnCursoSheet } from './CuotasEnCursoSheet'
import type { Account, Card } from '@/types/database'

interface Props {
  accounts: Account[]
  currency: 'ARS' | 'USD'
  cards: Card[]
  month: string
}

type Sheet = null | 'action' | 'income' | 'subscription' | 'cuotas'

export function HomePlusButton({ accounts, currency, cards, month }: Props) {
  const [sheet, setSheet] = useState<Sheet>(null)

  return (
    <>
      <button
        onClick={() => setSheet('action')}
        aria-label="Agregar ingreso o suscripción"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-bg-tertiary transition-colors hover:bg-bg-elevated active:scale-95"
      >
        <Plus weight="bold" size={18} className="text-text-primary" />
      </button>

      {/* Action sheet */}
      {sheet === 'action' && (
        <Modal open onClose={() => setSheet(null)}>
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-text-disabled sm:hidden" />
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">¿Qué querés agregar?</h2>
            <button
              onClick={() => setSheet(null)}
              className="rounded-full p-1.5 text-text-disabled transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            >
              <X weight="bold" size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setSheet('income')}
              className="flex w-full items-center gap-4 rounded-card border border-border-strong bg-bg-tertiary px-4 py-4 text-left transition-colors hover:border-success/40 hover:bg-success/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15">
                <ArrowFatLineUp weight="duotone" size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Ingreso</p>
                <p className="text-xs text-text-tertiary">Registrá un sueldo o entrada de plata</p>
              </div>
            </button>

            <button
              onClick={() => setSheet('subscription')}
              className="flex w-full items-center gap-4 rounded-card border border-border-strong bg-bg-tertiary px-4 py-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <ArrowsClockwise weight="duotone" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Suscripción</p>
                <p className="text-xs text-text-tertiary">
                  Netflix, Spotify, débitos que se cobran solos
                </p>
              </div>
            </button>

            <button
              onClick={() => setSheet('cuotas')}
              className="flex w-full items-center gap-4 rounded-card border border-border-strong bg-bg-tertiary px-4 py-4 text-left transition-colors hover:border-warning/40 hover:bg-warning/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/15">
                <CreditCard weight="duotone" size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Cuotas en curso</p>
                <p className="text-xs text-text-tertiary">
                  Compras en cuotas que ya estás pagando
                </p>
              </div>
            </button>
          </div>
        </Modal>
      )}

      {sheet === 'income' && (
        <IncomeModal
          accounts={accounts}
          defaultCurrency={currency}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'subscription' && (
        <SubscriptionSheet
          onClose={() => setSheet(null)}
          currency={currency}
          cards={cards}
          accounts={accounts}
        />
      )}

      {sheet === 'cuotas' && (
        <CuotasEnCursoSheet
          onClose={() => setSheet(null)}
          currency={currency}
          cards={cards}
        />
      )}
    </>
  )
}
