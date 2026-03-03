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
        <h1
          style={{
            fontSize: 30,
            fontWeight: 900,
            color: '#f0f9ff',
            letterSpacing: '-0.03em',
            marginBottom: 36,
          }}
        >
          Configuración
        </h1>

        {/* Configuración */}
        <section style={{ marginBottom: 40 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#7B98B8',
              marginBottom: 16,
            }}
          >
            Preferencias
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <CurrencySection currency={currency} />
            <CardsSection cards={allCards} />
            <IncomeSection defaultMonth={currentMonth} />
          </div>
        </section>

        {/* Cuenta */}
        <section>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#7B98B8',
              marginBottom: 16,
            }}
          >
            Cuenta
          </p>
          <AccountSection email={user.email ?? ''} />
        </section>
      </div>
    </div>
  )
}
