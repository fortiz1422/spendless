'use client'

import { primaryAlpha } from '@/lib/colors'

interface Props {
  onNext: () => void
}

export function StepBienvenida({ onNext }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-bg-primary px-6 pb-10 pt-20">
      <div className="flex flex-col items-center gap-8 text-center">
        <svg
          width="48"
          height="68"
          viewBox="0 0 48 68"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M 24 3 C 24 3, 8 22, 6 44 C 5 57, 14 66, 24 66 C 34 66, 43 57, 42 44 C 40 22, 24 3, 24 3 Z"
            fill={primaryAlpha[12]}
          />
          <path
            d="M 24 20 C 24 20, 13 33, 11 44 C 10 54, 16 64, 24 64 C 32 64, 38 54, 37 44 C 35 33, 24 20, 24 20 Z"
            fill={primaryAlpha[65]}
          />
        </svg>

        <div>
          <h1 className="text-3xl font-light leading-snug text-text-primary">
            Tus finanzas,
            <br />
            de a gota.
          </h1>
          <p className="mt-3 text-sm text-text-tertiary">
            Registrá tus gastos en segundos. Sin formularios.
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-bg-primary transition-transform active:scale-95"
      >
        Empezar
      </button>
    </div>
  )
}
