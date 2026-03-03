import { formatAmount, formatCompact } from '@/lib/format'
import { Wallet, CreditCard } from 'lucide-react'
import type { DashboardData } from '@/types/database'

interface Props {
  data: DashboardData['saldo_vivo']
  currency: 'ARS' | 'USD'
  gastosTarjeta?: number
}

export function SaldoVivo({ data, currency, gastosTarjeta = 0 }: Props) {
  if (!data) {
    return (
      <div className="px-2 py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Disponible
        </p>
        <p className="mt-2 text-sm text-text-tertiary">
          Configurá tu ingreso mensual para ver cuánto te queda disponible.
        </p>
      </div>
    )
  }

  const saldoInicial = (data.saldo_inicial as number | undefined) ?? 0
  const disponible = saldoInicial + data.ingresos - data.gastos_percibidos - data.pago_tarjetas
  const isNegative = disponible < 0

  return (
    <div className="relative px-2 py-6">
      {/* Bioluminescent glow */}
      <div
        aria-hidden
        className={`absolute -top-5 -left-[30px] w-[280px] h-[200px] rounded-full pointer-events-none z-0 blur-2xl ${isNegative ? 'glow-negative' : 'glow-positive'}`}
      />

      {/* Hero number */}
      <div className="relative z-10">
        <p className="type-label text-text-label mb-1.5">Disponible</p>
        <p className={`type-hero tabular-nums m-0 ${isNegative ? 'text-danger-light' : 'text-text-primary'}`}>
          {isNegative ? '−' : ''}
          {formatAmount(Math.abs(disponible), currency)}
        </p>

        {/* Twin Pills */}
        <div className="flex gap-2.5 mt-5">
          {/* Percibidos */}
          <div className="flex-1 flex items-center gap-3 px-3.5 py-3 rounded-full bg-surface border border-border-ocean">
            <div className="w-[30px] h-[30px] rounded-full shrink-0 bg-primary/8 border border-border-ocean flex items-center justify-center">
              <Wallet size={13} className="text-text-label" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-text-label leading-none mb-1">
                Percibidos
              </p>
              <p className="type-amount text-text-primary tabular-nums">
                {formatCompact(data.gastos_percibidos, currency)}
              </p>
            </div>
          </div>

          {/* Tarjeta */}
          {gastosTarjeta > 0 && (
            <div className="flex-1 flex items-center gap-3 px-3.5 py-3 rounded-full bg-surface border border-border-ocean">
              <div className="w-[30px] h-[30px] rounded-full shrink-0 bg-primary/8 border border-border-ocean flex items-center justify-center">
                <CreditCard size={13} className="text-text-label" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-text-label leading-none mb-1">
                  Tarjeta
                </p>
                <p className="type-amount text-text-primary tabular-nums">
                  {formatCompact(gastosTarjeta, currency)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
