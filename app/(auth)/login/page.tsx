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
        <svg width="48" height="68" viewBox="0 0 48 68" fill="none" className="mb-5 mx-auto" aria-hidden="true">
          <path d="M 24 3 C 24 3, 8 22, 6 44 C 5 57, 14 66, 24 66 C 34 66, 43 57, 42 44 C 40 22, 24 3, 24 3 Z" fill="rgba(56,189,248,0.12)" />
          <path d="M 24 20 C 24 20, 13 33, 11 44 C 10 54, 16 64, 24 64 C 32 64, 38 54, 37 44 C 35 33, 24 20, 24 20 Z" fill="rgba(56,189,248,0.65)" />
        </svg>
        <h1 className="mb-2 text-3xl font-light tracking-wide text-text-primary">
          Gota
        </h1>
        <p className="mb-10 text-sm text-text-tertiary">
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
