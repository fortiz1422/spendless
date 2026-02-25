import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExpenseSchema } from '@/lib/validation/schemas'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = 20
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('expenses')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const month = searchParams.get('month')
  if (month) {
    const [y, m] = month.split('-').map(Number)
    const lastDay = new Date(y, m, 0).getDate()
    query = query
      .gte('date', `${month}-01`)
      .lte('date', `${month}-${String(lastDay).padStart(2, '0')}`)
  }

  const category = searchParams.get('category')
  if (category) query = query.eq('category', category)

  const paymentMethod = searchParams.get('payment_method')
  if (paymentMethod) query = query.eq('payment_method', paymentMethod)

  const cardId = searchParams.get('card_id')
  if (cardId) query = query.eq('card_id', cardId)

  const currency = searchParams.get('currency')
  if (currency) query = query.eq('currency', currency)

  const { data, count, error } = await query
  if (error) {
    console.error('Get expenses error:', error)
    return NextResponse.json({ error: 'Error al obtener gastos' }, { status: 500 })
  }

  return NextResponse.json({
    expenses: data ?? [],
    total: count ?? 0,
    page,
    page_size: pageSize,
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = ExpenseSchema.parse(body)

    const { data, error } = await supabase
      .from('expenses')
      .insert({ user_id: user.id, ...validated })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Create expense error:', error)
    return NextResponse.json(
      { error: 'Error al guardar el gasto' },
      { status: 500 }
    )
  }
}
