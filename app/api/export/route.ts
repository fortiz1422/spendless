import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Card } from '@/types/database'

const PAYMENT_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  DEBIT: 'Débito',
  TRANSFER: 'Transferencia',
  CREDIT: 'Crédito',
}

const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: expenses, error }, { data: config }] = await Promise.all([
    supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('user_config').select('cards').eq('user_id', user.id).single(),
  ])

  if (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Error al exportar' }, { status: 500 })
  }

  const cards: Card[] = Array.isArray(config?.cards) ? (config.cards as Card[]) : []
  const cardMap = new Map(cards.map((c) => [c.id, c.name]))

  const headers = [
    'Fecha',
    'Descripción',
    'Monto',
    'Moneda',
    'Categoría',
    'Medio de pago',
    'Tarjeta',
    '¿Deseo?',
  ]

  const rows = (expenses ?? []).map((e) => [
    e.date,
    esc(e.description),
    e.amount,
    e.currency,
    esc(e.category),
    esc(PAYMENT_LABELS[e.payment_method] ?? e.payment_method),
    esc(e.card_id ? (cardMap.get(e.card_id) ?? '') : ''),
    e.is_want ? 'Sí' : 'No',
  ])

  const csvLines = [headers.join(','), ...rows.map((r) => r.join(','))]
  // BOM for Excel UTF-8 compatibility
  const csv = '\uFEFF' + csvLines.join('\r\n')

  const today = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="gota-${today}.csv"`,
    },
  })
}
