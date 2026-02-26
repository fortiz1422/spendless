import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { ExpenseItem } from '@/components/expenses/ExpenseItem'
import { ExpenseFilters } from '@/components/expenses/ExpenseFilters'
import type { Card, Expense } from '@/types/database'

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string
    category?: string
    payment_method?: string
    page?: string
  }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const currentMonth = getCurrentMonth()
  const month = params.month ?? currentMonth
  const category = params.category ?? ''
  const paymentMethod = params.payment_method ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const pageSize = 20
  const offset = (page - 1) * pageSize

  // Fetch user config for cards
  const { data: config } = await supabase
    .from('user_config')
    .select('cards')
    .eq('user_id', user.id)
    .single()
  const cards: Card[] = ((config?.cards as Card[]) ?? []).filter((c: Card) => !c.archived)

  // Build query
  const [y, m] = month.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  let query = supabase
    .from('expenses')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .gte('date', `${month}-01`)
    .lte('date', `${month}-${String(lastDay).padStart(2, '0')}`)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (category) query = query.eq('category', category)
  if (paymentMethod)
    query = query.eq('payment_method', paymentMethod as 'CASH' | 'DEBIT' | 'TRANSFER' | 'CREDIT')

  const { data, count } = await query
  const expenses = (data ?? []) as Expense[]
  const total = count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-md px-4 pb-6 pt-safe">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-white/5"
            aria-label="Volver"
          >
            ‹
          </Link>
          <h1 className="text-base font-semibold text-text-primary">Gastos</h1>
        </div>

        {/* Filters */}
        <div className="mb-4 rounded-card bg-bg-secondary p-4">
          <Suspense fallback={null}>
            <ExpenseFilters
              month={month}
              category={category}
              paymentMethod={paymentMethod}
            />
          </Suspense>
        </div>

        {/* Results count */}
        <p className="mb-3 text-xs text-text-tertiary">
          {total === 0
            ? 'Sin gastos para este período'
            : `${total} gasto${total !== 1 ? 's' : ''}`}
        </p>

        {/* Expense list */}
        {expenses.length > 0 && (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <ExpenseItem key={expense.id} expense={expense} cards={cards} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            {page > 1 ? (
              <Link
                href={`/expenses?${new URLSearchParams({
                  ...(month !== currentMonth ? { month } : {}),
                  ...(category ? { category } : {}),
                  ...(paymentMethod ? { payment_method: paymentMethod } : {}),
                  page: String(page - 1),
                }).toString()}`}
                className="rounded-button bg-bg-tertiary px-4 py-2 text-sm text-text-secondary hover:bg-white/5"
              >
                ← Anterior
              </Link>
            ) : (
              <div />
            )}
            <span className="text-sm text-text-tertiary">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/expenses?${new URLSearchParams({
                  ...(month !== currentMonth ? { month } : {}),
                  ...(category ? { category } : {}),
                  ...(paymentMethod ? { payment_method: paymentMethod } : {}),
                  page: String(page + 1),
                }).toString()}`}
                className="rounded-button bg-bg-tertiary px-4 py-2 text-sm text-text-secondary hover:bg-white/5"
              >
                Siguiente →
              </Link>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
