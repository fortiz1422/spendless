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
      <div className="mx-auto max-w-md px-6 pt-safe pb-6">
        <h1 className="mb-9 text-[30px] font-black tracking-tight text-text-primary">
          Configuración
        </h1>

        {/* Preferencias */}
        <section className="mb-10">
          <p className="mb-4 type-label text-text-label">
            Preferencias
          </p>
          <div className="flex flex-col gap-4">
            <CurrencySection currency={currency} />
            <CardsSection cards={allCards} />
            <IncomeSection defaultMonth={currentMonth} />
          </div>
        </section>

        {/* Cuenta */}
        <section>
          <p className="mb-4 type-label text-text-label">
            Cuenta
          </p>
          <AccountSection email={user.email ?? ''} />
        </section>
      </div>
    </div>
  )
}
