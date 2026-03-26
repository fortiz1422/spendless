'use client'

import { CaretLeft } from '@phosphor-icons/react'

interface Props {
  onClick: () => void
}

export function BackButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="-ml-1 p-1 text-text-tertiary transition-colors active:text-text-primary"
      aria-label="Volver"
    >
      <CaretLeft size={22} weight="light" />
    </button>
  )
}
