# qwen-context.md - Gota (GotaLabs)
> Contexto de arranque para agente. Leer completo antes de tocar cualquier archivo.

---

## Que es esto

Gota es una PWA de finanzas personales para Argentina. Solo founder. El objetivo central es responder una pregunta: **cuanta plata tenes realmente disponible hoy?** El numero clave se llama `Saldo Vivo`.

---

## Stack - no usar alternativas sin aprobacion

- **Next.js 15** App Router (no Pages Router). Middleware en `proxy.ts`, no `middleware.ts`.
- **React 19**, **TypeScript strict**
- **Tailwind v4** - config via `@theme {}` en `app/globals.css`. No existe `tailwind.config.js`.
- **Supabase** - PostgreSQL 15, Google OAuth + Anonymous Auth, RLS activo en TODAS las tablas
- **TanStack React Query** - query keys: `['dashboard', month, currency]`, `['analytics', month]`
- **Zod** para validacion en todas las API routes
- **Gemini** `gemini-2.5-flash-lite` via `@google/generative-ai` - SOLO en `/api/parse-expense`
- **Phosphor Icons** (`@phosphor-icons/react`) - weight `"regular"` o `"duotone"`. Lucide fue eliminado, no usarlo.
- **DM Sans** como fuente principal (`--font-dm-sans`)
- Deploy en **Vercel**

---

## Design System - Light "Fria" (unico tema vigente)

Deep Ocean (dark) esta deprecado. No usar como referencia.

```
bgPrimary:    #F0F4F8
bgSecondary:  #E6ECF2
textPrimary:  #0D1829
textSecond:   #4A6070
textDim:      #90A4B0
accent:       #2178A8
data:         #1B7E9E
green:        #1A7A42
orange:       #B84A12
danger:       #A61E1E
```

---

## Estructura de rutas

```
app/
|-- (auth)/login/
|-- auth/callback/route.ts
|-- (dashboard)/
|   |-- layout.tsx
|   |-- page.tsx
|   |-- analytics/page.tsx
|   |-- movimientos/page.tsx
|   |-- expenses/page.tsx
|   `-- settings/page.tsx
|-- onboarding/
`-- api/
    |-- dashboard/route.ts
    |-- parse-expense/route.ts
    |-- movimientos/route.ts
    |-- analytics-data/route.ts
    |-- expenses/route.ts
    |-- income-entries/route.ts
    |-- accounts/route.ts
    |-- cards/route.ts
    |-- transfers/route.ts
    |-- subscriptions/route.ts
    `-- export/route.ts
```

**TabBar activo:** Home (`/`) · Movimientos (`/movimientos`) · Analisis (`/analytics`)

---

## Conceptos de dominio - criticos, no asumir

| Concepto | Definicion |
|---|---|
| **Saldo Vivo** | metrica historica viva derivada de opening balances por cuenta y movimientos con impacto real. NO es saldo bancario. |
| **Disponible Real** | `Saldo Vivo - deuda pendiente de tarjetas` |
| **Gasto Percibido** | `payment_method` IN ('CASH','DEBIT','TRANSFER') y `category != 'Pago de Tarjetas'` |
| **Gasto en Tarjeta** | `payment_method = 'CREDIT'` y no `Pago de Tarjetas` |
| **Pago de Tarjeta** | `category = 'Pago de Tarjetas'` - sale de caja; no es una compra con credito |
| **Pago Legacy de Tarjeta** | `Pago de Tarjetas` con `is_legacy_card_payment = true`; baja `Saldo Vivo` pero no deuda pendiente |
| **Transferencia** | movimiento entre cuentas propias; no es ingreso ni gasto de consumo |
| **Rollover** | infraestructura de snapshots mensuales. Modos: `auto`, `off`. `manual` existe en DB pero no expuesto en UI |
| **Devengado** | consumo comprometido en tarjeta, aun no debitado |
| **Percibido** | ingreso o gasto que impacta caja real |

**Regla de oro:** una compra con tarjeta != pago de tarjeta. Confundirlos rompe `Saldo Vivo` y `Disponible Real`.

---

## Modelo de datos - tablas principales

- `expenses` - gastos y pagos de tarjeta. Campos clave: `payment_method`, `category`, `card_id`, `account_id`, `installment_group_id`, `is_legacy_card_payment`
- `income_entries` - fuente operativa principal de ingresos
- `monthly_income` - sistema legacy residual, no fuente operativa principal
- `accounts` - tipos: `bank`, `cash`, `digital`. Una puede ser `is_primary`
- `account_period_balance` - snapshot derivado por periodo (`YYYY-MM-01`), no source of truth del hero
- `cards` - `closing_day`, `due_day`, `account_id`
- `subscriptions` + `subscription_insertions` - deduplicacion por mes
- `transfers` - `from_account_id`, `to_account_id`, soporte cross-currency
- `user_config` - `default_currency`, `rollover_mode`, `onboarding_completed`
- `yield_accumulator`, `instruments` - detras de `FF_YIELD` / `FF_INSTRUMENTS`

**Source of truth del tipo:** `types/database.ts`

**Prioridad de ingresos en el producto actual:** `income_entries` es la fuente operativa; `monthly_income` queda como compatibilidad residual.

---

## Patrones de codigo - seguir siempre

### API routes

```ts
const supabase = createServerClient(...)
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### Componentes

- Server Component en `page.tsx` -> delega a un solo Client Component
- Estado local con `useState`
- React Query para dashboard y analytics
- Bottom sheets para create/edit. `Modal` via `createPortal`

### Naming

- PascalCase para componentes, camelCase para utils en `lib/`
- Mezcla intencional ES/EN: ingles para estructura tecnica, español para dominio financiero

---

## Logica de negocio clave - archivos a leer antes de tocar

| Que | Archivo |
|---|---|
| Orquestacion del dashboard | `app/api/dashboard/route.ts` |
| Saldo Vivo y subtotales vivos | `lib/live-balance.ts` |
| Clasificacion de movimientos | `lib/movement-classification.ts` |
| Rollover y resumen mensual | `lib/rollover.ts` |
| Parseo NLP de gastos | `app/api/parse-expense/route.ts` + `lib/gemini/` |
| Movimientos unificados | `app/api/movimientos/route.ts` |
| Metricas de analytics | `lib/analytics/computeMetrics.ts` |
| Hero textual (rule-based) | `lib/heroEngine/` |
| Categorias (source of truth) | `lib/validation/schemas.ts` |
| Formato de moneda/fecha | `lib/format.ts` |
| Rendimiento diario | `lib/yieldEngine.ts` |

---

## Reglas del agente - no negociables

1. **NUNCA modificar RLS policies de Supabase** sin flag explicito
2. **NUNCA deployar**
3. **NUNCA asumir logica financiera** si hay duda
4. Correr `tsc --noEmit` antes de commitear
5. Leer el archivo completo antes de editarlo

---

## Deudas tecnicas conocidas - no introducir mas

- Rate limiter in-memory en `lib/rate-limit.ts`
- `check_daily_expense_limit` definido pero no integrado
- sin tests automatizados en logica financiera sensible
- sin error boundaries en dashboard

---

## Contexto de producto

- App argentina -> fechas en `America/Buenos_Aires`, moneda en ARS/USD
- Lenguaje rioplatense, copy en español
- El mes (`YYYY-MM`) es una unidad importante de analisis y reporting, pero no la base del hero principal
- La cuenta `is_primary` es fallback cuando un movimiento no trae `account_id`
- Feature flags activos: `FF_YIELD`, `FF_INSTRUMENTS`
- `proxy.ts` es el middleware de auth
