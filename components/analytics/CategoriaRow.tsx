'use client'

import {
  ShoppingCart,
  Basket,
  ChefHat,
  Motorcycle,
  Storefront,
  House,
  Couch,
  Plug,
  GasPump,
  Car,
  Bus,
  FirstAidKit,
  Pill,
  BookOpen,
  TShirt,
  HandHeart,
  ArrowsClockwise,
  Gift,
  Users,
  Tag,
  CreditCard,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { formatAmount } from '@/lib/format'
import type { CategoriaMetric } from '@/lib/analytics/computeMetrics'

const ICON_MAP: Record<string, Icon> = {
  Supermercado: ShoppingCart,
  Alimentos: Basket,
  Restaurantes: ChefHat,
  Delivery: Motorcycle,
  'Kiosco y Varios': Storefront,
  'Casa/Mantenimiento': House,
  'Muebles y Hogar': Couch,
  'Servicios del Hogar': Plug,
  'Auto/Combustible': GasPump,
  'Auto/Mantenimiento': Car,
  Transporte: Bus,
  Salud: FirstAidKit,
  Farmacia: Pill,
  Educación: BookOpen,
  'Ropa e Indumentaria': TShirt,
  'Cuidado Personal': HandHeart,
  Suscripciones: ArrowsClockwise,
  Regalos: Gift,
  'Transferencias Familiares': Users,
  Otros: Tag,
  'Pago de Tarjetas': CreditCard,
}

const TIPO_ICON_COLOR = {
  need: '#4ade80',
  want: '#fdba74',
  mixed: '#38bdf8',
} as const

const TAG_CLASS = {
  need: 'bg-success/10 text-success border border-success/20',
  want: 'bg-want/10 text-want border border-want/20',
  mixed: 'bg-primary/10 text-primary border border-primary/20',
} as const

const TAG_LABEL = {
  need: 'NECESIDAD',
  want: 'DESEO',
  mixed: 'MIXTO',
} as const

function getCategoryNote(cat: CategoriaMetric, currency: 'ARS' | 'USD'): string {
  if (cat.cantidad === 1) return 'Una vez este mes'
  if (cat.category === 'Restaurantes') return `Comiste afuera ${cat.cantidad} veces`
  if (cat.category === 'Delivery') return `Pediste ${cat.cantidad} veces`
  if (cat.category === 'Supermercado') return `${cat.cantidad} compras este mes`
  return `${cat.cantidad} transacciones · promedio ${formatAmount(cat.ticketPromedio, currency)}`
}

interface Props {
  cat: CategoriaMetric
  currency: 'ARS' | 'USD'
}

export function CategoriaRow({ cat, currency }: Props) {
  const Icon = ICON_MAP[cat.category]
  const iconColor = TIPO_ICON_COLOR[cat.tipo]

  return (
    <div className="bg-bg-secondary border border-border-ocean rounded-card px-4 py-3 mb-2 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center shrink-0">
        {Icon && <Icon weight="duotone" size={22} color={iconColor} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="type-body font-medium text-text-primary truncate">{cat.category}</p>
        <p className="type-meta text-text-tertiary">{getCategoryNote(cat, currency)}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <p className="type-amount text-text-primary">{formatAmount(cat.total, currency)}</p>
        <span className={`type-micro rounded-full px-2 py-0.5 ${TAG_CLASS[cat.tipo]}`}>
          {TAG_LABEL[cat.tipo]}
        </span>
      </div>
    </div>
  )
}
