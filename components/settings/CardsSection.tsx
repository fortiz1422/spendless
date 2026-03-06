'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaretDown } from '@phosphor-icons/react'
import type { Card } from '@/types/database'

function daysUntilClosing(closingDay: number): number {
  const today = new Date()
  const day = today.getDate()
  if (closingDay >= day) return closingDay - day
  const nextClosing = new Date(today.getFullYear(), today.getMonth() + 1, closingDay)
  const start = new Date(today.getFullYear(), today.getMonth(), day)
  return Math.round((nextClosing.getTime() - start.getTime()) / 86_400_000)
}

export function CardsSection({ cards: initialCards }: { cards: Card[] }) {
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [newName, setNewName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const saveCards = async (updated: Card[]) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: updated }),
      })
      if (!res.ok) throw new Error()
      setCards(updated)
      router.refresh()
    } catch {
      alert('Error al guardar tarjetas.')
    } finally {
      setIsSaving(false)
    }
  }

  const addCard = () => {
    const name = newName.trim()
    if (!name) return
    const newCard: Card = { id: crypto.randomUUID(), name, archived: false }
    setNewName('')
    saveCards([...cards, newCard])
  }

  const toggleArchive = (id: string) => {
    const updated = cards.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c))
    saveCards(updated)
  }

  const updateClosingDay = (id: string, day: number | undefined) => {
    const updated = cards.map((c) => (c.id === id ? { ...c, closing_day: day } : c))
    saveCards(updated)
  }

  const activeCount = cards.filter((c) => !c.archived).length

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between py-1"
      >
        <p className="type-label text-text-label">
          Tarjetas
          {activeCount > 0 && (
            <span className="ml-1.5 text-text-tertiary normal-case tracking-normal">
              ({activeCount})
            </span>
          )}
        </p>
        <CaretDown
          weight="duotone"
          size={14}
          className={`text-text-tertiary transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5">
          {cards.map((card) => {
            const daysLeft = card.closing_day ? daysUntilClosing(card.closing_day) : null
            const isUrgent = daysLeft !== null && daysLeft <= 5

            return (
              <div
                key={card.id}
                className="rounded-card bg-bg-tertiary border border-border-ocean"
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <span
                    className={`text-sm ${card.archived ? 'text-text-disabled line-through' : 'text-text-primary'}`}
                  >
                    {card.name}
                  </span>
                  <div className="flex items-center gap-3">
                    {!card.archived && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-text-tertiary">día</span>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          defaultValue={card.closing_day ?? ''}
                          placeholder="—"
                          onBlur={(e) => {
                            const val = e.target.value ? Number(e.target.value) : undefined
                            if (val !== card.closing_day) updateClosingDay(card.id, val)
                          }}
                          className="w-10 rounded-input bg-bg-elevated px-1 py-0.5 text-center text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => toggleArchive(card.id)}
                      disabled={isSaving}
                      className="text-[10px] text-text-tertiary hover:text-text-secondary disabled:opacity-50"
                    >
                      {card.archived ? 'Restaurar' : 'Archivar'}
                    </button>
                  </div>
                </div>

                {!card.archived && daysLeft !== null && (
                  <div className="px-3 pb-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isUrgent
                          ? 'bg-warning/10 text-warning'
                          : 'bg-bg-elevated text-text-tertiary'
                      }`}
                    >
                      {daysLeft === 0 ? 'Cierra hoy' : `Cierra en ${daysLeft}d`}
                    </span>
                  </div>
                )}
              </div>
            )
          })}

          <div className="mt-2 flex gap-2">
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
              className="rounded-button bg-primary px-3 py-2 text-sm font-semibold text-bg-primary disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
