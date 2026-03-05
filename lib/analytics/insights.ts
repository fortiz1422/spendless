import { formatAmount } from '@/lib/format'
import type { Metrics } from './computeMetrics'

export type InsightResult = {
  titular: string
  chips: string[]
  sentiment: 'positive' | 'alert' | 'neutral'
}

type InsightKey =
  | 'F1'
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A4'
  | 'B1'
  | 'B2'
  | 'B3'
  | 'B4'
  | 'C1'
  | 'C2'
  | 'D1'
  | 'D2'
  | 'E1'

function buildTitular(key: InsightKey, m: Metrics): string {
  const currency = m.currency
  const pctAhorro = 100 - (m.pctGastadoDelIngreso ?? 0)
  switch (key) {
    case 'F1':
      return 'Mes recién arranca. Volvé a fin de mes para ver cómo te fue.'
    case 'A1':
      return `Guardaste el ${pctAhorro}% de lo que ganaste este mes. Uno de tus mejores cierres.`
    case 'A2':
      return `Ya usaste el ${m.pctGastadoDelIngreso}% de tus ingresos y quedan ${m.diasRestantes} días. Todavía hay margen para ajustar.`
    case 'A3':
      return 'Casi todo lo que gastaste este mes tenía sentido. Mes tranquilo.'
    case 'A4':
      return 'Este mes te diste bastantes gustos. Nada malo, pero vale tenerlo en cuenta.'
    case 'B1':
      return `${m.categoryConcentration[0]?.category} se está llevando casi un cuarto de todo lo que gastás. Vale revisarlo.`
    case 'B2':
      return `${m.categoryConcentration[0]?.category} ya va por el ${m.categoryConcentration[0]?.pctDelTotal}% de tus gastos este mes.`
    case 'B3':
      return `Fuiste ${m.topCategoriaFrecuencia.cantidad} veces a ${m.topCategoriaFrecuencia.category} este mes. Ya es más un hábito que un gusto ocasional.`
    case 'B4':
      return `Cada salida a ${m.topCategoriaMonto.category} te salió en promedio ${formatAmount(m.topCategoriaMonto.ticketPromedio, currency)}. No es frecuente, pero pesa.`
    case 'C1':
      return `La primera semana te llevaste el ${m.pctSemana1DelTotal}% de todo lo que gastaste. Arrancás el mes con el pie pesado.`
    case 'C2':
      return `${m.diasSinDeseo} días seguidos sin un gasto por gusto. Tu mejor racha del mes.`
    case 'D1':
      return `El ${m.pctCredito}% de lo que gastaste todavía no lo sentiste en el bolsillo. Lo viene el mes que viene.`
    case 'D2':
      return 'Todo en efectivo o débito este mes. Lo que salió, salió en el momento.'
    case 'E1':
      return `Al ritmo que vas, el mes cierra en rojo por ${formatAmount(Math.abs(m.ahorroProyectado ?? 0), currency)}. Todavía estás a tiempo.`
  }
}

function buildChip(key: InsightKey, m: Metrics): string {
  const currency = m.currency
  const pctAhorro = 100 - (m.pctGastadoDelIngreso ?? 0)
  switch (key) {
    case 'F1':
      return ''
    case 'A1':
      return `Ahorraste el ${pctAhorro}% de tus ingresos`
    case 'A2':
      return `${m.pctGastadoDelIngreso}% usado, quedan ${m.diasRestantes} días`
    case 'A3':
      return 'Casi todo fue gasto necesario'
    case 'A4':
      return 'Bastantes gustos este mes'
    case 'B1':
      return `${m.categoryConcentration[0]?.category} se lleva ~25%`
    case 'B2':
      return `${m.categoryConcentration[0]?.category} al ${m.categoryConcentration[0]?.pctDelTotal}%`
    case 'B3':
      return `${m.topCategoriaFrecuencia.cantidad} veces a ${m.topCategoriaFrecuencia.category}`
    case 'B4':
      return `${m.topCategoriaMonto.category}: ${formatAmount(m.topCategoriaMonto.ticketPromedio, currency)} en promedio`
    case 'C1':
      return `1ª semana: ${m.pctSemana1DelTotal}% de lo gastado`
    case 'C2':
      return `${m.diasSinDeseo} días sin gastos por gusto`
    case 'D1':
      return `${m.pctCredito}% aún en diferido`
    case 'D2':
      return 'Todo en efectivo o débito'
    case 'E1':
      return 'Al ritmo actual, cierre en rojo'
  }
}

const RULE_SENTIMENT: Record<InsightKey, 'positive' | 'alert' | 'neutral'> = {
  F1: 'neutral',
  A1: 'positive',
  A2: 'alert',
  A3: 'positive',
  A4: 'neutral',
  B1: 'alert',
  B2: 'neutral',
  B3: 'neutral',
  B4: 'neutral',
  C1: 'alert',
  C2: 'positive',
  D1: 'alert',
  D2: 'positive',
  E1: 'alert',
}

function getMatchingRules(m: Metrics): InsightKey[] {
  if (m.esPrimerosDias) return ['F1']

  const rules: InsightKey[] = []
  const topConc = m.categoryConcentration[0]

  // 1. E1 — cierre en rojo (más urgente)
  if (m.hasIngreso && m.ahorroProyectado !== null && m.ahorroProyectado < 0)
    rules.push('E1')

  // 2. A2 — casi sin ingreso disponible
  if (m.hasIngreso && (m.pctGastadoDelIngreso ?? 0) >= 90) rules.push('A2')

  // 3. B1 — concentración extrema (≥25%)
  if (topConc?.pctDelTotal >= 25) rules.push('B1')

  // 4. C1 — primera semana muy pesada
  if (m.pctSemana1DelTotal > 50) rules.push('C1')

  // 5. A4 — muchos gustos
  if (m.pctDeseo > 60) rules.push('A4')

  // 6. A1 — ahorraste bien (solo desde día 15)
  if (m.hasIngreso && (m.pctGastadoDelIngreso ?? 0) <= 30 && m.dayOfMonth >= 15)
    rules.push('A1')

  // 7. B2 — concentración moderada (15–24%)
  if (topConc?.pctDelTotal >= 15 && topConc?.pctDelTotal < 25) rules.push('B2')

  // 8. B3 — frecuencia alta en want/mixed
  if (
    m.topCategoriaFrecuencia.cantidad >= 5 &&
    m.topCategoriaFrecuencia.tipo !== 'need'
  )
    rules.push('B3')

  // 9. B4 — ticket más alto del mes en want/mixed
  if (m.categorias.length > 0) {
    const highestTicket = Math.max(...m.categorias.map((c) => c.ticketPromedio))
    if (
      m.topCategoriaMonto.tipo !== 'need' &&
      m.topCategoriaMonto.ticketPromedio === highestTicket
    )
      rules.push('B4')
  }

  // 10. C2 — racha sin deseos
  if (m.diasSinDeseo >= 7) rules.push('C2')

  // 11. D1 — mucho crédito
  if (m.pctCredito > 40) rules.push('D1')

  // 12. D2 — todo efectivo/débito
  if (m.pctCredito === 0) rules.push('D2')

  // 13. A3 — mes tranquilo (también es fallback)
  if (m.pctDeseo < 20) rules.push('A3')

  if (rules.length === 0) rules.push('A3')

  return rules
}

export function evaluateInsights(metrics: Metrics): InsightResult {
  const rules = getMatchingRules(metrics)
  const [mainRule, ...restRules] = rules

  const titular = buildTitular(mainRule, metrics)
  const sentiment = RULE_SENTIMENT[mainRule]

  const chips = restRules
    .slice(0, 3)
    .map((key) => buildChip(key, metrics))
    .filter((chip) => chip.length > 0 && chip.length <= 50)

  return { titular, chips, sentiment }
}
