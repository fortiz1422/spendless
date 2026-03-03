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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderRadius: 9999,
          background: 'rgba(11,18,33,0.92)',
          border: `1px solid ${input ? 'rgba(56,189,248,0.35)' : 'rgba(148,210,255,0.15)'}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '10px 10px 10px 18px',
          transition: 'border-color 200ms',
        }}
      >
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
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: '#f0f9ff',
            caretColor: '#38bdf8',
            opacity: isParsing ? 0.5 : 1,
          }}
        />
        <style>{`input::placeholder { color: #4B6472; }`}</style>
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isParsing}
          aria-label="Agregar gasto"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            flexShrink: 0,
            background: input.trim() ? '#38bdf8' : 'rgba(148,210,255,0.08)',
            border: input.trim() ? 'none' : '1px solid rgba(148,210,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 200ms, border 200ms',
            cursor: input.trim() && !isParsing ? 'pointer' : 'default',
          }}
        >
          {isParsing ? (
            <span className="spinner" style={{ width: 16, height: 16 }} />
          ) : (
            <ArrowRight size={15} style={{ color: input.trim() ? '#050A14' : '#7B98B8', transition: 'color 200ms' }} strokeWidth={2.5} />
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
