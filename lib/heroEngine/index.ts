import type { Expense, Card, Subscription } from '@/types/database'
import type { Metrics } from '@/lib/analytics/computeMetrics'
import type { CompromisosData } from '@/lib/analytics/computeCompromisos'
import type { InsightResult, HeroCache } from './types'
import { computeSignals } from './signals'
import { collectAllCandidates, resolveAntiRepetition, selectVariant } from './rules'
import { TEMPLATES, PILL1, buildPills23 } from './templates'
import { interpolate } from './interpolate'
import { readHeroCache, writeHeroCache, shouldRecompute } from './cache'

export type { InsightResult, Chip } from './types'

export function buildHeroOutput(
  metrics: Metrics,
  expenses: Expense[],
  cards: Card[],
  subscriptions: Subscription[],
  compromisos: CompromisosData,
): InsightResult {
  const today = new Date()
  const signals = computeSignals(metrics, expenses, cards, subscriptions, compromisos, today)

  // esPrimerosDias → always fresh_start, no chips
  if (signals.esPrimerosDias) {
    const variantIndex = selectVariant(today)
    const [templateText] = TEMPLATES.fresh_start[variantIndex]
    return {
      titular: interpolate(templateText, signals),
      sentiment: 'neutral',
      chips: [],
    }
  }

  // Check cache
  const cache = readHeroCache()
  if (!shouldRecompute(cache, signals) && cache) {
    return {
      titular: cache.titular,
      sentiment: cache.sentiment,
      chips: cache.chips,
    }
  }

  // Evaluate
  const candidates = collectAllCandidates(signals)
  const winner = resolveAntiRepetition(
    candidates[0],
    signals.lastHeroThread,
    candidates,
  )
  const variantIndex = selectVariant(today)

  const [templateText, sentiment] = TEMPLATES[winner][variantIndex]
  const titular = interpolate(templateText, signals)

  const pill1 = PILL1[winner](signals)
  const pills23 = buildPills23(signals, winner)
  const chips = [pill1, ...pills23]

  const newCache: HeroCache = {
    thread: winner,
    variantIndex,
    titular,
    sentiment,
    chips,
    computedAt: signals.lastHeroDate
      ? signals.lastHeroDate
      : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    monthPhase: signals.monthPhase,
  }
  // Fix: use today's date key, not lastHeroDate
  newCache.computedAt =
    `${today.getFullYear()}-` +
    `${String(today.getMonth() + 1).padStart(2, '0')}-` +
    `${String(today.getDate()).padStart(2, '0')}`

  writeHeroCache(newCache)

  return { titular, sentiment, chips }
}
