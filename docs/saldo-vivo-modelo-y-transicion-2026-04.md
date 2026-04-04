# Saldo Vivo: Modelo Objetivo y Transicion

## Objetivo de negocio

`Saldo Vivo` debe responder siempre una sola pregunta:

**cuanta plata real tiene el usuario en este momento**

No debe depender de rollover, de haber configurado ingresos mensuales ni de un cambio de mes.

La app necesita separar dos preguntas:

- `Saldo Vivo`: cuanto tengo ahora
- `Analytics / Movimientos`: que paso en este periodo

## Definiciones de datos

### `accounts.opening_balance_ars/usd`

Es el saldo inicial historico de una cuenta.

- Se define al crear la cuenta.
- Representa el punto de partida de la historia contable de esa cuenta en la app.
- No se recalcula mes a mes.
- Solo deberia cambiar si el usuario corrige manualmente un error historico.

### `account_period_balance`

Es un snapshot de apertura por cuenta para un periodo puntual.

- Representa con cuanto entra una cuenta a un mes.
- Puede provenir de cierre, rollover, ajuste manual o proceso backend.
- Cambia mes a mes.
- No deberia ser la fuente de verdad final de `Saldo Vivo`.

## Modelo objetivo

La fuente de verdad contable de `Saldo Vivo` debe ser:

`opening_balance por cuenta + movimientos historicos acumulados`

Esto implica:

- `accounts` + ledger historico son la fuente de verdad operativa
- `account_period_balance` queda como tabla derivada para snapshots, analytics y reporting mensual
- `rollover` deja de ser una pieza necesaria para calcular el saldo principal

## Regla funcional

### Saldo Vivo

- Debe parecerse a la suma real de bancos, billeteras y efectivo
- Si se carga un gasto atrasado, debe corregir el saldo actual
- La definicion del numero no cambia cuando cambia el mes

### Analytics y movimientos

- Mantienen contexto temporal
- Siguen usando periodos para filtros, comparativas y reportes

## Problema actual

Hoy existen usuarios cuyos numeros reales siguen dependiendo parcialmente de `account_period_balance`.

Por eso, reemplazar directamente la base por `opening_balance` puede romper los totales aunque el modelo objetivo sea correcto.

## Estrategia de transicion

Hasta completar auditoria y migracion de datos:

1. Si una cuenta tiene `account_period_balance` para el periodo consultado, usar ese snapshot como base transicional.
2. Si una cuenta no tiene snapshot para ese periodo, usar `opening_balance` como base.
3. Sobre esa base, sumar o restar movimientos posteriores al punto de partida correspondiente.

Regla practica:

- cuenta con snapshot mensual: `snapshot de apertura del periodo + movimientos del periodo`
- cuenta sin snapshot mensual: `opening_balance + movimientos historicos acumulados`

## Estado final buscado

Cuando los datos esten auditados y migrados:

- `Saldo Vivo` deberia depender solo de `opening_balance + movimientos`
- `account_period_balance` deberia generarse desde backend como snapshot mensual derivado
- esos snapshots deberian usarse para analytics, reporting y features de periodo, no como verdad contable principal

