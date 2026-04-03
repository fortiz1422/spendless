'use client'

import { useState, useEffect } from 'react'
import { CreditCard, X } from '@phosphor-icons/react'
import { Modal } from '@/components/ui/Modal'
import { getCurrentMonth } from '@/lib/dates'
import type { Card } from '@/types/database'

interface Props {
  open: boolean
  onClose: () => void
}

function closingDaysLabel(closingDay: number | null): string {
  if (!closingDay) return 'Sin fecha de cierre'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m] = [today.getFullYear(), today.getMonth()]
  const closing = new Date(y, m, closingDay)
  if (closing < today) closing.setMonth(closing.getMonth() + 1)
  const diff = Math.round((closing.getTime() - today.getTime()) / 86_400_000)
  if (diff === 0) return 'Cierra hoy'
  if (diff > 0) return `Cierra en ${diff}d`
  return `Cerró hace ${Math.abs(diff)}d`
}

export function TarjetasSubSheet({ open, onClose }: Props) {
  const [cards, setCards] = useState<Card[]>([])
  const [newName, setNewName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const month = getCurrentMonth()

  useEffect(() => {
    if (!open) return
    fetch('/api/cards')
      .then((r) => r.json())
      .then((data: Card[]) => setCards(data))
      .catch(() => {})
  }, [open])

  const addCard = async () => {
    const name = newName.trim()
    if (!name) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error()
      const newCard: Card = await res.json()
      setCards((prev) => [...prev, newCard])
      setNewName('')
    } catch {
      alert('Error al agregar tarjeta.')
    } finally {
      setIsSaving(false)
    }
  }

  void month // used for context but not displayed here

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">
            Tarjetas{cards.length > 0 ? ` (${cards.length})` : ''}
          </h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary">
            <X size={20} />
          </button>
        </div>

        {cards.length === 0 ? (
          <p className="text-sm text-text-tertiary py-2">Sin tarjetas configuradas.</p>
        ) : (
          <div>
            {cards.map((card) => {
              const label = closingDaysLabel(card.closing_day)
              const isClose = card.closing_day !== null && (() => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const [y, m] = [today.getFullYear(), today.getMonth()]
                const closing = new Date(y, m, card.closing_day!)
                if (closing < today) closing.setMonth(closing.getMonth() + 1)
                const diff = Math.round((closing.getTime() - today.getTime()) / 86_400_000)
                return diff >= 0 && diff <= 5
              })()

              return (
                <div key={card.id} className="flex items-center gap-3 py-3 border-b border-border-subtle">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/8 border border-border-ocean">
                    <CreditCard weight="duotone" size={14} className="text-text-label" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-text-primary truncate block">{card.name}</span>
                    <span className={`text-[10px] ${isClose ? 'text-warning' : 'text-text-tertiary'}`}>
                      {label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCard()}
            placeholder="Nueva tarjeta"
            className="flex-1 rounded-input border border-transparent bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
          <button
            onClick={addCard}
            disabled={!newName.trim() || isSaving}
            className="rounded-button bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            +
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-button border border-border-ocean py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-primary/5"
        >
          Listo
        </button>
      </div>
    </Modal>
  )
}
