import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentMonth } from '@/lib/dates'
import { MovimientosClient } from '@/components/movimientos/MovimientosClient'

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { month } = await searchParams
  const initialMonth = month ?? getCurrentMonth()

  return <MovimientosClient initialMonth={initialMonth} />
}
