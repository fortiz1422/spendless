'use client'

import { useState } from 'react'
import { StepBienvenida } from './components/StepBienvenida'
import { StepConfiguracion } from './components/StepConfiguracion'
import { StepAhamoment } from './components/StepAhamoment'

interface Props {
  initialCurrency: 'ARS' | 'USD'
  currentMonth: string // YYYY-MM
}

export function OnboardingFlow({ initialCurrency, currentMonth }: Props) {
  const [step, setStep] = useState(0)

  if (step === 0) return <StepBienvenida onNext={() => setStep(1)} />
  if (step === 1)
    return (
      <StepConfiguracion
        onBack={() => setStep(0)}
        onNext={() => setStep(2)}
        initialCurrency={initialCurrency}
        month={currentMonth}
      />
    )
  return <StepAhamoment />
}
