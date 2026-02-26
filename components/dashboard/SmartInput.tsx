'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { ParsePreview } from './ParsePreview'
import type { Card } from '@/types/database'

interface ParsedData {
  amount: number
  currency: 'ARS' | 'USD'
  category: string
  description: string
  is_want: boolean | null
  payment_method: 'CASH' | 'DEBIT' | 'TRANSFER' | 'CREDIT'
  card_id: string | null
  date: string
}

interface SmartInputProps {
  cards: Card[]
}

export function SmartInput({ cards }: SmartInputProps) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [parsed, setParsed] = useState<ParsedData | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    const trimmed = input.trim()
    if (!trimmed || isParsing) return

    setIsParsing(true)
    try {
      const res = await fetch('/api/parse-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmed }),
      })

      const data = await res.json()

      if (data.is_valid) {
        setParsed(data)
      } else {
        alert(data.reason ?? 'El input no parece ser un gasto')
      }
    } catch {
      alert('Error al procesar. Revisá tu conexión.')
    } finally {
      setIsParsing(false)
    }
  }

  const handleSave = () => {
    setParsed(null)
    setInput('')
    inputRef.current?.focus()
    router.refresh()
  }

  const handleCancel = () => {
    setParsed(null)
    inputRef.current?.focus()
  }

  return (
    <>
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="café 2500"
          disabled={isParsing}
          className="flex-1 rounded-input border border-[rgba(56,189,248,0.15)] bg-bg-tertiary px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-[rgba(56,189,248,0.4)] focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isParsing}
          aria-label="Agregar gasto"
          className="flex h-12 w-12 items-center justify-center rounded-input bg-primary text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isParsing ? (
            <span className="spinner" />
          ) : (
            <ArrowRight size={18} strokeWidth={2} />
          )}
        </button>
      </div>

      {parsed && (
        <ParsePreview
          data={parsed}
          cards={cards}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}
