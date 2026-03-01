import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SmartInput } from '@/components/dashboard/SmartInput'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { SaldoVivo } from '@/components/dashboard/SaldoVivo'
import { GastosTarjeta } from '@/components/dashboard/GastosTarjeta'
import { FiltroEstoico } from '@/components/dashboard/FiltroEstoico'
import { Ultimos5 } from '@/components/dashboard/Ultimos5'
import { IncomeSetupModal } from '@/components/dashboard/IncomeSetupModal'
import { RachaRegistro } from '@/components/dashboard/RachaRegistro'
import type { Card, DashboardData } from '@/types/database'

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { month } = await searchParams
  const currentMonth = getCurrentMonth()
  const selectedMonth = month ?? currentMonth
  // DB requires full DATE format (YYYY-MM-01)
  const selectedMonthDate = selectedMonth + '-01'

  // Fetch user config first (needed for currency)
  const { data: config } = await supabase
    .from('user_config')
    .select('cards, default_currency')
    .eq('user_id', user.id)
    .single()

  const currency = (config?.default_currency ?? 'ARS') as 'ARS' | 'USD'
  const allCards: Card[] = (config?.cards as Card[]) ?? []
  const cards: Card[] = allCards.filter((c: Card) => !c.archived)

  // Parallel: check income + fetch dashboard data + streak expenses
  const [incomeResult, dashboardResult, { data: streakExpenses }] = await Promise.all([
    supabase
      .from('monthly_income')
      .select('id')
      .eq('user_id', user.id)
      .eq('month', selectedMonthDate)
      .maybeSingle(),
    supabase.rpc('get_dashboard_data', {
      p_user_id: user.id,
      p_month: selectedMonthDate,
      p_currency: currency,
    }),
    supabase
      .from('expenses')
      .select('date')
      .eq('user_id', user.id)
      .gte('date', (() => { const d = new Date(); d.setDate(d.getDate() - 9); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })()),
  ])

  // Racha de registro: últimos 10 días
  const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })()
  const activeDates = new Set((streakExpenses ?? []).map((e) => e.date.substring(0, 10)))
  const rachaDays = Array.from({ length: 10 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (9 - i))
    const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    return { date, active: activeDates.has(date), isToday: date === todayStr }
  })
  let rachaStreak = 0
  for (let i = 0; i < 10; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    if (activeDates.has(dStr)) rachaStreak++
    else break
  }

  const hasIncome = incomeResult.data !== null
  const dashboardData = dashboardResult.data as DashboardData | null
  const isCurrentMonth = selectedMonth === currentMonth

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-md space-y-3 px-4 pb-6 pt-safe">
        <DashboardHeader month={selectedMonth} />

        <SmartInput cards={cards} />

        <RachaRegistro days={rachaDays} streak={rachaStreak} />

        {!hasIncome && isCurrentMonth && (
          <IncomeSetupModal month={selectedMonth} currency={currency} />
        )}

        <SaldoVivo data={dashboardData?.saldo_vivo ?? null} currency={currency} />

        {(dashboardData?.gastos_tarjeta ?? 0) > 0 && (
          <GastosTarjeta total={dashboardData!.gastos_tarjeta} currency={currency} />
        )}

        {(dashboardData?.ultimos_5?.length ?? 0) > 0 && (
          <FiltroEstoico data={dashboardData!.filtro_estoico} />
        )}

        <Ultimos5 expenses={dashboardData?.ultimos_5 ?? null} month={selectedMonth} />
      </div>
    </div>
  )
}
