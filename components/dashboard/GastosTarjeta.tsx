import { formatAmount } from '@/lib/format'

interface Props {
  total: number
  currency: 'ARS' | 'USD'
}

export function GastosTarjeta({ total, currency }: Props) {
  return (
    <div className="rounded-card bg-bg-secondary p-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Gastos con Tarjeta
        </p>
        <p className="mt-0.5 text-xs text-text-tertiary">Diferidos · no impactan saldo</p>
      </div>
      <p className="text-base font-semibold text-text-primary">
        {formatAmount(total, currency)}
      </p>
    </div>
  )
}
