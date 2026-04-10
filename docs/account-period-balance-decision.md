# Account Period Balance

**Fecha:** 2026-04-09  
**Objetivo:** dejar documentado qué hace hoy `account_period_balance`, dónde impacta, qué riesgos trae mantenerlo como híbrido, y cuál debería ser su rol final.

## 1. Qué es

`account_period_balance` es una tabla de snapshots mensuales por cuenta.

Cada fila representa la base de una cuenta para un período `YYYY-MM-01`.

Campos principales:

- `account_id`
- `period`
- `balance_ars`
- `balance_usd`
- `source`
- `updated_at`

Source operativo actual:

- `rollover_auto`

Nota:

- el schema SQL legado todavia contempla sources viejos, pero el flujo operativo actual no los usa

Definición conceptual:

- no representa un movimiento
- no representa el saldo histórico total de la cuenta
- representa una foto de apertura mensual por cuenta

## 2. Rol esperado vs rol real

## Rol esperado

La dirección de producto y arquitectura ya apunta a esto:

- `accounts.opening_balance_*` = saldo base histórico
- ledger histórico = verdad contable operativa
- `account_period_balance` = snapshot derivado mensual para reporting, rollover y comparativas

## Rol real hoy

Estado actualizado al cierre de esta iteración:

Actualmente cumple un rol híbrido:

- snapshot mensual
- soporte operativo para rollover
- lectura para reporting/tooling mensual

Conclusión:

`account_period_balance` sigue vivo, pero ya quedó bastante más cerca de snapshot derivado que al inicio de esta revisión.

## 3. Dónde se usa hoy

## Writers

### A. Alta de cuenta

Archivo: [app/api/accounts/route.ts](/C:/Users/Admin/Documents/gota/app/api/accounts/route.ts)

Estado actual:

- ya no escribe APB automáticamente
- la apertura vive en `accounts.opening_balance_*`

Impacto:

- separa el saldo histórico del snapshot mensual
- evita mezclar apertura real con estado de período

### B. Edición de cuenta

Archivo: [app/api/accounts/[id]/route.ts](/C:/Users/Admin/Documents/gota/app/api/accounts/[id]/route.ts)

Estado actual:

- ya no reescribe APB automáticamente
- corrige solo el saldo histórico en `accounts`

Impacto:

- evita que una corrección histórica contamine snapshots del mes actual

### C. Endpoint de snapshots

Archivo: [app/api/account-balances/route.ts](/C:/Users/Admin/Documents/gota/app/api/account-balances/route.ts)

Qué hace:

- permite leer snapshots por mes
- mantiene `POST` para snapshots de rollover

Impacto:

- sigue siendo una API de escritura, pero ya no como superficie manual general ni de apertura

### D. Cierre de mes / rollover

Archivo: [components/dashboard/CierreMesModal.tsx](/C:/Users/Admin/Documents/gota/components/dashboard/CierreMesModal.tsx)

Qué hace:

- al ejecutar rollover
- crea snapshots del nuevo mes
- usa `source: 'rollover_auto'`

Impacto:

- este sí es un uso coherente con la idea de snapshot mensual
- APB funciona acá como resultado del cierre, no como verdad contable principal

## Readers

### A. Dashboard principal

Archivo: [app/api/dashboard/route.ts](/C:/Users/Admin/Documents/gota/app/api/dashboard/route.ts)

Qué hace hoy:

- consulta APB del mes anterior para construir el resumen de rollover

Qué no hace ya:

- no usa APB como base del hero vivo
- el hero usa `accounts.opening_balance_*` y movimientos vivos

Impacto:

- APB ya salió del cálculo principal del dinero vivo
- ya no se usa como señal de apertura configurada en el mes actual
- sigue participando en rollover

### B. Yield engine

Archivo: [lib/yieldEngine.ts](/C:/Users/Admin/Documents/gota/lib/yieldEngine.ts)

Qué hace:

- ya no toma APB como base primaria
- usa una base transicional derivada del saldo vivo ARS por cuenta

Impacto:

- yield quedó más alineado con el modelo vivo
- APB ya no condiciona la acreditación diaria

### C. Lectura directa de snapshots

Archivo: [app/api/account-balances/route.ts](/C:/Users/Admin/Documents/gota/app/api/account-balances/route.ts)

Qué hace:

- expone snapshots de un mes dado

Impacto:

- es válido si APB se preserva para reporting o tooling
- es dudoso si la intención es sacar toda semántica manual de producto

## Lugares donde ya no manda

### A. Saldo Vivo del dashboard

Archivo: [app/api/dashboard/route.ts](/C:/Users/Admin/Documents/gota/app/api/dashboard/route.ts)

Qué pasa hoy:

- `liveSaldoInicial` se calcula desde `accounts.opening_balance_*`
- ingresos, gastos, pagos, transfers, instrumentos y yield se recomputan como modelo vivo

Conclusión:

- APB ya no es la fuente de verdad del hero

### B. Breakdown por cuenta

Archivos:

- [app/api/dashboard/account-breakdown/route.ts](/C:/Users/Admin/Documents/gota/app/api/dashboard/account-breakdown/route.ts)
- [lib/live-balance.ts](/C:/Users/Admin/Documents/gota/lib/live-balance.ts)

Qué pasa hoy:

- el breakdown arranca desde `accounts.opening_balance_*`
- luego aplica incomes, gastos, pagos, transfers, yield e instrumentos

Conclusión:

- APB ya no controla el reparto vivo por cuenta

## 4. Qué problemas trae el estado actual

### Problema 1. Doble semántica

APB funciona a la vez como:

- snapshot mensual
- semilla operativa
- dato editable

Eso vuelve ambigua cualquier corrección o bug:

- no queda claro si un número debe arreglarse en `accounts`
- o en APB
- o en el ledger

### Problema 2. Correcciones históricas mezcladas con período

Este problema quedó removido del flujo normal:

- dato histórico de origen
- snapshot temporal derivado

La separación actual es conceptualmente más limpia.

### Problema 3. Dependencia escondida en yield

Este problema también quedó removido:

- yield ya no depende de APB como saldo base
- el cálculo quedó más alineado con el modelo vivo

### Problema 4. Superficie manual abierta

Se cerró `source: 'manual'` en la API, así que este riesgo bajó fuerte. Sigue existiendo una superficie de escritura, pero mucho más acotada.

### Problema 5. Código que asume ownership incorrecto

Archivo: [app/api/account/route.ts](/C:/Users/Admin/Documents/gota/app/api/account/route.ts)

Problema:

- intenta borrar `account_period_balance` con `.eq('user_id', userId)`
- la tabla no tiene `user_id`

Esto muestra que la semántica de la tabla no está completamente cerrada en el código.

Estado:

- este bug quedó corregido

## 5. Opciones

## Opción A. Mantenerlo como está

### Pros

- cero migración inmediata
- rollover sigue funcionando como hoy
- yield sigue funcionando como hoy
- no rompe tooling existente

### Contras

- mantiene ambigüedad conceptual
- deja vivo el modelo híbrido
- complica debugging financiero
- hace más caro eliminar legacy después
- conserva una superficie manual difícil de justificar

Veredicto:

- no recomendable como estado final

## Opción B. Mantener tabla, pero como snapshot derivado puro

### Qué implica

- la tabla sigue existiendo
- solo la escriben procesos backend o cierre de mes
- deja de ser editable como superficie general
- no se usa como base de `Saldo Vivo`
- idealmente tampoco como base primaria de yield

### Pros

- preserva historial mensual por cuenta
- conserva utilidad para rollover, reporting y analytics
- aclara el modelo contable
- reduce ambigüedad sin perder funcionalidad valiosa
- encaja con la dirección ya elegida para `Saldo Vivo`

### Contras

- todavía hay que decidir si `source: 'opening'` debe seguir disponible en la API
- conviene documentar más explícitamente qué writers siguen permitidos

Veredicto:

- mejor opción

## Opción C. Borrarlo por completo

### Qué implica

- eliminar tabla
- eliminar endpoint de account balances
- eliminar rollover basado en snapshots
- rehacer comparativas y reporting mensual de otra manera

### Pros

- simplificación máxima del modelo
- menos superficie legacy
- menos riesgo de datos ambiguos

### Contras

- pierde una abstracción útil para cierre mensual
- complica reporting por período
- obliga a reemplazar varias piezas a la vez
- costo alto de migración para una ganancia que no parece necesaria

Veredicto:

- demasiado agresivo para el estado actual del producto

## 6. Propuesta recomendada

La propuesta es mantener `account_period_balance`, pero redefinirlo formalmente como:

`snapshot mensual derivado por cuenta`

Política recomendada:

- `accounts.opening_balance_*` = saldo base histórico
- ledger histórico = verdad contable operativa
- `account_period_balance` = foto mensual derivada
- no usar APB para `Saldo Vivo`
- no exponer APB como edición manual general de producto

## 7. Qué mantener

- la tabla
- el uso en rollover
- la lectura para reporting mensual o tooling
- el concepto de `source`, pero orientado a procesos internos

## 8. Qué sacar o reducir

### A. Surface manual

Reducir o eliminar:

- `POST /api/account-balances`
- `source: 'manual'` como camino normal de producto

Si se necesita mantener algo manual:

- que sea un camino interno de migración o soporte
- no una API genérica de uso normal

### B. Mirror desde accounts

Eliminar después de cerrar transición:

- write automático en alta de cuenta
- write automático en edición de cuenta

Eso debería pasar solo cuando APB deje de ser seed operativa.

### C. Dependencia de yield

Migrar yield para que no dependa de APB como base primaria.

Dirección recomendada:

- usar base derivada del modelo vivo
- o generar APB desde backend como paso derivado, nunca como input manual

## 9. Orden sugerido de migración

1. Corregir inconsistencias obvias

- fix del delete en `app/api/account/route.ts`

2. Cerrar decisión de yield

- definir si parte de balance vivo o de snapshot derivado generado internamente

3. Limpiar dashboard auxiliar

- revisar `hasConfiguredOpeningBalance`
- decidir si debe depender de `accounts.opening_balance_*` en vez de APB

4. Cerrar writers transicionales

- remover mirror desde create/edit account

5. Cerrar surface manual

- restringir o eliminar `POST /api/account-balances`

6. Documentar APB como snapshot derivado oficial

## 10. Estado implementado

Cambios ya aplicados en esta iteración:

- `app/api/account/route.ts`: delete corregido; APB se limpia por cascade al borrar `accounts`
- `app/api/dashboard/route.ts`: APB ya no se usa para detectar apertura configurada del mes actual
- `lib/yieldEngine.ts`: yield dejó de depender de APB como base primaria
- `app/api/accounts/route.ts`: alta de cuenta ya no escribe APB automático
- `app/api/accounts/[id]/route.ts`: edición de cuenta ya no reescribe APB automático
- `app/api/account-balances/route.ts`: `manual` ya no está permitido
- `components/settings/AccountBottomSheet.tsx`: settings edita `accounts.opening_balance_*`, no snapshots mensuales

## 11. Decisión concreta

Si hubiera que dejarlo en una frase:

`account_period_balance` debe sobrevivir, pero solo como snapshot mensual derivado y no como fuente operativa editable del dinero vivo.

## 12. Resumen ejecutivo

Hoy `account_period_balance`:

- ya no controla `Saldo Vivo`
- ya no controla el breakdown vivo por cuenta
- sí controla partes de rollover
- ya no controla yield
- ya no tiene write manual normal de producto

Por eso:

- mantenerlo como está es dejar deuda abierta
- borrarlo entero es innecesariamente destructivo
- la salida correcta es conservarlo, pero encerrarlo como snapshot derivado
