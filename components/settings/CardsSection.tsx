'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import type { Card } from '@/types/database'

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

  const activeCount = cards.filter((c) => !c.archived).length

  return (
    <div>
      {/* Header colapsable */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between py-1"
      >
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
          Tarjetas
          {activeCount > 0 && (
            <span className="ml-1.5 text-text-tertiary normal-case tracking-normal">
              ({activeCount})
            </span>
          )}
        </p>
        <ChevronDown
          size={14}
          className={`text-text-tertiary transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Contenido expandible */}
      {expanded && (
        <div className="mt-2 space-y-1.5">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between rounded-input bg-bg-tertiary px-3 py-2"
            >
              <span
                className={`text-sm ${card.archived ? 'text-text-disabled line-through' : 'text-text-primary'}`}
              >
                {card.name}
              </span>
              <button
                onClick={() => toggleArchive(card.id)}
                disabled={isSaving}
                className="text-[10px] text-text-tertiary hover:text-text-secondary disabled:opacity-50"
              >
                {card.archived ? 'Restaurar' : 'Archivar'}
              </button>
            </div>
          ))}
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
              className="rounded-button bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
