'use client'

import { useState } from 'react'
import { ArrowCircleUp, ArrowsLeftRight, TrendUp } from '@phosphor-icons/react'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { formatAmount, formatDate, todayAR } from '@/lib/format'
import { ExpenseItem } from '@/components/expenses/ExpenseItem'
import { IncomeEditSheet } from './IncomeEditSheet'
import { TransferEditSheet } from './TransferEditSheet'
import type { Account, Card, Expense, IncomeEntry, Transfer, YieldAccumulator } from '@/types/database'

const INCOME_LABELS: Record<string, string> = {
  salary: 'Sueldo',
  freelance: 'Freelance',
  other: 'Ingreso',
}

type ApiMovement =
  | { kind: 'expense'; data: Expense }
  | { kind: 'income'; data: IncomeEntry }
  | { kind: 'transfer'; data: Transfer }
  | { kind: 'yield'; data: YieldAccumulator & { accountName: string } }

function getMovementDate(mv: ApiMovement): string {
  if (mv.kind === 'yield') {
    return (mv.data.last_accrued_date ?? mv.data.created_at).substring(0, 10)
  }
  return mv.data.date.substring(0, 10)
}

function groupByDate(movements: ApiMovement[]): [string, ApiMovement[]][] {
  const map = new Map<string, ApiMovement[]>()
  for (const mv of movements) {
    const date = getMovementDate(mv)
    if (!map.has(date)) map.set(date, [])
    map.get(date)!.push(mv)
  }
  // Sort: today+past descending, future entries at the end
  const today = todayAR()
  return [...map.entries()].sort(([a], [b]) => {
    const aFuture = a > today
    const bFuture = b > today
    if (aFuture !== bFuture) return aFuture ? 1 : -1
    return b.localeCompare(a)
  })
}

function formatDayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function getWantDotClass(isWant: boolean | null): string {
  if (isWant === true) return 'bg-want'
  if (isWant === false) return 'bg-success'
  return 'bg-text-dim'
}

interface Props {
  movements: ApiMovement[]
  total: number
  isLoadingMore: boolean
  onLoadMore: () => void
  accounts: Account[]
  cards: Card[]
  onRefresh: () => void
}

export function MovimientosGroupedList({ movements, total, isLoadingMore, onLoadMore, accounts, cards, onRefresh }: Props) {
  const [editingIncome, setEditingIncome] = useState<IncomeEntry | null>(null)
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null)

  if (movements.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-tertiary">
        Sin movimientos para este período.
      </p>
    )
  }

  const grouped = groupByDate(movements)

  return (
    <div>
      {grouped.map(([date, items]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center gap-2 py-2.5">
            <div className="h-px flex-1 bg-border-subtle" />
            <span className="type-label text-text-tertiary capitalize text-[10px] px-1">
              {formatDayLabel(date)}
            </span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>

          {/* Items for this date */}
          <div>
            {items.map((mv, idx) => {
              const isLast = idx === items.length - 1
              const divider = !isLast ? 'border-b border-border-subtle' : ''

              if (mv.kind === 'yield') {
                const ya = mv.data
                const isClosed = !!ya.confirmed_at
                return (
                  <div
                    key={`y-${ya.account_id}-${ya.id}`}
                    className={`flex items-center gap-3.5 py-3.5 ${divider}`}
                  >
                    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-success/20 bg-success/10">
                      <TrendUp weight="duotone" size={18} className="text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 truncate text-[13px] font-medium text-text-primary">
                        {ya.accountName}
                      </p>
                      <span className="text-[11px] text-text-label">
                        Rendimiento · {isClosed ? formatDate(ya.confirmed_at!) : 'en curso'}
                      </span>
                    </div>
                    <p className="text-[14px] font-bold tabular-nums tracking-[-0.01em] text-success">
                      +{formatAmount(ya.accumulated, 'ARS')}
                    </p>
                  </div>
                )
              }

              if (mv.kind === 'income') {
                const entry = mv.data
                return (
                  <div
                    key={`i-${entry.id}`}
                    onClick={() => setEditingIncome(entry)}
                    className={`flex cursor-pointer items-center gap-3.5 py-3.5 ${divider}`}
                  >
                    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-success/20 bg-success/10">
                      <ArrowCircleUp weight="duotone" size={18} className="text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 truncate text-[13px] font-medium text-text-primary">
                        {entry.description || INCOME_LABELS[entry.category] || 'Ingreso'}
                      </p>
                      <span className="text-[11px] text-text-label">
                        {INCOME_LABELS[entry.category]}
                      </span>
                    </div>
                    <p className="text-[14px] font-bold tabular-nums tracking-[-0.01em] text-success">
                      +{formatAmount(entry.amount, entry.currency)}
                    </p>
                  </div>
                )
              }

              if (mv.kind === 'transfer') {
                const transfer = mv.data
                const sameCurrency = transfer.currency_from === transfer.currency_to
                return (
                  <div
                    key={`t-${transfer.id}`}
                    onClick={() => setEditingTransfer(transfer)}
                    className={`flex cursor-pointer items-center gap-3.5 py-3.5 ${divider}`}
                  >
                    <div
                      className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'rgba(27,126,158,0.10)', border: '1px solid rgba(27,126,158,0.20)' }}
                    >
                      <ArrowsLeftRight weight="duotone" size={18} style={{ color: 'var(--color-ocean)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 truncate text-[13px] font-medium text-text-primary">
                        Transferencia
                      </p>
                      {transfer.note && (
                        <span className="text-[11px] text-text-label">{transfer.note}</span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-bold tabular-nums tracking-[-0.01em] text-text-secondary">
                        {formatAmount(transfer.amount_from, transfer.currency_from)}
                      </p>
                      {!sameCurrency && (
                        <p className="text-[11px] text-text-tertiary">
                          {formatAmount(transfer.amount_to, transfer.currency_to)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              }

              // expense — use ExpenseItem for inline editing
              const expense = mv.data
              return (
                <ExpenseItem
                  key={`e-${expense.id}`}
                  expense={expense}
                  cards={cards}
                  accounts={accounts}
                  onUpdate={onRefresh}
                />
              )
            })}
          </div>
        </div>
      ))}

      {total > movements.length && (
        <div className="pt-4 pb-2 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="rounded-full px-5 py-2 text-[12px] font-semibold text-text-secondary transition-colors disabled:opacity-50"
            style={{
              background: 'rgba(255,255,255,0.38)',
              border: '1px solid rgba(255,255,255,0.70)',
            }}
          >
            {isLoadingMore ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}

      {editingIncome && (
        <IncomeEditSheet
          entry={editingIncome}
          accounts={accounts}
          onClose={() => setEditingIncome(null)}
          onUpdate={() => { setEditingIncome(null); onRefresh() }}
        />
      )}
      {editingTransfer && (
        <TransferEditSheet
          transfer={editingTransfer}
          accounts={accounts}
          onClose={() => setEditingTransfer(null)}
          onUpdate={() => { setEditingTransfer(null); onRefresh() }}
        />
      )}
    </div>
  )
}
