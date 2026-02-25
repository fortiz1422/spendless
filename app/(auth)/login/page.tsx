import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginButton } from './LoginButton'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/')

  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-2 text-4xl font-bold text-text-primary">
          💰 SpendLess
        </h1>
        <p className="mb-10 text-base text-text-secondary">
          Tus gastos, sin fricción
        </p>

        {error === 'oauth' && (
          <p className="mb-4 text-sm text-danger">
            Error al iniciar sesión. Intentá de nuevo.
          </p>
        )}

        <LoginButton />
      </div>
    </div>
  )
}
