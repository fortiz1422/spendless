import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SmartInput } from '@/components/dashboard/SmartInput'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { SaldoVivo } from '@/components/dashboard/SaldoVivo'
import { GastosTarjeta } from '@/components/dashboard/GastosTarjeta'
import { FiltroEstoico } from '@/components/dashboard/FiltroEstoico'
import { Top3 } from '@/components/dashboard/Top3'
import { Ultimos5 } from '@/components/dashboard/Ultimos5'
import { IncomeSetupModal } from '@/components/dashboard/IncomeSetupModal'
import type { Card, DashboardData } from '@/types/database'

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
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

  // Parallel: check income + fetch dashboard data
  const [incomeResult, dashboardResult] = await Promise.all([
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
  ])

  const hasIncome = incomeResult.data !== null
  const dashboardData = dashboardResult.data as DashboardData | null
  const isCurrentMonth = selectedMonth === currentMonth

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-md space-y-3 px-4 pb-6 pt-safe">
        <DashboardHeader
          month={selectedMonth}
          email={user.email ?? ''}
          currency={currency}
          cards={allCards}
        />

        <SmartInput cards={cards} />

        {!hasIncome && isCurrentMonth && (
          <IncomeSetupModal month={selectedMonth} currency={currency} />
        )}

        <SaldoVivo data={dashboardData?.saldo_vivo ?? null} currency={currency} />

        <GastosTarjeta total={dashboardData?.gastos_tarjeta ?? 0} currency={currency} />

        <FiltroEstoico data={dashboardData?.filtro_estoico ?? { necesidad_count: 0, deseo_count: 0, total_count: 0 }} />

        <Top3 data={dashboardData?.top_3 ?? null} currency={currency} />

        <Ultimos5 expenses={dashboardData?.ultimos_5 ?? null} month={selectedMonth} />
      </div>
    </div>
  )
}
