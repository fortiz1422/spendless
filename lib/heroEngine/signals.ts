import type { Expense, Card, Subscription } from '@/types/database'
import type { Metrics } from '@/lib/analytics/computeMetrics'
import type { CompromisosData } from '@/lib/analytics/computeCompromisos'
import type { HeroEngineInput, MonthPhase, ClosingCardSignal } from './types'
import { readHeroCache } from './cache'

export function getMonthPhase(dayOfMonth: number): MonthPhase {
  if (dayOfMonth <= 7) return 'inicio'
  if (dayOfMonth <= 22) return 'nucleo'
  return 'cierre'
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function getMonthName(date: Date): string {
  return MONTHS_ES[date.getMonth()]
}

function dateKey(date: Date): string {
  return (
    `${date.getFullYear()}-` +
    `${String(date.getMonth() + 1).padStart(2, '0')}-` +
    `${String(date.getDate()).padStart(2, '0')}`
  )
}

function buildClosingCards(
  expenses: Expense[],
  compromisos: CompromisosData,
  monthlyIncome: number,
): ClosingCardSignal[] {
  return compromisos.tarjetas
    .filter((t) => t.daysUntilClosing !== null && t.daysUntilClosing >= 0 && t.daysUntilClosing <= 7)
    .map((t) => {
      // Top category for this card's credit expenses
      const cardExpenses = expenses.filter(
        (e) => e.card_id === t.id && e.payment_method === 'CREDIT',
      )
      const catMap: Record<string, number> = {}
      for (const e of cardExpenses) {
        catMap[e.category] = (catMap[e.category] ?? 0) + e.amount
      }
      const sorted = Object.entries(catMap).sort(([, a], [, b]) => b - a)
      const topCategory = sorted[0]?.[0] ?? ''
      const topCategoryAmount = sorted[0]?.[1] ?? 0
      const topCategoryShare =
        t.currentSpend > 0
          ? Math.round((topCategoryAmount / t.currentSpend) * 100)
          : 0

      return {
        id: t.id,
        name: t.name,
        daysToClosing: t.daysUntilClosing!,
        committed: t.currentSpend,
        topCategory,
        topCategoryShare,
        isHeavy: monthlyIncome > 0 && t.currentSpend > monthlyIncome * 0.25,
      }
    })
    .sort((a, b) => a.daysToClosing - b.daysToClosing)
}

export function computeSignals(
  metrics: Metrics,
  expenses: Expense[],
  cards: Card[],
  subscriptions: Subscription[],
  compromisos: CompromisosData,
  today: Date,
): HeroEngineInput {
  const monthlyIncome = metrics.ingresoMes ?? 0
  const { dayOfMonth, daysInMonth, currency } = metrics

  const dailyRate = dayOfMonth > 0 ? metrics.totalGastado / dayOfMonth : 0
  const spendingPace = dailyRate * daysInMonth
  const projectedBalance = monthlyIncome - spendingPace

  // Category spike: a category with >= 25% of total and >= 3 transactions
  const spikeCat = metrics.categorias.find(
    (c) => c.pctDelTotal >= 25 && c.cantidad >= 3,
  )
  const categorySpike = spikeCat
    ? {
        name: spikeCat.category,
        share: spikeCat.pctDelTotal / 100,
        txCount: spikeCat.cantidad,
        amount: spikeCat.total,
      }
    : null

  // Pending subscriptions (day_of_month > today's day = hasn't debited yet)
  const pendingSubs = subscriptions.filter((s) => s.day_of_month > dayOfMonth)
  const pendingSubscriptions =
    pendingSubs.length > 0
      ? {
          count: pendingSubs.length,
          estimatedAmount: pendingSubs.reduce((sum, s) => sum + s.amount, 0),
          nextDebitDays: Math.min(...pendingSubs.map((s) => s.day_of_month - dayOfMonth)),
          names: pendingSubs.map((s) => s.description),
        }
      : null

  const recurringTotal = subscriptions.reduce((s, sub) => s + sub.amount, 0)
  const recurringRatio = monthlyIncome > 0 ? recurringTotal / monthlyIncome : 0

  const closingCards = buildClosingCards(expenses, compromisos, monthlyIncome)

  // Anti-repetition: read yesterday's thread from cache
  const cache = readHeroCache()
  const lastHeroThread = cache?.thread ?? null
  const lastHeroDate = cache?.computedAt ?? null

  return {
    today,
    dayOfMonth,
    daysLeft: metrics.diasRestantes,
    daysInMonth,
    monthPhase: getMonthPhase(dayOfMonth),
    monthName: getMonthName(today),
    currency,
    esPrimerosDias: metrics.esPrimerosDias,
    hasIngreso: metrics.hasIngreso,

    totalSpent: metrics.totalGastado,
    monthlyIncome,
    spendingPace,
    projectedBalance,
    dailyRate,
    weeklyAvg: metrics.weeklyAvg,

    bigExpenseToday: metrics.bigExpenseToday,
    bigExpenseAmount: metrics.bigExpenseAmount,
    bigExpenseCategory: metrics.bigExpenseCategory,

    topCategory: {
      name: metrics.topCategoriaMonto.category,
      amount: metrics.topCategoriaMonto.total,
      share: metrics.topCategoriaMonto.pctDelTotal / 100,
      tag: metrics.topCategoriaMonto.tipo,
      txCount: metrics.topCategoriaMonto.cantidad,
    },
    categorySpike,

    deseoRatio: metrics.pctDeseo / 100,
    necesidadRatio: metrics.pctNecesidad / 100,
    creditRatio: metrics.pctCredito / 100,
    creditRatioThisWeek: metrics.creditRatioThisWeek / 100,

    closingCards,

    pendingSubscriptions,
    recurringTotal,
    recurringRatio,
    recurringCount: subscriptions.length,

    goteoCount: metrics.goteoCount,
    goteoTotal: metrics.goteoTotal,
    goteoRatio: metrics.pctGoteoDelTotal / 100,

    lastHeroThread,
    lastHeroDate,

    saldoVivoGap: 0, // Phase 2
  }
}
