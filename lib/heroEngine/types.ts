// ─── Thread types ─────────────────────────────────────────────────────────────

export type HeroThread =
  | 'fresh_start'
  | 'big_expense_echo'
  | 'subscription_incoming'
  | 'category_spike'
  | 'debit_vs_credit_shift'
  | 'deseo_overload'
  | 'closing_alert'
  | 'card_closing_heavy'
  | 'recurring_creep'
  | 'pace_alarm'
  | 'good_rhythm'
  | 'pace_tense_ending'
  | 'pace_good_ending'
  | 'neutral_mid'

export type MonthPhase = 'inicio' | 'nucleo' | 'cierre'
export type Sentiment = 'positive' | 'alert' | 'neutral'

// ─── Chip ─────────────────────────────────────────────────────────────────────

export interface Chip {
  label: string
  emphasis?: 'warning' | 'positive' | 'neutral'
}

// ─── Signals (input to the engine) ───────────────────────────────────────────

export interface ClosingCardSignal {
  id: string
  name: string
  daysToClosing: number
  committed: number
  topCategory: string
  topCategoryShare: number // % of committed from topCategory (0–100)
  isHeavy: boolean         // committed > monthlyIncome * 0.25
}

export interface HeroEngineInput {
  // Time
  today: Date
  dayOfMonth: number
  daysLeft: number
  daysInMonth: number
  monthPhase: MonthPhase
  monthName: string
  currency: 'ARS' | 'USD'
  esPrimerosDias: boolean
  hasIngreso: boolean

  // Spending
  totalSpent: number
  monthlyIncome: number
  spendingPace: number      // projected monthly spend = dailyRate * daysInMonth
  projectedBalance: number  // monthlyIncome - spendingPace
  dailyRate: number         // totalSpent / dayOfMonth
  weeklyAvg: number         // avg daily spend last 7 days

  // Big expense today
  bigExpenseToday: boolean
  bigExpenseAmount: number
  bigExpenseCategory: string

  // Categories
  topCategory: {
    name: string
    amount: number
    share: number   // 0–1
    tag: 'need' | 'want' | 'mixed'
    txCount: number
  }
  categorySpike: {
    name: string
    share: number   // 0–1
    txCount: number
    amount: number
  } | null

  // Deseo / Necesidad
  deseoRatio: number      // 0–1
  necesidadRatio: number  // 0–1

  // Payment mix
  creditRatio: number           // monthly avg 0–1
  creditRatioThisWeek: number   // last 7 days 0–1

  // Cards
  closingCards: ClosingCardSignal[]

  // Subscriptions
  pendingSubscriptions: {
    count: number
    estimatedAmount: number
    nextDebitDays: number
    names: string[]
  } | null
  recurringTotal: number
  recurringRatio: number  // recurringTotal / monthlyIncome
  recurringCount: number

  // Goteo
  goteoCount: number
  goteoTotal: number
  goteoRatio: number  // 0–1

  // Anti-repetition
  lastHeroThread: HeroThread | null
  lastHeroDate: string | null  // YYYY-MM-DD

  // Deferred (always 0 / empty in Phase 1)
  saldoVivoGap: number
}

// ─── Cache ────────────────────────────────────────────────────────────────────

export interface HeroCache {
  thread: HeroThread
  variantIndex: number
  titular: string
  sentiment: Sentiment
  chips: Chip[]
  computedAt: string   // YYYY-MM-DD
  monthPhase: MonthPhase
}

// ─── Output ───────────────────────────────────────────────────────────────────

export interface InsightResult {
  titular: string
  chips: Chip[]
  sentiment: Sentiment
}
