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

  return (
    <div className="px-2">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#7B98B8',
          }}
        >
          Últimos gastos
        </p>
        <Link
          href={expensesHref}
          style={{ fontSize: 11, color: '#38bdf8', fontWeight: 500, textDecoration: 'none' }}
        >
          Ver todos →
        </Link>
      </div>

      {!expenses || expenses.length === 0 ? (
        <p style={{ fontSize: 13, color: '#4B6472', marginTop: 10 }}>
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 0',
                  borderBottom: isLast ? 'none' : '1px solid rgba(148,210,255,0.07)',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: 'rgba(148,210,255,0.06)',
                    border: '1px solid rgba(148,210,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                  }}
                >
                  {CATEGORY_ICONS[expense.category] ?? '📦'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#f0f9ff',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {expense.description || expense.category}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: expense.is_want === true ? '#fdba74' : expense.is_want === false ? '#4ade80' : '#4B6472',
                        flexShrink: 0,
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ fontSize: 11, color: '#7B98B8' }}>
                      {expense.category} · {formatDate(expense.date)}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isPagoTarjetas ? '#38bdf8' : '#f0f9ff',
                    letterSpacing: '-0.01em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
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
