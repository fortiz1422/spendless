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
        <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Saldo Vivo
        </p>
        <p className="mt-3 text-sm text-text-tertiary">
          Configurá tu ingreso mensual para ver cuánto te queda disponible.
        </p>
      </div>
    )
  }

  const disponible = data.ingresos - data.gastos_percibidos - data.pago_tarjetas

  return (
    <div className="rounded-card-lg bg-bg-elevated p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-text-secondary">
        Saldo Vivo
      </p>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Ingresos</span>
          <span className="text-success">{formatAmount(data.ingresos, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Gastos percibidos</span>
          <span className="text-text-primary">
            −{formatAmount(data.gastos_percibidos, currency)}
          </span>
        </div>
        {data.pago_tarjetas > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Pago de tarjetas</span>
            <span className="text-text-primary">
              −{formatAmount(data.pago_tarjetas, currency)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-border-subtle pt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">Disponible</span>
        <span
          className={`text-xl font-semibold tabular-nums ${disponible >= 0 ? 'text-success' : 'text-danger'}`}
        >
          {disponible < 0 ? '−' : ''}
          {formatAmount(Math.abs(disponible), currency)}
        </span>
      </div>
    </div>
  )
}
