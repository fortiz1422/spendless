import { formatAmount } from '@/lib/format'
import type { DashboardData } from '@/types/database'

interface Props {
  data: DashboardData['saldo_vivo']
  currency: 'ARS' | 'USD'
}

export function SaldoVivo({ data, currency }: Props) {
  if (!data) {
    return (
      <div className="rounded-card-lg bg-bg-elevated p-5">
        <p className="text-xs text-text-tertiary">saldo vivo</p>
        <p className="mt-3 text-sm text-text-tertiary">
          Configurá tu ingreso mensual para ver cuánto te queda disponible.
        </p>
      </div>
    )
  }

  const disponible = data.ingresos - data.gastos_percibidos - data.pago_tarjetas

  return (
    <div className="rounded-card-lg bg-bg-elevated p-5">
      <p className="mb-4 text-xs text-text-tertiary">saldo vivo</p>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-tertiary">ingresos</span>
          <span className="text-success">{formatAmount(data.ingresos, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-tertiary">gastos percibidos</span>
          <span className="text-text-secondary">
            −{formatAmount(data.gastos_percibidos, currency)}
          </span>
        </div>
        {data.pago_tarjetas > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-text-tertiary">pago de tarjetas</span>
            <span className="text-text-secondary">
              −{formatAmount(data.pago_tarjetas, currency)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-end justify-between">
        <span className="text-xs text-text-tertiary">disponible</span>
        <span
          className={`text-2xl font-bold tabular-nums ${disponible >= 0 ? 'text-success' : 'text-danger'}`}
        >
          {disponible < 0 ? '−' : ''}
          {formatAmount(Math.abs(disponible), currency)}
        </span>
      </div>
    </div>
  )
}
