# Gota - Contexto de sesion

## 1. Stack
- Next.js 15 (App Router), TypeScript strict
- Supabase (auth, DB, RLS)
- Tailwind v4
- Gemini Flash (SmartInput NLP)
- Vercel (deploy automatico desde `main`)

## 2. Construido y funciona
- **Auth**: sign-in, sign-up, anon -> upgrade con `linkIdentity`
- **Onboarding**: flujo inicial de configuracion de cuentas y perfil
- **SmartInput**: entrada NLP parseada por Gemini Flash ("cafe 2500 con amigos")
- **Multicuenta**: campo "De donde sale?" -> multiples cuentas por usuario
- **Gastos / Ingresos**: CRUD completo, clasificacion Necesidad/Deseo (Filtro Estoico)
- **Transferencias internas**: neutras a nivel consolidado; afectan breakdown por cuenta y ajustes cross-currency
- **Cuotas + rollover**: siguen vigentes, pero no son la base principal del hero financiero
- **Saldo Vivo**: balance historico vivo = opening balance por cuenta + ingresos acumulados + rendimientos - gastos percibidos - pagos de tarjeta + ajustes cross-currency - instrumentos activos
- **Disponible Real**: `Saldo Vivo - deuda pendiente de tarjetas`
- **Multicurrency**: soporte ARS + USD en Saldo Vivo
- **Analytics**: pantalla de analisis con breakdown por categoria y cuenta
- **Pago de Tarjetas**: categoria especial excluida de `gastos_percibidos` en Saldo Vivo
- **Cuentas remuneradas (GOT-27)**: rendimiento diario con capitalizacion compuesta para BNA, MP, Uala, etc.
  - Config por cuenta: toggle `daily_yield_enabled` + campo TNA % en `AccountBottomSheet`
  - Motor `lib/yieldEngine.ts`: fire-and-forget en `/api/dashboard`, catch-up compuesto, idempotente por `last_accrued_date`
  - Feed: fila por cuenta/mes en `Ultimos5` y `expenses/page` con label `(est.)` / confirmed; override manual via sheet
  - Saldo Vivo incluye `rendimientos` del mes automaticamente

## 3. Schema - tablas relevantes (post GOT-27)
- `accounts`: + `daily_yield_enabled boolean`, `daily_yield_rate DECIMAL(8,4)` (% TNA, soporta >100%)
- `yield_accumulator`: `(id, user_id, account_id, month CHAR(7), accumulated, is_manual_override, last_accrued_date, confirmed_at)` - UNIQUE (account_id, month)
- `DashboardData.saldo_vivo` tiene campo `rendimientos: number` sumado en el API route (no en la SQL function)
- Motor: `last_accrued_date` es el mecanismo de idempotencia - si es `=== today` se saltea
- Motor timing: el rendimiento del dia N se ve en home en el load N+1 (fire-and-forget, comportamiento aceptado)
- `account_period_balance`: snapshot derivado de periodo para rollover, reporting y comparativas; no es la fuente principal del hero
- Estimado diario en Config usa `account-breakdown` (saldo actual real, no solo el period balance)

## 4. Decisiones de diseño vigentes
- Tema: **Modo Fria** (light). No existe tema dark activo.
- `bgPrimary`: #F0F4F8 · `bgSecondary`: #E6ECF2
- `textPrimary`: #0D1829 · `textSecond`: #4A6070 · `textDim`: #90A4B0
- `accent`: #2178A8 · `data`: #1B7E9E
- `green`: #1A7A42 · `orange`: (alerta/warning)
- Sin cyan #38bdf8 - ese era el tema viejo (Deep Ocean).
- Wordmark: `public/gota-wordmark.png` (896x1195px, fondo #F0F4F8 incorporado)
- Fuente: sistema (no custom por ahora)
- Componentes con glass sutil sobre `bgSecondary`; sin sombras pesadas

## 5. En progreso / proximo
- **GOT-5** · P0 · SmartInput: mejorar robustez del parser NLP *(Urgent)*
- **GOT-6** · P1 · Sugerencia automatica de pago de tarjeta *(High)*
- **GOT-7** · P2 · Audit: consistencia visual completa tema Light Fria *(High)*
- **GOT-8** · P3 · Analytics: insight card "Compromisos de Tarjeta" *(Medium)*

## 6. Congelado
- **Reconciliacion de extractos bancarios**: no esta en el roadmap. No proponer.
- **Tema dark / Deep Ocean**: descartado. Solo existe Modo Fria.
- **Presupuestos por categoria**: no implementar hasta definir UX - no es P0.
- **Exportar a CSV/Excel**: fuera de scope por ahora.
- **Notificaciones push**: sin infraestructura de notificaciones - no agregar.
- **Multi-usuario / cuenta compartida**: GOT-10 esta en backlog bajo, no tocar aun.
