'use client'

import { useState } from 'react'
import { ArrowsClockwise } from '@phosphor-icons/react'
import { SubscriptionReviewSheet } from './SubscriptionReviewSheet'
import type { Subscription, Card } from '@/types/database'

interface Props {
  subscriptions: Subscription[]
  currency: 'ARS' | 'USD'
  cards: Card[]
}

function needsReview(sub: Subscription): boolean {
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  return new Date(sub.last_reviewed_at) < threeMonthsAgo
}

export function SubscriptionReviewBanner({ subscriptions, currency, cards }: Props) {
  const [showSheet, setShowSheet] = useState(false)

  const stale = subscriptions.filter(needsReview)
  if (stale.length === 0) return null

  return (
    <>
      <button
        onClick={() => setShowSheet(true)}
        className="flex w-full items-center gap-3 rounded-card border border-warning/30 bg-warning/10 px-4 py-3 text-left transition-opacity hover:opacity-80"
      >
        <ArrowsClockwise weight="bold" size={16} className="shrink-0 text-warning" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-warning">
            Revisá tus suscripciones
          </p>
          <p className="text-[10px] text-text-tertiary">
            {stale.length === 1
              ? '1 suscripción no se revisa hace más de 3 meses'
              : `${stale.length} suscripciones sin revisar en más de 3 meses`}
          </p>
        </div>
      </button>

      {showSheet && (
        <SubscriptionReviewSheet
          subscriptions={subscriptions}
          currency={currency}
          cards={cards}
          onDone={() => setShowSheet(false)}
        />
      )}
    </>
  )
}
