import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { addMonths, getCurrentMonth } from '@/lib/dates'

const ApplySchema = z.object({
  description: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().min(0.01),
  currency: z.enum(['ARS', 'USD']),
  payment_method: z.enum(['DEBIT', 'CREDIT']),
  card_id: z.string().nullable().optional(),
  account_id: z.string().nullable().optional(),
  day_of_month: z.number().int().min(1).max(31),
  last_reviewed_at: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  scope: z.enum(['current_only', 'current_and_future', 'future_only']).optional(),
})

type SubscriptionPatch = {
  description: string
  category: string
  amount: number
  currency: 'ARS' | 'USD'
  payment_method: 'DEBIT' | 'CREDIT'
  card_id: string | null
  account_id: string | null
  day_of_month: number
  last_reviewed_at: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = ApplySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const targetMonth = parsed.data.month ?? getCurrentMonth()
  const monthDate = `${targetMonth}-01`
  const nextMonthDate = `${addMonths(targetMonth, 1)}-01`

  const patch: SubscriptionPatch = {
    description: parsed.data.description,
    category: parsed.data.category,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    payment_method: parsed.data.payment_method,
    card_id: parsed.data.payment_method === 'CREDIT' ? parsed.data.card_id ?? null : null,
    account_id: parsed.data.payment_method === 'DEBIT' ? parsed.data.account_id ?? null : null,
    day_of_month: parsed.data.day_of_month,
    last_reviewed_at: parsed.data.last_reviewed_at ?? new Date().toISOString(),
  }

  const [{ data: subscription, error: subscriptionError }, { data: insertion }] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('subscription_insertions')
      .select('expense_id')
      .eq('subscription_id', id)
      .eq('month', monthDate)
      .maybeSingle(),
  ])

  if (subscriptionError || !subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  let currentExpenseId = insertion?.expense_id ?? null

  if (!currentExpenseId) {
    const { data: fallbackExpense } = await supabase
      .from('expenses')
      .select('id')
      .eq('user_id', user.id)
      .eq('subscription_id', id)
      .gte('date', monthDate)
      .lt('date', nextMonthDate)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    currentExpenseId = fallbackExpense?.id ?? null
  }

  if (currentExpenseId && !parsed.data.scope) {
    return NextResponse.json(
      { error: 'scope_required', current_month_has_generated_expense: true },
      { status: 409 },
    )
  }

  const scope = parsed.data.scope ?? 'future_only'

  const updateExpense = async () => {
    if (!currentExpenseId) return null
    const { data, error } = await supabase
      .from('expenses')
      .update({
        description: patch.description,
        category: patch.category,
        amount: patch.amount,
        currency: patch.currency,
        payment_method: patch.payment_method,
        card_id: patch.card_id,
        account_id: patch.account_id,
      })
      .eq('id', currentExpenseId)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error) throw error
    return data
  }

  const updateSubscription = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(patch)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  try {
    if (scope === 'current_only') {
      if (!currentExpenseId) {
        return NextResponse.json(
          { error: 'No generated expense found for current month' },
          { status: 400 },
        )
      }

      const [, updatedSubscription] = await Promise.all([updateExpense(), updateSubscriptionReviewOnly(supabase, user.id, id, patch.last_reviewed_at)])
      return NextResponse.json({ subscription: updatedSubscription, scope_applied: scope })
    }

    if (scope === 'current_and_future') {
      const [updatedSubscription] = await Promise.all([
        updateSubscription(),
        currentExpenseId ? updateExpense() : Promise.resolve(null),
      ])
      return NextResponse.json({ subscription: updatedSubscription, scope_applied: scope })
    }

    const updatedSubscription = await updateSubscription()
    return NextResponse.json({ subscription: updatedSubscription, scope_applied: scope })
  } catch (error) {
    console.error('Apply subscription update error:', error)
    return NextResponse.json({ error: 'Error al aplicar cambios' }, { status: 500 })
  }
}

async function updateSubscriptionReviewOnly(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  subscriptionId: string,
  lastReviewedAt: string,
) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ last_reviewed_at: lastReviewedAt })
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
