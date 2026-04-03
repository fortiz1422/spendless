# Gota — Contexto de sesión

## 1. Stack
- Next.js 15 (App Router), TypeScript strict
- Supabase (auth, DB, RLS)
- Tailwind v4
- Gemini Flash (SmartInput NLP)
- Vercel (deploy automático desde `main`)

## 2. Construido y funciona
- **Auth**: sign-in, sign-up, anon → upgrade con `linkIdentity`
- **Onboarding**: flujo inicial de configuración de cuentas y perfil
- **SmartInput**: entrada NLP parseada por Gemini Flash ("café 2500 con amigos")
- **Multicuenta**: campo "¿De dónde sale?" — múltiples cuentas por usuario
- **Gastos / Ingresos**: CRUD completo, clasificación Necesidad/Deseo (Filtro Estoico)
- **Transferencias internas**: egreso + ingreso vinculados, neutros en Saldo Vivo
- **Cuotas + rollover**: gastos en cuotas con proyección de meses futuros
- **Saldo Vivo**: balance real = ingresos + rendimientos − gastos − compromisos de tarjeta pendientes
- **Multicurrency**: soporte ARS + USD en Saldo Vivo
- **Analytics**: pantalla de análisis con breakdown por categoría y cuenta
- **Pago de Tarjetas**: categoría especial excluida de `gastos_percibidos` en Saldo Vivo
- **Cuentas remuneradas (GOT-27)**: rendimiento diario con capitalización compuesta para BNA, MP, Ualá, etc.
  - Config por cuenta: toggle `daily_yield_enabled` + campo TNA % en `AccountBottomSheet`
  - Motor `lib/yieldEngine.ts`: fire-and-forget en `/api/dashboard`, catch-up compuesto, idempotente por `last_accrued_date`
  - Feed: fila por cuenta/mes en `Ultimos5` y `expenses/page` con label `(est.)` / confirmed; override manual via sheet
  - Saldo Vivo incluye `rendimientos` del mes automáticamente

## 3. Schema — tablas relevantes (post GOT-27)
- `accounts`: + `daily_yield_enabled boolean`, `daily_yield_rate DECIMAL(8,4)` (% TNA, soporta >100%)
- `yield_accumulator`: `(id, user_id, account_id, month CHAR(7), accumulated, is_manual_override, last_accrued_date, confirmed_at)` — UNIQUE (account_id, month)
- `DashboardData.saldo_vivo` tiene campo `rendimientos: number` sumado en el API route (no en la SQL function)
- Motor: `last_accrued_date` es el mecanismo de idempotencia — si es `=== today` se saltea
- Motor timing: el rendimiento del día N se ve en home en el load N+1 (fire-and-forget, comportamiento aceptado)
- `saldoInicioDelDia` = `account_period_balance.balance_ars` (saldo base del período, simplificado por decisión de diseño)
- Estimado diario en Config usa `account-breakdown` (saldo actual real, no solo el period balance)

## 4. Decisiones de diseño vigentes
- Tema: **Modo Fría** (light). No existe tema dark activo.
- `bgPrimary`: #F0F4F8 · `bgSecondary`: #E6ECF2
- `textPrimary`: #0D1829 · `textSecond`: #4A6070 · `textDim`: #90A4B0
- `accent`: #2178A8 · `data`: #1B7E9E
- `green`: #1A7A42 · `orange`: (alerta/warning)
- Sin cyan #38bdf8 — ese era el tema viejo (Deep Ocean).
- Wordmark: `public/gota-wordmark.png` (896×1195px, fondo #F0F4F8 incorporado)
- Fuente: sistema (no custom por ahora)
- Componentes con glass sutil sobre `bgSecondary`; sin sombras pesadas

## 5. En progreso / próximo
- **GOT-5** · P0 · SmartInput: mejorar robustez del parser NLP *(Urgent)*
- **GOT-6** · P1 · Sugerencia automática de pago de tarjeta *(High)*
- **GOT-7** · P2 · Audit: consistencia visual completa tema Light Fría *(High)*
- **GOT-8** · P3 · Analytics: insight card "Compromisos de Tarjeta" *(Medium)*

## 6. Congelado
- **Reconciliación de extractos bancarios**: no está en el roadmap. No proponer.
- **Tema dark / Deep Ocean**: descartado. Solo existe Modo Fría.
- **Presupuestos por categoría**: no implementar hasta definir UX — no es P0.
- **Exportar a CSV/Excel**: fuera de scope por ahora.
- **Notificaciones push**: sin infraestructura de notificaciones — no agregar.
- **Multi-usuario / cuenta compartida**: GOT-10 está en backlog bajo, no tocar aún.
