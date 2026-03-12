'use client'

import { Check } from '@phosphor-icons/react'

interface MonthOption {
  value: string  // YYYY-MM
  label: string  // «Marzo 2026»
}

interface Props {
  isOpen: boolean
  onClose: () => void
  selectedMonth: string
  onSelectMonth: (month: string) => void
  months: MonthOption[]
}

export function MonthSelectorSheet({
  isOpen,
  onClose,
  selectedMonth,
  onSelectMonth,
  months,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end items-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-backdrop backdrop-blur-sm"
      />

      {/* Sheet */}
      <div
        className="slide-up relative w-full max-w-[448px] bg-bg-primary rounded-t-[2rem] border-t border-border-ocean max-h-[70vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-border-strong rounded-full mx-auto mt-4 mb-2 shrink-0" />

        {/* Month list */}
        {months.map(({ value, label }) => {
          const isSelected = value === selectedMonth
          return (
            <button
              key={value}
              onClick={() => {
                onSelectMonth(value)
                onClose()
              }}
              className={`w-full flex items-center justify-between px-6 py-4 border-0 cursor-pointer text-left transition-all duration-150 active:scale-[0.98] ${
                isSelected ? 'bg-primary/10 hover:bg-primary/15' : 'bg-transparent hover:bg-primary/5'
              }`}
            >
              <span className={`text-base ${isSelected ? 'font-semibold text-primary' : 'font-normal text-text-primary'}`}>
                {label}
              </span>
              {isSelected && <Check size={16} weight="bold" className="text-primary shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
