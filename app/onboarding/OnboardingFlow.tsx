'use client'

import { useState } from 'react'
import { Step1SaldoVivo } from './steps/Step1SaldoVivo'
import { Step2Cuenta } from './steps/Step2Cuenta'
import { Step4SaldoInicial } from './steps/Step4SaldoInicial'
import { Step5SmartInput } from './steps/Step5SmartInput'
import { Step6Done } from './steps/Step6Done'

export type OnboardingData = {
  accountId: string | null
  accountName: string
  accountType: 'bank' | 'cash' | 'digital'
  balanceARS: number | null
  balanceUSD: number | null
}

const initialData: OnboardingData = {
  accountId: null,
  accountName: '',
  accountType: 'bank',
  balanceARS: null,
  balanceUSD: null,
}

interface Props {
  initialCurrency: 'ARS' | 'USD'
  currentMonth: string
}

export function OnboardingFlow(_props: Props) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(initialData)

  if (step === 0) {
    return <Step1SaldoVivo onNext={() => setStep(1)} />
  }

  if (step === 1) {
    return (
      <Step2Cuenta
        onBack={() => setStep(0)}
        onNext={(accountId, accountName, accountType) => {
          setData((d) => ({ ...d, accountId, accountName, accountType }))
          setStep(2)
        }}
      />
    )
  }

  if (step === 2) {
    return (
      <Step4SaldoInicial
        accountId={data.accountId!}
        accountName={data.accountName}
        onBack={() => setStep(1)}
        onNext={(balanceARS, balanceUSD) => {
          setData((d) => ({ ...d, balanceARS, balanceUSD }))
          setStep(3)
        }}
      />
    )
  }

  if (step === 3) {
    return (
      <Step5SmartInput
        accountId={data.accountId!}
        accountName={data.accountName}
        accountType={data.accountType}
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
      />
    )
  }

  return <Step6Done data={data} />
}
