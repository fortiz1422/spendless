'use client'

import { Drop, ArrowCircleDown, CreditCard, CheckCircle } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { ProgressDots } from '../components/ProgressDots'

const ITEMS: { Icon: Icon; title: string; desc: string }[] = [
  {
    Icon: Drop,
    title: 'Saldo Vivo',
    desc: 'Refleja exactamente lo que tenés disponible hoy.',
  },
  {
    Icon: ArrowCircleDown,
    title: 'Débito, efectivo y transferencia',
    desc: 'Reducen tu Saldo Vivo de inmediato — ya salieron de tu bolsillo.',
  },
  {
    Icon: CreditCard,
    title: 'Tarjeta de crédito',
    desc: 'No lo reducen todavía, porque aún no los pagaste.',
  },
  {
    Icon: CheckCircle,
    title: 'Si cargás tus movimientos',
    desc: 'Saldo Vivo va a coincidir con lo que te muestra el banco.',
  },
]

interface Props {
  onNext: () => void
}

export function Step1SaldoVivo({ onNext }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary px-5 pb-10 pt-safe">
      <div className="py-4">
        <ProgressDots total={4} current={0} />
      </div>

      <div className="mt-8 flex-1">
        <h2 className="text-2xl font-semibold text-text-primary">
          Tu dinero disponible,{' '}
          <span className="text-primary">en tiempo real</span>
        </h2>

        <div className="mt-8 space-y-5">
          {ITEMS.map(({ Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <Icon
                size={22}
                weight="duotone"
                className="mt-0.5 shrink-0 text-primary"
              />
              <div>
                <p className="text-sm font-semibold text-text-primary">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-text-tertiary">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-bg-primary transition-transform active:scale-95"
      >
        Entendido
      </button>
    </div>
  )
}
