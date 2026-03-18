import { formatAmount } from '@/lib/format'
import type { HeroEngineInput } from './types'

const MONTHS_LOWER = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function closingDateStr(today: Date, daysToClosing: number): string {
  const d = new Date(today)
  d.setDate(today.getDate() + daysToClosing)
  return `${d.getDate()} de ${MONTHS_LOWER[d.getMonth()]}`
}

function pct(ratio: number): string {
  return String(Math.round(ratio * 100))
}

function fmt(amount: number, currency: 'ARS' | 'USD'): string {
  return formatAmount(Math.round(Math.abs(amount)), currency)
}

export function interpolate(template: string, s: HeroEngineInput): string {
  const c = s.currency
  const closingCard = s.closingCards[0]

  const vars: Record<string, string> = {
    // Month
    mes: s.monthName,
    Mes: s.monthName,
    monthName: s.monthName,

    // Big expense
    bigExpenseCategory: s.bigExpenseCategory || 'Otros',
    bigExpenseAmount: fmt(s.bigExpenseAmount, c),

    // Subscriptions
    pendingCount: String(s.pendingSubscriptions?.count ?? 0),
    pendingAmount: fmt(s.pendingSubscriptions?.estimatedAmount ?? 0, c),

    // Category spike
    spikeCategory: s.categorySpike?.name ?? '',
    spikeShare: pct(s.categorySpike?.share ?? 0),
    spikeTxCount: String(s.categorySpike?.txCount ?? 0),
    spikeCategoryAmount: fmt(s.categorySpike?.amount ?? 0, c),

    // Credit mix
    creditRatioWeek: pct(s.creditRatioThisWeek),
    creditRatioMonth: pct(s.creditRatio),

    // Deseo
    deseoPercent: pct(s.deseoRatio),
    necesidadPercent: pct(s.necesidadRatio),

    // Closing card
    daysToClosing: String(closingCard?.daysToClosing ?? 0),
    cardName: closingCard?.name ?? '',
    closingDate: closingCard ? closingDateStr(s.today, closingCard.daysToClosing) : '',
    cardCommitted: fmt(closingCard?.committed ?? 0, c),
    cardTopCategory: closingCard?.topCategory ?? '',
    cardTopCategoryShare: String(closingCard?.topCategoryShare ?? 0),

    // Recurring
    recurringTotal: fmt(s.recurringTotal, c),
    recurringPercent: pct(s.recurringRatio),
    recurringCount: String(s.recurringCount),

    // Pace
    daysLeft: String(s.daysLeft),
    projectedDeficit: fmt(Math.abs(s.projectedBalance), c),
    projectedBalance: fmt(s.projectedBalance, c),
    dailyRate: fmt(s.dailyRate, c),

    // Generic
    dayOfMonth: String(s.dayOfMonth),
    topCategoryName: s.topCategory.name,
    topCategoryAmount: fmt(s.topCategory.amount, c),
    topCategoryTxCount: String(s.topCategory.txCount),

    // Deferred (always empty in Phase 1)
    saldoVivoGap: fmt(s.saldoVivoGap, c),
    nextMonth: '',
    nextMonthBurdenPct: '',
    nextMonthFreePct: '',
    commitmentCount: '',
    nextCommitmentDesc: '',
    nextCommitmentAmount: '',
    nextCommitmentDate: '',
    lastCommitmentDate: '',
    commitment1Desc: '',
    commitment1Date: '',
    commitment2Desc: '',
    commitment2Date: '',
    remainingCommitmentsCount: '',
  }

  return template.replace(/\[(\w+)\]/g, (_, key: string) => vars[key] ?? '')
}
