'use client'

import { useRouter } from 'next/navigation'
import { SmartInput } from '@/components/dashboard/SmartInput'

const EXAMPLES = ['café 1500', 'almuerzo 4 lucas', 'uber 3k', 'despensa 15000']

export function StepAhamoment() {
  const router = useRouter()

  const handleAfterSave = async () => {
    await fetch('/api/user-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarding_completed: true }),
    })
    router.push('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary px-5 pb-10 pt-safe">
      <div className="pb-8 pt-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          Paso 2 de 2
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-text-primary">
          Registrá tu último gasto.
        </h2>
        <p className="mt-2 text-sm text-text-tertiary">Escribilo como quieras.</p>
      </div>

      {/* Example chips */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {EXAMPLES.map((ex) => (
          <span
            key={ex}
            className="shrink-0 rounded-full border border-primary/15 bg-primary/8 px-3 py-1.5 text-xs text-primary"
          >
            {ex}
          </span>
        ))}
      </div>

      <SmartInput cards={[]} accounts={[]} onAfterSave={handleAfterSave} />
    </div>
  )
}
