import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addMonths, getCurrentMonth } from '@/lib/dates'
import { todayAR } from '@/lib/format'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const now = new Date()
  const month =
    searchParams.get('month') ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currency = (searchParams.get('currency') === 'USD' ? 'USD' : 'ARS') as 'ARS' | 'USD'
  const projected = searchParams.get('projected') === 'true'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // When projected, use current month's data (which becomes the projected opening balance)
  const queryMonth = projected ? getCurrentMonth() : month
  const monthDate = queryMonth + '-01'
  const nextMonthDate = addMonths(queryMonth, 1) + '-01'
  const isCurrentMonth = queryMonth === getCurrentMonth()
  const todayDate = todayAR()
  const cutoffDate = isCurrentMonth ? todayDate : nextMonthDate

  const [
    { data: accountsData },
    { data: balancesData },
    { data: incomeData },
    { data: debitExpData },
    { data: cardPayData },
    { data: transfersData },
    { data: yieldData },
  ] = await Promise.all([
    supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('is_primary', { ascending: false }),
    supabase
      .from('account_period_balance')
      .select('account_id, balance_ars, balance_usd')
      .eq('period', monthDate),
    supabase
      .from('income_entries')
      .select('account_id, amount, date')
      .eq('user_id', user.id)
      .eq('currency', currency)
      [isCurrentMonth ? 'lte' : 'lt']('date', cutoffDate),
    supabase
      .from('expenses')
      .select('account_id, amount, date')
      .eq('user_id', user.id)
      .eq('currency', currency)
      [isCurrentMonth ? 'lte' : 'lt']('date', cutoffDate)
      .in('payment_method', ['CASH', 'DEBIT', 'TRANSFER'])
      .neq('category', 'Pago de Tarjetas'),
    supabase
      .from('expenses')
      .select('account_id, amount, date')
      .eq('user_id', user.id)
      .eq('currency', currency)
      [isCurrentMonth ? 'lte' : 'lt']('date', cutoffDate)
      .eq('category', 'Pago de Tarjetas'),
    supabase
      .from('transfers')
      .select('from_account_id, to_account_id, amount_from, amount_to, currency_from, currency_to, date')
      .eq('user_id', user.id)
      [isCurrentMonth ? 'lte' : 'lt']('date', cutoffDate),
    supabase
      .from('yield_accumulator')
      .select('account_id, accumulated, month')
      .eq('user_id', user.id)
      .lte('month', queryMonth),
  ])

  const accounts = accountsData ?? []
  const primaryId = accounts.find((a) => a.is_primary)?.id ?? accounts[0]?.id ?? null
  const snapshotAccounts = new Set((balancesData ?? []).map((balance) => balance.account_id))

  // NULL account_id → primary account
  const resolve = (id: string | null) => id ?? primaryId

  // Opening balances per account
  const openingMap: Record<string, number> = {}
  for (const account of accounts) {
    const snapshot = (balancesData ?? []).find((balance) => balance.account_id === account.id)
    openingMap[account.id] = snapshot
      ? currency === 'ARS'
        ? snapshot.balance_ars
        : snapshot.balance_usd
      : currency === 'ARS'
        ? account.opening_balance_ars
        : account.opening_balance_usd
  }

  const isAfterAccountBase = (accountId: string, valueDate: string, valueMonth?: string) => {
    if (!snapshotAccounts.has(accountId)) return true
    if (valueMonth) return valueMonth >= queryMonth
    return valueDate >= monthDate
  }

  // Income per account
  const incomeMap: Record<string, number> = {}
  for (const e of incomeData ?? []) {
    const id = resolve(e.account_id)
    if (id && isAfterAccountBase(id, e.date)) incomeMap[id] = (incomeMap[id] ?? 0) + e.amount
  }

  // Yield per account: only impacts ARS Saldo Vivo
  const yieldMap: Record<string, number> = {}
  if (currency === 'ARS') {
    for (const y of yieldData ?? []) {
      if (isAfterAccountBase(y.account_id, '', y.month)) {
        yieldMap[y.account_id] = (yieldMap[y.account_id] ?? 0) + y.accumulated
      }
    }
  }

  // Debit expenses per account
  const debitMap: Record<string, number> = {}
  for (const e of debitExpData ?? []) {
    const id = resolve(e.account_id)
    if (id && isAfterAccountBase(id, e.date)) debitMap[id] = (debitMap[id] ?? 0) + e.amount
  }

  // Card payments per account
  const cardMap: Record<string, number> = {}
  for (const e of cardPayData ?? []) {
    const id = resolve(e.account_id)
    if (id && isAfterAccountBase(id, e.date)) cardMap[id] = (cardMap[id] ?? 0) + e.amount
  }

  // Transfer adjustments per account (all transfers, not just cross-currency)
  // Same-currency (ARS→ARS): subtracts from source, adds to destination → total unchanged, per-account correct
  // Cross-currency (ARS→USD viewing ARS): only subtracts from source → per-currency correct
  const transferMap: Record<string, number> = {}
  for (const t of transfersData ?? []) {
    if (t.currency_from === currency) {
      const id = resolve(t.from_account_id)
      if (id && isAfterAccountBase(id, t.date)) transferMap[id] = (transferMap[id] ?? 0) - t.amount_from
    }
    if (t.currency_to === currency) {
      const id = resolve(t.to_account_id)
      if (id && isAfterAccountBase(id, t.date)) transferMap[id] = (transferMap[id] ?? 0) + t.amount_to
    }
  }

  const breakdown = accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    type: acc.type,
    is_primary: acc.is_primary,
    saldo:
      (openingMap[acc.id] ?? 0) +
      (incomeMap[acc.id] ?? 0) -
      (debitMap[acc.id] ?? 0) -
      (cardMap[acc.id] ?? 0) +
      (yieldMap[acc.id] ?? 0) +
      (transferMap[acc.id] ?? 0),
  }))

  const total = breakdown.reduce((s, a) => s + a.saldo, 0)

  return NextResponse.json({ breakdown, total, currency })
}
