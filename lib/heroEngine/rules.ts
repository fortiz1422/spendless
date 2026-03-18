import type { HeroThread, HeroEngineInput } from './types'

const FORCED_THREADS: HeroThread[] = [
  'big_expense_echo',
  'card_closing_heavy',
  'closing_alert',
]

/**
 * Returns all matching threads in priority order.
 * First element = winner. Subsequent elements = fallbacks for anti-repetition.
 */
export function collectAllCandidates(s: HeroEngineInput): HeroThread[] {
  const candidates: HeroThread[] = []
  const phase = s.monthPhase

  // ── INICIO ───────────────────────────────────────────────────────────────
  if (phase === 'inicio') {
    if (s.bigExpenseToday && s.bigExpenseAmount > s.monthlyIncome * 0.10)
      candidates.push('big_expense_echo')
    if (s.pendingSubscriptions && s.pendingSubscriptions.count >= 2)
      candidates.push('subscription_incoming')
    candidates.push('fresh_start')
    return candidates
  }

  // ── NÚCLEO + CIERRE ───────────────────────────────────────────────────────
  const bigThreshold = phase === 'nucleo' ? 0.15 : 0.20
  if (s.bigExpenseToday && s.monthlyIncome > 0 && s.bigExpenseAmount > s.monthlyIncome * bigThreshold)
    candidates.push('big_expense_echo')

  if (s.closingCards.some((c) => c.daysToClosing <= 5 && c.isHeavy))
    candidates.push('card_closing_heavy')

  if (s.closingCards.some((c) => c.daysToClosing <= 7))
    candidates.push('closing_alert')

  // deseo overload (needs spending mass in nucleo)
  const deseoThreshold = phase === 'nucleo' ? 0.55 : 0.45
  const deseoHasMass = s.monthlyIncome > 0 && s.totalSpent > s.monthlyIncome * 0.30
  if (s.deseoRatio > deseoThreshold && (phase === 'cierre' || deseoHasMass))
    candidates.push('deseo_overload')

  if (
    phase === 'nucleo' &&
    s.categorySpike &&
    s.categorySpike.share > 0.25 &&
    s.categorySpike.txCount >= 3
  )
    candidates.push('category_spike')

  if (
    s.creditRatioThisWeek > s.creditRatio * 1.40 &&
    s.monthlyIncome > 0 &&
    s.totalSpent > s.monthlyIncome * 0.20 &&
    s.dayOfMonth >= 7
  )
    candidates.push('debit_vs_credit_shift')

  if (s.pendingSubscriptions && s.pendingSubscriptions.count >= 2)
    candidates.push('subscription_incoming')

  if (s.recurringRatio > 0.20)
    candidates.push('recurring_creep')

  // ── CIERRE ONLY ───────────────────────────────────────────────────────────
  if (phase === 'cierre' && s.hasIngreso) {
    if (s.projectedBalance < 0) candidates.push('pace_tense_ending')
    if (s.projectedBalance >= 0) candidates.push('pace_good_ending')
  }

  // ── PACE ─────────────────────────────────────────────────────────────────
  const paceThreshold = phase === 'nucleo' ? 1.20 : 1.05
  if (s.hasIngreso && s.spendingPace > s.monthlyIncome * paceThreshold)
    candidates.push('pace_alarm')

  if (s.hasIngreso && s.spendingPace < s.monthlyIncome * 0.85 && s.deseoRatio < 0.45)
    candidates.push('good_rhythm')

  candidates.push('neutral_mid')

  return candidates
}

export function resolveAntiRepetition(
  winner: HeroThread,
  lastThread: HeroThread | null,
  allCandidates: HeroThread[],
): HeroThread {
  if (winner === lastThread && !FORCED_THREADS.includes(winner)) {
    const next = allCandidates.find((t) => t !== winner)
    return next ?? 'neutral_mid'
  }
  return winner
}

/** Deterministic variant: same result for all renders on the same calendar day */
export function selectVariant(date: Date): 0 | 1 | 2 {
  const seed =
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate()
  return (seed % 3) as 0 | 1 | 2
}
