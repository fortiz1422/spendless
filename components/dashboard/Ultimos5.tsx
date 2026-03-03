import Link from 'next/link'
import { formatAmount, formatDate } from '@/lib/format'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import type { Expense } from '@/types/database'

interface Props {
  expenses: Expense[] | null
  month: string
}

function getWantDotClass(isWant: boolean | null): string {
  if (isWant === true) return 'bg-want'
  if (isWant === false) return 'bg-success'
  return 'bg-text-dim'
}

export function Ultimos5({ expenses, month }: Props) {
  const expensesHref = `/expenses?month=${month}`

  return (
    <div className="px-2">
      <div className="flex justify-between items-center mb-1">
        <p className="type-label text-text-label">Últimos gastos</p>
        <Link href={expensesHref} className="text-[11px] font-medium text-primary no-underline">
          Ver todos →
        </Link>
      </div>

      {!expenses || expenses.length === 0 ? (
        <p className="text-[13px] text-text-tertiary mt-2.5">
          Sin gastos registrados este mes.
        </p>
      ) : (
        <div>
          {expenses.map((expense, idx) => {
            const isPagoTarjetas = expense.category === 'Pago de Tarjetas'
            const isLast = idx === expenses.length - 1
            return (
              <div
                key={expense.id}
                className={`flex items-center gap-3.5 py-3.5 ${!isLast ? 'border-b border-primary/12' : ''}`}
              >
                <div className="w-[38px] h-[38px] rounded-full shrink-0 bg-primary/6 border border-border-ocean flex items-center justify-center">
                  <CategoryIcon category={expense.category} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text-primary m-0 truncate">
                    {expense.description || expense.category}
                  </p>
                  <div className="flex items-center gap-1.5 mt-[3px]">
                    <span
                      className={`w-[5px] h-[5px] rounded-full shrink-0 inline-block ${getWantDotClass(expense.is_want)}`}
                    />
                    <span className="text-[11px] text-text-label">
                      {expense.category} · {formatDate(expense.date)}
                    </span>
                  </div>
                </div>
                <p
                  className={`text-[14px] font-bold tabular-nums tracking-[-0.01em] ${isPagoTarjetas ? 'text-primary' : 'text-text-primary'}`}
                >
                  {formatAmount(expense.amount, expense.currency)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
