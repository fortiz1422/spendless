import Link from 'next/link'
import { formatAmount, formatDate } from '@/lib/format'
import { CATEGORY_ICONS } from '@/lib/categories'
import type { Expense } from '@/types/database'

interface Props {
  expenses: Expense[] | null
  month: string // YYYY-MM
}

export function Ultimos5({ expenses, month }: Props) {
  const expensesHref = `/expenses?month=${month}`

  if (!expenses || expenses.length === 0) {
    return (
      <div className="rounded-card bg-bg-secondary p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">Últimos Gastos</p>
          <Link href={expensesHref} className="text-xs text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        <p className="mt-2 text-sm text-text-tertiary">Sin gastos registrados este mes.</p>
      </div>
    )
  }

  return (
    <div className="rounded-card bg-bg-secondary p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">Últimos Gastos</p>
        <Link href={expensesHref} className="text-xs text-primary hover:underline">
          Ver todos →
        </Link>
      </div>

      <div className="space-y-2">
        {expenses.map((expense) => {
          const isPagoTarjetas = expense.category === 'Pago de Tarjetas'
          return (
            <div
              key={expense.id}
              className={`flex items-center gap-3 rounded-input p-2.5 ${
                isPagoTarjetas ? 'bg-primary/10' : 'bg-bg-tertiary'
              }`}
            >
              <span className="text-lg leading-none">
                {CATEGORY_ICONS[expense.category] ?? '📦'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text-primary">
                  {expense.description || expense.category}
                </p>
                <p className="text-xs text-text-tertiary">
                  {expense.category} · {formatDate(expense.date)}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    isPagoTarjetas ? 'text-primary' : 'text-text-primary'
                  }`}
                >
                  {formatAmount(expense.amount, expense.currency)}
                </p>
                {expense.currency === 'USD' && (
                  <span className="text-[10px] text-warning">USD</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
