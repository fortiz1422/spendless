# Gota Engineering Conventions

## Naming Conventions

### Files And Directories

- Route and component files use PascalCase for components and `page.tsx` / `route.ts` for Next.js entry points.
- Feature folders are noun-based and domain-specific:
  - `dashboard`
  - `analytics`
  - `movimientos`
  - `subscriptions`
  - `instruments`
- Utility files in `lib/` are mostly camelCase or descriptive lowercase names:
  - `yieldEngine.ts`
  - `cardPaymentPrompt.ts`
  - `query-client.ts`

There is a mix of English and Spanish naming. The dominant pattern is:

- English for technical structure and many type names
- Spanish for domain language and user-facing financial concepts

Examples:

- English: `createClient`, `DashboardShell`, `SubscriptionReviewBanner`
- Spanish/domain mix: `SaldoVivo`, `MovimientosClient`, `calcularSaldoFinal`

### Functions And Variables

Common patterns:

- `handle*` for event handlers
- `is*`, `has*`, `can*` for booleans
- `selected*`, `active*`, `current*`, `default*` for view state
- `raw*` for unprocessed payloads
- `validated` for zod-validated bodies

No branch naming convention is defined in code or repo config that was inspected.

## Repeated Code Patterns

### 1. Auth Guard In API Routes

Most API routes begin with:

- create Supabase server client
- `supabase.auth.getUser()`
- early `401 Unauthorized` return

### 2. Thin API Route + Focused Domain Logic

Route handlers often:

- parse request body
- validate with zod
- call Supabase
- apply a small amount of orchestration
- return JSON

Heavier rules are moved into `lib/` modules such as analytics, rollover, yield, and hero-engine logic.

### 3. Direct Client Fetches

Client components usually call local API routes using `fetch()` directly rather than a shared service layer. This is consistent across dashboard actions, settings, onboarding, income, transfers, subscriptions, and instruments.

### 4. Page = Server Wrapper, Feature = Client Component

A repeated screen pattern is:

- server page verifies auth and fetches initial data
- page renders a single client component with props
- client component manages UI state and further fetches/mutations

### 5. Alert-Based Error UX

A large share of user-visible error handling uses:

- `alert(...)`
- silent catch blocks that preserve previous UI state
- generic fallback strings

### 6. Local Storage For Non-Critical State

The app stores several lightweight behaviors in `localStorage`:

- hero cache
- card payment prompt dismissal/confirmation state
- onboarding nudge dismissal
- recurring-income reminder dismissal

## State Management

Primary approaches:

- React local component state via `useState`
- `useEffect` for fetches and side effects
- React Query for selected API-backed cached data
- server-rendered initial props for authenticated pages
- URL query params for month/currency/filter state

There is no global client state library such as Redux, Zustand, or MobX.

React Query is used selectively rather than universally, mainly around dashboard and analytics-adjacent data.

## Error Handling

### API Layer

Patterns in API handlers:

- auth failure returns `401`
- validation uses `zod`
- database failures generally return `500`
- console logging is used for server-side debugging

### Client Layer

Patterns in client components:

- `alert()` for failure feedback
- optimistic local removal for some deletes
- `router.refresh()` after successful mutations
- React Query invalidation for key dashboard/account data

### Notable Weaknesses

- many catches swallow details completely
- some views silently fail and keep stale data
- there is no standardized toast/notification system
- financial mutations rely heavily on refresh-based reconciliation

## Testing Approach

No repository-level automated test setup was found in application code.

Not found:

- Jest config
- Vitest config
- Playwright config
- Cypress config
- app-owned `*.test.*` or `*.spec.*` files

Current quality controls appear to rely mainly on:

- TypeScript strict mode
- ESLint
- zod validation
- typed Supabase schema
- manual runtime verification

## Formatting And Linting

- ESLint `9` with Next.js core-web-vitals and TypeScript configs
- Prettier `3`
- `prettier-plugin-tailwindcss`

## Notable Conventions And Inconsistencies

- The app mixes Spanish and English identifiers intentionally. This is workable because the Spanish names map to core product concepts, but it increases onboarding cost for non-Spanish-speaking engineers.
- Design tokens are duplicated across CSS and TypeScript with an explicit comment requiring manual synchronization.
- The repository contains signs of product migration:
  - old `monthly_income` patterns
  - new `income_entries` and period-balance patterns
- `RolloverMode` includes `manual`, but the visible settings control does not.
- Some files contain mojibake, which should be treated as a text-encoding problem.
