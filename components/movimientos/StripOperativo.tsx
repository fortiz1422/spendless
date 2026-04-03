'use client'

import { formatCompact } from '@/lib/format'

interface Props {
  percibidos: number
  tarjeta: number
  pagoTarjeta: number
  currency?: 'ARS' | 'USD'
}

export function StripOperativo({ percibidos, tarjeta, pagoTarjeta, currency = 'ARS' }: Props) {
  return (
    <div
      className="flex items-stretch rounded-card overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.38)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.70)',
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-3 py-3.5 text-center">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-text-label leading-none mb-1.5">
          Percibidos
        </span>
        <span className="text-[15px] font-bold tabular-nums text-text-primary leading-none">
          {formatCompact(percibidos, currency)}
        </span>
        <span className="text-[9px] text-text-tertiary leading-none mt-1">
          egresos reales
        </span>
      </div>

      <div className="w-px bg-border-subtle self-stretch" />

      <div className="flex-1 flex flex-col items-center justify-center px-3 py-3.5 text-center">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-text-label leading-none mb-1.5">
          Tarjeta
        </span>
        <span className="text-[15px] font-bold tabular-nums text-text-primary leading-none">
          {tarjeta > 0 ? formatCompact(tarjeta, currency) : '—'}
        </span>
        <span className="text-[9px] text-text-tertiary leading-none mt-1">
          devengado
        </span>
      </div>

      <div className="w-px bg-border-subtle self-stretch" />

      <div className="flex-1 flex flex-col items-center justify-center px-3 py-3.5 text-center">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-text-label leading-none mb-1.5">
          Pago tarjeta
        </span>
        <span className="text-[15px] font-bold tabular-nums text-primary leading-none">
          {pagoTarjeta > 0 ? formatCompact(pagoTarjeta, currency) : '—'}
        </span>
        <span className="text-[9px] text-text-tertiary leading-none mt-1">
          abonado
        </span>
      </div>
    </div>
  )
}
