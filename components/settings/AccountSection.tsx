'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AccountSection({ email }: { email: string }) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      alert('Error al eliminar la cuenta. Intentá de nuevo.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="space-y-3 rounded-card bg-bg-secondary p-4">
      {/* Email */}
      <p className="rounded-input bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary">
        {email}
      </p>

      {/* Cerrar sesión */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full rounded-button py-2.5 text-sm font-medium text-danger transition-colors hover:bg-white/5 disabled:opacity-50"
      >
        {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
      </button>

      {/* Eliminar cuenta */}
      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full rounded-button bg-danger/10 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
        >
          Eliminar mi cuenta
        </button>
      ) : (
        <div className="space-y-3 rounded-input bg-danger/10 p-3">
          <p className="text-xs font-medium text-danger">
            ¿Estás seguro? Esta acción es irreversible. Se eliminarán todos tus gastos,
            ingresos y configuración.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="flex-1 rounded-button py-2 text-xs text-text-secondary hover:bg-white/5 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex-1 rounded-button bg-danger py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {isDeleting ? 'Eliminando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
