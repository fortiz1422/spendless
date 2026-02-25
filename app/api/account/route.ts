import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = user.id

  // Delete all user data (RLS scoped to user_id)
  await Promise.all([
    supabase.from('expenses').delete().eq('user_id', userId),
    supabase.from('monthly_income').delete().eq('user_id', userId),
    supabase.from('user_config').delete().eq('user_id', userId),
  ])

  // Delete auth user (requires service role)
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Error al eliminar la cuenta' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
