import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountSection } from '@/components/settings/AccountSection'
import { CurrencySection } from '@/components/settings/CurrencySection'
import { CardsSection } from '@/components/settings/CardsSection'
import { IncomeSection } from '@/components/settings/IncomeSection'
import type { Card } from '@/types/database'

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: config } = await supabase
    .from('user_config')
    .select('cards, default_currency')
    .eq('user_id', user.id)
    .single()

  const currency = (config?.default_currency ?? 'ARS') as 'ARS' | 'USD'
  const allCards: Card[] = (config?.cards as Card[]) ?? []
  const currentMonth = getCurrentMonth()

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-md space-y-6 px-4 pt-safe">
        <h1 className="text-base font-semibold text-text-primary">Configuración</h1>

        {/* Configuración */}
        <section className="space-y-4 rounded-card bg-bg-secondary p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Configuración
          </p>
          <CurrencySection currency={currency} />
          <CardsSection cards={allCards} />
          <IncomeSection defaultMonth={currentMonth} />
        </section>

        {/* Cuenta — al fondo */}
        <section className="space-y-2 pb-6">
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Cuenta
          </p>
          <AccountSection email={user.email ?? ''} />
        </section>
      </div>
    </div>
  )
}
