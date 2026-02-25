import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const amount = Number(searchParams.get('amount'))
  const category = searchParams.get('category') ?? ''
  const date = searchParams.get('date') ?? ''

  if (!amount || !category || !date) {
    return NextResponse.json({ duplicates: [] })
  }

  const { data, error } = await supabase.rpc('detect_duplicate_expenses', {
    p_user_id: user.id,
    p_amount: amount,
    p_category: category,
    p_date: date,
  })

  if (error) {
    console.error('Duplicate check error:', error)
    return NextResponse.json({ duplicates: [] })
  }

  return NextResponse.json({ duplicates: data ?? [] })
}
