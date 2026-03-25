# CONTEXTO.md — Gota (sesión rápida)
Última actualización: 2026-03-25

---

## 1. Stack

- **Next.js 15** (App Router) · React 19 · TypeScript strict
- **Supabase** (PostgreSQL + Auth Google OAuth + RLS)
- **Tailwind v4** — config via `@theme {}` en `globals.css`, sin `tailwind.config.ts`
- **Gemini** `gemini-2.5-flash-lite` via `@google/generative-ai` · API v1 (no v1beta) · sin `responseMimeType`
- **@tanstack/react-query** · **Zod** · **@phosphor-icons/react** (Lucide eliminado) · Vercel

---

## 2. Construido y funciona

- **SmartInput** — campo de texto libre → Gemini → ParsePreview modal → guarda al confirmar
- **ParsePreview** — review-first siempre; edición de todos los campos antes de guardar
- **Saldo Vivo** — saldo real percibido + twin pills (percibidos / tarjeta); tap → breakdown por cuenta
- **SaldoVivoSheet** — detalle por cuenta, considera cross-currency transfers
- **Rollover** — 3 modos (auto / manual / off); `CierreMesModal` para manual; `RolloverBanner` informativo
- **Multicuenta** — tipos bank/cash/digital; una primary; transfers entre cuentas; per-account balance
- **Ingresos** — `income_entries` (nuevo, preferido) + `monthly_income` (legacy, fallback)
- **Suscripciones** — auto-insert al cargar dashboard; `SubscriptionReviewBanner`; CRUD en Settings
- **Analytics Diario** — TitularHero (Hero Engine) + InsightChips + CategoriaRows
- **Analytics Análisis** — Fuga Silenciosa, Mapa de Hábitos, Compromisos
- **Hero Engine** — rule-based (no AI); ~14 threads; cache en localStorage; anti-repetición
- **Movimientos** — server-rendered; paginación 20/página; filtros por categoría/medio
- **Exportación CSV** — `GET /api/export`; UTF-8 BOM; link directo desde Analytics
- **Onboarding** — 3 pasos; guarda `onboarding_completed`; redirect si ya completó
- **PWA** — manifest + service worker + íconos 192/512/180px; probado en iPhone

---

## 3. Decisiones de diseño vigentes

**Tema:** Modo Fría (light) — NO dark mode en MVP

**Tokens principales:**
- Background: `#F0F4F8` · Surface: `#FFFFFF` · Primary: `#2178A8`
- Text primary: `#0D1829` · Text secondary: `#4A6FA5` · Border: `rgba(33,120,168,0.15)`
- Success: `#22c55e` · Error: `#ef4444`

**Tipografía:** DM Sans (400/500/600/700/800) como `--font-dm-sans`; Geist como fallback

**Glass spec (componentes frosted):**
```
background: rgba(255,255,255,0.7)
backdrop-filter: blur(20px)
border: 1px solid rgba(33,120,168,0.15)
border-radius: según componente (pill: 9999px, card: 16px)
```

**Íconos:** Phosphor Icons · weight `regular` o `duotone` · nunca Lucide

**Safe area iPhone:** `.pt-safe = calc(env(safe-area-inset-top) + 1.5rem)`

**Guardar al colapsar:** edición inline guarda on-blur/tap-fuera, no onChange

---

## 4. En progreso / próximo

- `[ID]` — _(completar con issue activo de Linear)_
- `[ID]` — _(completar con issue activo de Linear)_
- `[ID]` — _(completar con issue activo de Linear)_

---

## 5. Congelado

- **Cuotas/installments** — campos en DB y UI básica existen, pero lógica compleja: no ampliar hasta post-MVP
- **Light/dark toggle** — solo Modo Fría; no implementar switcher
- **Bank integration / OCR / offline-first** — fuera de scope indefinidamente
- **Email/password auth** — solo Google OAuth; no agregar otros providers
- **Budgets / presupuestos por categoría** — post-MVP; no prototipar aún
- **Rate limiter persistente** — el actual (in-memory) es conocidamente imperfecto; no reemplazar hasta tener Redis
- **`check_daily_expense_limit`** — función SQL definida, deliberadamente no conectada a la UI
- **Reconciliación de extractos bancarios** — no, nunca, ni en v10
