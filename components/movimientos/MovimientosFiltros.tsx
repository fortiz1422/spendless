'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'

type TypeFilter = 'all' | 'gastos' | 'ingresos' | 'tarjeta' | 'transferencias'

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'gastos', label: 'Gastos' },
  { value: 'ingresos', label: 'Ingresos' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencias', label: 'Transferencias' },
]

interface Props {
  typeFilter: TypeFilter
  onTypeChange: (t: TypeFilter) => void
  categoryFilter: string[]
  onCategoryChange: (cats: string[]) => void
  availableCategories: string[]
}

export function MovimientosFiltros({
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  availableCategories,
}: Props) {
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [pendingCats, setPendingCats] = useState<string[]>(categoryFilter)

  const openCatModal = () => {
    setPendingCats(categoryFilter)
    setCatModalOpen(true)
  }

  const handleApply = () => {
    onCategoryChange(pendingCats)
    setCatModalOpen(false)
  }

  const handleClear = () => {
    setPendingCats([])
  }

  const togglePending = (cat: string) => {
    setPendingCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const hasCategoryFilter = categoryFilter.length > 0

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TYPE_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onTypeChange(value)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
              typeFilter === value
                ? 'bg-primary text-white'
                : 'text-text-secondary'
            }`}
            style={
              typeFilter !== value
                ? {
                    background: 'rgba(255,255,255,0.38)',
                    border: '1px solid rgba(255,255,255,0.70)',
                  }
                : undefined
            }
          >
            {label}
          </button>
        ))}

        <button
          onClick={openCatModal}
          className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
            hasCategoryFilter ? 'bg-primary/10 text-primary border border-primary/30' : 'text-text-secondary'
          }`}
          style={
            !hasCategoryFilter
              ? {
                  background: 'rgba(255,255,255,0.38)',
                  border: '1px solid rgba(255,255,255,0.70)',
                }
              : undefined
          }
        >
          Categoría
          {hasCategoryFilter && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
              {categoryFilter.length}
            </span>
          )}
        </button>
      </div>

      <Modal open={catModalOpen} onClose={() => setCatModalOpen(false)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">Categorías</h2>
            <button
              onClick={handleClear}
              className="text-[12px] font-medium text-text-tertiary hover:text-text-secondary"
            >
              Limpiar
            </button>
          </div>

          <div className="space-y-1 max-h-[50dvh] overflow-y-auto">
            {availableCategories.length === 0 ? (
              <p className="text-sm text-text-tertiary py-2">Sin categorías disponibles</p>
            ) : (
              availableCategories.map((cat) => {
                const checked = pendingCats.includes(cat)
                return (
                  <label
                    key={cat}
                    className="flex items-center gap-3 py-2.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePending(cat)}
                      className="h-4 w-4 rounded accent-primary"
                    />
                    <span className="text-sm text-text-primary">{cat}</span>
                  </label>
                )
              })
            )}
          </div>

          <button
            onClick={handleApply}
            className="w-full rounded-button bg-primary py-3 text-sm font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-95"
          >
            {pendingCats.length > 0 ? `Aplicar (${pendingCats.length})` : 'Aplicar'}
          </button>
        </div>
      </Modal>
    </>
  )
}
