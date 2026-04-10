# Financial Consolidation Status And Next Step

**Fecha:** 2026-04-10  
**Objetivo:** resumir el estado actual del frente de consolidacion financiera, los updates ya aplicados, y la recomendacion concreta de implementacion siguiente para revisar externamente.

## 1. Updates ya aplicados

### Docs creados o actualizados

- [financial-logic-consolidation-audit.md](/C:/Users/Admin/Documents/gota/docs/financial-logic-consolidation-audit.md)
- [live-balance-dashboard-gap-analysis.md](/C:/Users/Admin/Documents/gota/docs/live-balance-dashboard-gap-analysis.md)
- [movement-classification-audit.md](/C:/Users/Admin/Documents/gota/docs/movement-classification-audit.md)

### Conclusiones ya cerradas en docs

- la deuda real no es solo "codigo repetido", sino reglas de negocio decididas varias veces
- `movement-classification` es una de las fuentes mas peligrosas de divergencia silenciosa
- para el hero no convenia reutilizar `buildLiveBalanceBreakdown()` directamente
- el primer paso correcto era una primitive separada para agregados globales del hero
- `gastosTarjeta` debia quedar fuera de esa primera consolidacion porque depende de clasificacion mas sensible

## 2. Codigo ya implementado

### `live-balance.ts`

En [live-balance.ts](/C:/Users/Admin/Documents/gota/lib/live-balance.ts) se agrego:

- `buildLiveBalanceHeroSummary()`

Esa primitive centraliza los subtotales vivos del hero:

- `saldoInicial`
- `ingresos`
- `gastosPercibidos`
- `pagoTarjetas`
- `rendimientos`

### `dashboard/route.ts`

En [route.ts](/C:/Users/Admin/Documents/gota/app/api/dashboard/route.ts) el hero ya usa esa primitive para:

- `saldo_inicial`
- `ingresos`
- `gastos_percibidos`
- `pago_tarjetas`
- `rendimientos`

### `movement-classification.ts`

En [movement-classification.ts](/C:/Users/Admin/Documents/gota/lib/movement-classification.ts) se agregaron:

- `isCardPayment`
- `isLegacyCardPayment`
- `isApplicableCardPayment`
- `isCreditAccruedExpense`
- `isPerceivedExpense`

Adopcion ya aplicada en:

- [rollover.ts](/C:/Users/Admin/Documents/gota/lib/rollover.ts)
- [route.ts](/C:/Users/Admin/Documents/gota/app/api/dashboard/route.ts)
- [route.ts](/C:/Users/Admin/Documents/gota/app/api/movimientos/route.ts)
- [route.ts](/C:/Users/Admin/Documents/gota/app/api/analytics-data/route.ts)

### Lo que se dejo explicitamente afuera

`gastosTarjeta` sigue aparte y no fue absorbido por `live-balance`, porque depende de una capa de clasificacion mas delicada:

- gasto con tarjeta devengado
- pago de tarjeta aplicable
- pago legacy excluido

## 3. Verificacion del bloque implementado

- `npx tsc --noEmit`: pasa
- `npx eslint lib/live-balance.ts app/api/dashboard/route.ts`: pasa

## 4. Recomendacion de implementacion siguiente

El siguiente bloque recomendado ya no es `movement-classification`, porque ese modulo ya fue extraido y adoptado en dashboard, rollover, movimientos y analytics.

El siguiente bloque real pasa a ser:

- consolidar mejor `gastosTarjeta`
- formalizar la semantica de pagos legacy aplicables a deuda pendiente
- definir una primitive mas canonica de resumen mensual
- cubrir `live-balance` y `movement-classification` con tests

## 5. Orden recomendado

### Etapa 1

Estado: implementada

Crear y consolidar:

- [movement-classification.ts](/C:/Users/Admin/Documents/gota/lib/movement-classification.ts)

### Etapa 2

Estado: implementada

Adopcion inicial aplicada en:

- [rollover.ts](/C:/Users/Admin/Documents/gota/lib/rollover.ts)
- [route.ts](/C:/Users/Admin/Documents/gota/app/api/dashboard/route.ts)

### Etapa 3

Estado: implementada

Adopcion extendida aplicada en:

- [route.ts](/C:/Users/Admin/Documents/gota/app/api/movimientos/route.ts)
- [route.ts](/C:/Users/Admin/Documents/gota/app/api/analytics-data/route.ts)

### Etapa 4

Estado: siguiente bloque

Consolidar:

- `gastosTarjeta`
- pagos legacy aplicables a deuda pendiente
- primitive mensual mas canonica
- tests sobre primitives financieras

## 6. Recomendacion concreta para review externa

La recomendacion concreta para revisar externamente ahora es:

1. tomar `movement-classification` como bloque ya consolidado
2. revisar el calculo local restante de `gastosTarjeta` en [route.ts](/C:/Users/Admin/Documents/gota/app/api/dashboard/route.ts)
3. formalizar la semantica de pagos legacy aplicables a deuda pendiente
4. definir una primitive mensual mas canonica antes de seguir bajando logica repetida
5. abrir una primera suite de tests sobre `live-balance` y `movement-classification`

## 7. Estado general

Estado actual del frente:

- consolidacion del hero: iniciada y validada
- docs madre: armados y alineados
- `movement-classification`: ya implementada y adoptada
- riesgo principal restante: `Pago de Tarjetas` + `is_legacy_card_payment` en deuda pendiente y `gastosTarjeta`

## 8. Conclusion

El frente ya no esta en etapa de diagnostico general.  
Ya paso a etapa de consolidacion incremental.

El siguiente paso correcto no es otro rediseño grande, sino cerrar la semantica mas delicada que todavia sigue local en dashboard y empezar a cubrir las primitives compartidas con tests.
