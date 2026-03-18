# CLAUDE.md — SpendLess (Gota)

**Last Updated:** March 2026
**Purpose:** Guide for AI assistants working on this codebase

---

## Project Overview

**SpendLess** (internal codename: **Gota**) is a minimalist personal expense tracker built as a PWA for Spanish-speaking users. The core UX philosophy is **Friction = 0**: the user types "café 2500 con amigos", Gemini AI parses it, the user confirms in a modal, and it's saved.

**Live stack:**
- Next.js 16.1.6 (App Router) + React 19 + TypeScript 5 (strict)
- Supabase (PostgreSQL + Auth via Google OAuth)
- Google Gemini Flash 2.5 (AI expense parsing + analytics)
- Tailwind CSS 4 with custom design tokens
- TanStack React Query 5 (client state)
- Zod 4 (runtime validation)
- PWA with service worker

---

## Repository Structure

```
/
├── app/                    # Next.js App Router
│   ├── (auth)/login/       # Login page
│   ├── (dashboard)/        # Protected pages (dashboard, expenses, analytics, settings)
│   ├── api/                # API route handlers
│   ├── auth/callback/      # Supabase OAuth callback
│   ├── onboarding/         # First-run onboarding
│   ├── layout.tsx          # Root layout (PWA, fonts)
│   └── globals.css         # Design tokens (CSS custom properties)
├── components/
│   ├── analytics/          # Analytics/insights views
│   ├── dashboard/          # Dashboard widgets (SmartInput, SaldoVivo, etc.)
│   ├── expenses/           # Expense list items
│   ├── navigation/         # TabBar bottom nav
│   ├── settings/           # Settings page components
│   ├── subscriptions/      # Subscription management
│   └── ui/                 # Reusable primitives (Modal, Toggle, CategoryIcon)
├── lib/
│   ├── analytics/          # Metric computation functions
│   ├── gemini/             # Gemini AI client + prompts
│   ├── heroEngine/         # Custom analytics insight engine
│   ├── supabase/           # Server + client Supabase instances
│   ├── validation/         # Zod schemas
│   ├── categories.ts       # Category list and helpers
│   ├── format.ts           # Currency/date formatting
│   └── rollover.ts         # Month-end rollover logic
├── types/
│   └── database.ts         # Supabase-generated TypeScript types
├── public/                 # Static assets + PWA manifest + service worker
├── Archivos Fuente/        # Extended design/product documentation (Spanish)
├── schema.sql              # Full Supabase database schema (source of truth)
└── [config files]
```

---

## Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Run production server
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format (ts, tsx, json, md)
npm run format:check # Check formatting without changes
npx tsc --noEmit     # Type-check without building
```

**No test framework is configured.** Verification is done via `tsc --noEmit` and `npm run build`.

---

## Environment Variables

Create a `.env.local` file (never commit it — it's in `.gitignore`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
NEXT_PUBLIC_GEMINI_API_KEY=[google-ai-studio-key]
```

All three are required. The `NEXT_PUBLIC_` prefix exposes them to the browser.

---

## Database

Schema is in `schema.sql`. All tables use Row-Level Security — users only see their own data.

**Key tables:**

| Table | Purpose |
|-------|---------|
| `expenses` | Individual expense records |
| `monthly_income` | Monthly income + opening balances per period |
| `accounts` | Bank/cash/digital accounts |
| `income_entries` | Individual income transactions (v1.3) |
| `account_period_balance` | Per-account balance per period |
| `user_config` | User preferences (currency, cards JSONB, rollover mode) |
| `subscriptions` | Recurring subscription definitions |
| `subscription_insertions` | Tracks which months a subscription was auto-inserted |

**Custom SQL functions:**
- `get_dashboard_data(user_id, month, currency)` — main dashboard aggregation
- `detect_duplicate_expenses(user_id, amount, category, date)` — duplicate detection
- `check_daily_expense_limit(user_id)` — rate limiting (50/day)

**TypeScript types** are in `types/database.ts`. When schema changes, regenerate with the Supabase CLI or update manually.

---

## API Routes

All routes in `app/api/` require an authenticated Supabase session. They use the server-side client from `lib/supabase/server.ts`.

**Pattern:**
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

**Endpoints:**

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/api/expenses` | List / create expenses |
| PATCH/DELETE | `/api/expenses/[id]` | Update / delete expense |
| GET | `/api/expenses/duplicates` | Duplicate detection |
| GET/POST | `/api/accounts` | List / create accounts |
| PATCH/DELETE | `/api/accounts/[id]` | Update / delete account |
| GET | `/api/account-balances` | Period balances per account |
| GET/POST | `/api/income-entries` | List / create income entries |
| PATCH/DELETE | `/api/income-entries/[id]` | Update / delete income entry |
| GET/POST/PATCH | `/api/monthly-income` | Monthly income CRUD |
| GET/POST | `/api/subscriptions` | List / create subscriptions |
| PATCH/DELETE | `/api/subscriptions/[id]` | Update / delete subscription |
| POST | `/api/parse-expense` | Gemini AI parsing |
| POST | `/api/export` | Export data |
| GET/PATCH | `/api/user-config` | User preferences |

**Error format:**
```json
{ "error": "Datos inválidos", "details": [...] }
```

---

## Auth Flow

- Google OAuth via Supabase
- Middleware in `app/proxy.ts` handles redirects (unauthenticated → `/login`, authenticated root → `/`)
- `app/auth/callback/route.ts` handles the OAuth callback and session exchange
- `user_config` row is auto-created by a Supabase trigger on first login

---

## Key Conventions

### TypeScript
- **Strict mode** is on — no `any`, no implicit nulls
- Use `@/*` path alias for all imports (e.g., `@/lib/format`)
- Types live in `types/database.ts` — use `Tables<'expenses'>`, `TablesInsert<'expenses'>` etc.

### React / Next.js
- **Server Components by default** — add `'use client'` only when you need interactivity, hooks, or browser APIs
- Data fetching in Server Components or API routes, not client-side fetch in useEffect
- React Query for client-side async state; use `invalidateQueries` for cache invalidation after mutations
- Optimistic updates pattern is used in dashboard mutations

### Styling
- **Tailwind CSS 4** — no CSS modules, no inline styles
- All colors come from CSS custom properties defined in `app/globals.css`; use semantic tokens like `text-[--text-primary]`, `bg-[--bg-secondary]`
- Design tokens: `--bg-*`, `--text-*`, `--accent-*`, `--border-*`, `--radius-*`
- Font: DM Sans (primary), Geist (fallback)
- Border radius: cards use `rounded-[var(--radius-card)]` (20px), inputs/buttons use `rounded-full`

### Formatting & Linting
- **Prettier** config: no semicolons, single quotes, 2-space indent, trailing commas (ES5), 80-char line width
- Prettier sorts Tailwind classes automatically (via `prettier-plugin-tailwindcss`)
- Run `npm run format` before committing

### Validation
- Use **Zod** schemas from `lib/validation/schemas.ts` for all API input validation
- Never trust client input — validate at API boundary

### Icons
- Primary icon library: **Phosphor Icons** (`@phosphor-icons/react`)
- Fallback: Lucide React
- Prefer Phosphor for consistency

### Language
- UI text and variable names follow **Spanish** conventions (the app is for Spanish speakers)
- Category names, labels, comments in components may be in Spanish

---

## Design System

**Theme name:** "Fría" (light mode)

**Color palette (via CSS tokens):**
- Backgrounds: `--bg-primary` (#F0F4F8), `--bg-secondary` (#E6ECF2), `--bg-tertiary` (#DCE3EA)
- Text: `--text-primary` (#0D1829), `--text-secondary` (#4A6070), `--text-tertiary` (#90A4B0)
- Accent: `--accent-primary` (#2178A8 — ocean blue)
- Success/Necessity: `--color-success` (#1A7A42 — green)
- Warning/Want: `--color-warning` (#B84A12 — orange)
- Danger: `--color-danger` (#A61E1E — red)

**Card pattern:**
```tsx
<div className="rounded-[var(--radius-card)] bg-[--bg-secondary] p-4">
```

**Key UI components:**
- `components/ui/Modal.tsx` — sheet/dialog wrapper
- `components/ui/Toggle.tsx` — toggle switch
- `components/ui/CategoryIcon.tsx` — renders category icon + color
- `components/ui/CollapsibleSection.tsx` — expandable section

---

## AI Integration (Gemini)

- Client: `lib/gemini/client.ts`
- Prompts: `lib/gemini/prompts.ts`
- Entry point: `POST /api/parse-expense`
- Flow: user types free text → API calls Gemini → returns `ParsedExpense` → user sees `ParsePreview` modal → confirms → `POST /api/expenses`
- The **HeroEngine** (`lib/heroEngine/`) generates analytics insights. It uses rules, signals, and templates to produce natural-language insight chips without calling an LLM.

---

## Month/Period Logic

- All periods are stored as `YYYY-MM-01` (normalized via SQL trigger)
- "Saldo Vivo" = monthly income − total expenses for the period
- **Rollover modes** (`user_config.rollover_mode`):
  - `auto` — leftover balance auto-carries to next month
  - `manual` — user sets opening balance manually
  - `off` — no rollover
- Month close triggers `CierreMesModal` and runs `rollover.ts` logic

---

## Extended Documentation

More detailed specs live in `Archivos Fuente/` (Spanish):

| File | Contents |
|------|---------|
| `gota-prd.md` | Full Product Requirements Document |
| `gota-context.md` | Design philosophy & architectural decisions |
| `gota-design-system.md` | Complete UI/styling specifications |
| `gota-backend-structure.md` | API & database design rationale |
| `gota-frontend-guidelines.md` | React patterns and component conventions |
| `gota-app-flows.md` | User journey flows |
| `gota-vision.md` | Project vision |
| `CLAUDE.md` | Original AI working guide (prompting patterns, context management) |

Root-level planning docs: `ANALYTICS_WORKPLAN.md`, `gota-tech-plan.md`, `schema.sql`.

---

## Common Patterns

### Adding a new API route

```typescript
// app/api/[resource]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const Schema = z.object({ /* ... */ })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.issues }, { status: 400 })
  }

  const { data, error } = await supabase.from('table').insert({ user_id: user.id, ...parsed.data }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

### Adding a new React Query hook

```typescript
// In a Client Component
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { data } = useQuery({
  queryKey: ['resource', params],
  queryFn: () => fetch('/api/resource').then(r => r.json()),
})

const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: (body) => fetch('/api/resource', { method: 'POST', body: JSON.stringify(body) }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resource'] }),
})
```

### Using design tokens in Tailwind

```tsx
// Correct — uses CSS custom properties
<div className="bg-[--bg-secondary] text-[--text-primary] rounded-[var(--radius-card)]">

// Incorrect — hard-coded colors that bypass the theme
<div className="bg-slate-100 text-slate-900">
```

---

## What NOT to Do

- **Don't add `any` types** — fix the underlying type issue instead
- **Don't use `useEffect` for data fetching** — use Server Components or React Query
- **Don't hardcode colors** — use CSS custom property tokens
- **Don't commit `.env*` files** — they're gitignored for security
- **Don't add new dependencies without a clear need** — the project intentionally minimizes dependencies
- **Don't create test files** — no test framework is set up; type-check and build instead
- **Don't push directly to `main`/`master`** — use feature branches
