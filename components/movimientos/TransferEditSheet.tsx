'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { formatAmount } from '@/lib/format'
import type { Account, Transfer } from '@/types/database'

interface Props {
  transfer: Transfer
  accounts: Account[]
  onClose: () => void
  onUpdate: () => void
}

export function TransferEditSheet({ transfer, accounts, onClose, onUpdate }: Props) {
  const [note, setNote] = useState(transfer.note ?? '')
  const [date, setDate] = useState(transfer.date.substring(0, 10))
  const [isSaving, setIsSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a.name]))
  const fromName = accountMap[transfer.from_account_id] ?? 'Cuenta'
  const toName = accountMap[transfer.to_account_id] ?? 'Cuenta'
  const sameCurrency = transfer.currency_from === transfer.currency_to

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/transfers/${transfer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() || null, date }),
      })
      if (!res.ok) throw new Error()
      onUpdate()
    } catch {
      alert('Error al guardar. Intentá de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/transfers/${transfer.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      onUpdate()
    } catch {
      alert('Error al eliminar.')
      setIsSaving(false)
      setConfirmDelete(false)
    }
  }

  return (
    <Modal open onClose={onClose}>
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-text-disabled sm:hidden" />
      <h2 className="text-lg font-semibold text-text-primary">Editar transferencia</h2>

      {/* Info de la transferencia (solo lectura) */}
      <div className="mt-4 rounded-card bg-bg-tertiary px-4 py-3">
        <p className="text-[11px] text-text-tertiary">
          {fromName} → {toName}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-text-primary">
          {formatAmount(transfer.amount_from, transfer.currency_from)}
          {!sameCurrency && (
            <span className="ml-2 text-text-tertiary">
              → {formatAmount(transfer.amount_to, transfer.currency_to)}
            </span>
          )}
        </p>
      </div>

      <div className="mt-5 space-y-5">
        {/* Nota */}
        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Nota{' '}
            <span className="normal-case text-text-disabled">(opcional)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={100}
            className="w-full rounded-input border border-transparent bg-bg-tertiary px-4 py-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none"
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-input border border-transparent bg-bg-tertiary px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-button bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSaving && !confirmDelete ? 'Guardando...' : 'Guardar'}
        </button>
        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-button py-3 text-sm text-text-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="flex-1 rounded-button bg-danger/20 py-3 text-sm font-semibold text-danger disabled:opacity-50"
            >
              {isSaving ? '...' : 'Eliminar'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full rounded-button py-3 text-sm text-danger"
          >
            Eliminar transferencia
          </button>
        )}
      </div>
    </Modal>
  )
}
