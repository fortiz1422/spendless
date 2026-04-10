# Gota Architecture

## Full Tech Stack

### Application Framework

- Next.js `16.1.6`
- React `19.2.3`
- TypeScript `5`
- App Router with route groups such as `(auth)` and `(dashboard)`

### Styling And UI

- Tailwind CSS `v4` via `@import "tailwindcss"`
- `@tailwindcss/forms`
- custom design tokens defined in CSS and mirrored in TypeScript
- Google fonts through `next/font/google`: `DM Sans` and `Geist`
- icon libraries:
  - `@phosphor-icons/react`
  - `lucide-react`

### Data And Backend

- Supabase
  - browser and server clients via `@supabase/ssr`
  - admin client via `@supabase/supabase-js`
  - auth used for Google OAuth and anonymous sessions
  - database typed through `types/database.ts`
  - RPC usage for `get_dashboard_data`, `detect_duplicate_expenses`, and `check_daily_expense_limit`

### Client Data Fetching

- TanStack React Query `@tanstack/react-query`
- direct `fetch()` from client components to local API routes

### Validation And Utility Libraries

- `zod` for API validation and parser response validation
- `date-fns` is installed, though much date logic is still native/custom

### AI / External Processing

- Google Gemini via `@google/generative-ai`
- currently used for natural-language expense parsing in `/api/parse-expense`

### PWA / Offline Shell

- `public/manifest.json`
- `public/sw.js`
- service worker registration via `components/ServiceWorkerRegistrar.tsx`

## Repository Structure

### Root

- `app/`: Next.js routes, pages, layouts, and API route handlers
- `components/`: client and shared UI components grouped by feature
- `hooks/`: custom React hooks
- `lib/`: domain logic, utilities, integrations, and feature engines
- `types/`: central database/domain typings
- `public/`: static assets, icons, manifest, service worker
- `scripts/`: utility scripts
- `docs/`: internal notes, plans, and prior product context

### `app/`

Key areas:

- `app/(auth)/login`: login screen
- `app/auth/callback`: Supabase OAuth callback exchange
- `app/(dashboard)`: main signed-in shell
- `app/(dashboard)/analytics`: analytics page
- `app/(dashboard)/expenses`: expense list page
- `app/(dashboard)/movimientos`: unified movement feed
- `app/(dashboard)/instrumentos`: gated investments area
- `app/(dashboard)/settings`: settings and account management
- `app/onboarding`: first-run setup flow
- `app/api/*`: backend-for-frontend endpoints

### `components/`

Feature slices are explicit:

- `analytics/`
- `dashboard/`
- `expenses/`
- `instruments/`
- `movimientos/`
- `navigation/`
- `providers/`
- `settings/`
- `subscriptions/`
- `ui/`

### `lib/`

High-value modules:

- `supabase/`: server, browser, and admin clients
- `validation/`: zod schemas and shared category definitions
- `analytics/`: metric and summary calculations
- `heroEngine/`: rules/template engine for analytics hero copy
- `gemini/`: AI client and prompt generation
- `rollover.ts`: month rollover logic
- `yieldEngine.ts`: daily yield accumulation logic
- `query-client.ts`: React Query setup
- `cardPaymentPrompt.ts`: local prompt state and card cycle calculations

## Data Model Overview

Main entities visible in `types/database.ts`:

- `accounts`
  - user-owned money containers
  - types: `bank`, `cash`, `digital`
  - include opening balances, primary-account flag, archive flag, optional yield settings

- `cards`
  - credit cards with `closing_day`, `due_day`, optional linked account, archive flag

- `expenses`
  - core expense records
  - support currency, category, payment method, optional card/account linkage
  - installment support via `installment_group_id`, `installment_number`, `installment_total`

- `income_entries`
  - newer income model
  - stores account-linked dated inflows and optional link to recurring income

- `recurring_incomes`
  - recurring expected inflows with day-of-month logic

- `monthly_income`
  - older monthly aggregate income model
  - still used as compatibility fallback in dashboard and analytics flows

- `account_period_balance`
  - per-account monthly balance baseline
  - source operativo actual: `rollover_auto`

- `subscriptions`
  - recurring expenses with amount, currency, payment method, day-of-month, review timestamp

- `subscription_insertions`
  - month-level dedupe log for auto-created subscription expenses

- `transfers`
  - money movements between owned accounts
  - support cross-currency transfers and exchange rate

- `yield_accumulator`
  - monthly accumulated yield per account
  - includes manual override and accrual metadata

- `instruments`
  - investment-like assets
  - types: `plazo_fijo`, `fci`
  - states: `active`, `closed`

- `user_config`
  - user settings such as default currency, onboarding completion, rollover mode

### Important Model Tension

The product currently uses both:

- legacy monthly aggregates: `monthly_income`
- newer operational models: `income_entries` and `account_period_balance`

The code explicitly prioritizes the newer model when present and falls back to the older one. This indicates an in-progress domain migration.

## Key Technical Decisions And Their Rationale

### 1. BFF-style local API routes

The frontend frequently calls `/api/*` endpoints rather than performing raw Supabase mutations from UI components. This centralizes:

- auth checks
- zod validation
- orchestration logic
- compatibility logic between old and new models
- integration with Gemini

### 2. Supabase as both auth and datastore

Supabase handles:

- Google OAuth session flow
- anonymous session creation
- typed relational storage
- server RPCs for precomputed dashboard and duplicate-check logic

### 3. Hybrid computation model

The product splits logic across:

- SQL/RPC: `get_dashboard_data`, duplicate detection, expense limit checks
- TypeScript domain code: analytics, rollover logic, yield engine, hero engine

### 4. Feature flags for staged capabilities

Flags currently gate:

- `FF_YIELD`
- `FF_INSTRUMENTS`

The flagged code is substantial, so the flags are rollout controls rather than placeholders.

### 5. Mobile-first interaction model

The UI relies heavily on:

- bottom sheets and modals
- fixed tab bar
- safe-area handling
- compact single-column layout
- large tap targets

### 6. Local browser state for lightweight personalization

`localStorage` is used for:

- hero cache
- card payment prompt state
- onboarding nudge dismissal
- recurring-income reminder dismissal

## External Dependencies And Integrations

### Supabase

Used for:

- authentication
- database CRUD
- RPC calls
- admin user deletion

Required environment variables inferred from the code:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Google OAuth

Implemented through Supabase Auth with provider `google`.

### Google Gemini

Used for expense parsing.

Required environment variable:

- `GEMINI_API_KEY`

### Browser / Platform APIs

- service workers
- `localStorage`
- `visualViewport`
- `createPortal`
- cookies via Next.js server utilities

## Architecture Risks And Unclear Areas

- rollover now behaves as internal snapshot infrastructure; docs and DB constraints may still reference older visible modes.
- account deletion is not comprehensive relative to the UI copy; several user-linked tables are untouched.
- some API routes still depend on the legacy `monthly_income` table while the primary UX increasingly uses `income_entries` and account balances.
- the in-memory rate limiter for Gemini parsing is per-process only.
- no explicit automated test infrastructure is present.
