# Gota Features

## Currently Implemented Features

### Authentication And Access

- Google sign-in through Supabase OAuth
- anonymous sign-in / "explore without account"
- conversion path from anonymous user to permanent Google-linked account
- auth-protected dashboard routes with redirect to `/login`

### Onboarding

- onboarding nudge banner for users without completed setup
- guided onboarding flow that teaches the `Saldo Vivo` concept
- primary account creation during onboarding
- opening balance capture in ARS and USD
- first expense capture through the same smart input used in the main app
- onboarding completion stored in `user_config`

### Dashboard / Home

- main dashboard powered by `/api/dashboard`
- primary metric toggle between `Saldo Vivo` and `Disponible Real`
- month switching
- currency switching between ARS and USD
- account breakdown access through `SaldoVivoSheet`
- latest movements list mixing expenses, income, transfers, and optional yield
- recurring income reminder banner
- subscription review banner
- card payment prompt based on card closing/due cycle logic
- floating smart expense input anchored above the tab bar
- plus-button action sheet for adding income, subscription, installment purchases, transfers, and instruments when enabled

### Expense Capture And Management

- free-text expense parsing through Gemini
- parser tuned for Argentine Spanish and currency slang
- preview/confirmation step before saving parsed expenses
- structured expense creation API with zod validation
- expense categories and payment methods
- optional account linkage
- installment expansion into multiple rows on save, with exact cent reconciliation on new installment purchases
- duplicate-expense detection endpoint via Supabase RPC
- expense editing
- expense deletion
- grouped installment deletion when deleting one expense in a group
- grouped installments cannot be edited individually; they must be deleted as a group and recreated

### Income Management

- manual income entry modal
- income categories: `salary`, `freelance`, `other`
- account attribution for income
- optional recurring-income creation at entry time
- recurring-income reminder flow that can prefill the income modal
- income deletion

### Transfers

- transfer creation between owned accounts
- same-currency and cross-currency transfers
- exchange-rate support for FX-like internal transfers
- transfer deletion
- transfers included in dashboard and unified movement feed

### Accounts

- create account
- account types: bank, digital, cash
- set primary account
- edit historical opening balances in `accounts`
- archive account when deletion is blocked by linked expenses
- hard-delete account when no linked expenses exist
- per-period account-balance snapshots exposed through `/api/account-balances`

### Cards

- create card
- optional linked payment account
- closing day and due day management
- archive-on-delete fallback if linked expenses exist
- card summary calculation for payment prompts
- card-payment expense creation from prompt flow

### Subscriptions

- create, edit, delete, and deactivate subscription records
- fields for amount, category, currency, payment method, linked card/account, billing day
- automatic expense insertion for current month subscriptions from the dashboard API
- per-month deduplication through `subscription_insertions`
- stale review detection using `last_reviewed_at`
- review banner and review sheet flow

### Movements

- dedicated unified movements page
- merged feed of expenses, income entries, transfers, and yield accumulators when enabled
- type filters
- category filters
- pagination / load more
- operational summary strip with `percibidos`, `tarjeta`, and `pagoTarjeta`

### Expense History

- dedicated expenses page
- month navigation
- category filtering
- payment-method filtering
- paginated list view

### Analytics

- analytics data API
- category spend ranking
- need vs want split
- credit percentage
- expensive week and no-spend-day metrics
- drip-spend (`goteo`) logic
- weekend desire-spend analysis
- `Fuga Silenciosa`
- `Mapa de Hábitos`
- `Compromisos`
- analytics hero text generated from a local rule/template engine
- hero-chip system
- CSV export of expenses

### Rollover And Monthly Snapshots

- previous-month summary logic
- automatic per-account rollover calculation
- rollover writes monthly snapshots to `account_period_balance` with `source: 'rollover_auto'`
- projected starting balance for future months

### Yield And Instruments

These are implemented but behind feature flags.

- per-account daily yield settings
- monthly yield accumulation engine
- manual yield override
- instrument creation for `plazo_fijo` and `fci`
- active instrument list and detail views
- closing, rescuing, renewing, and editing instruments
- instrument close/renew actions can create income entries on return of funds

### Settings

- default currency switching
- account management
- card management
- sign out
- account deletion

### PWA Shell

- web app manifest
- standalone display mode
- service worker registration
- caching of static assets and navigation responses

## Features That Appear In Progress Or Partially Implemented

### Historical Cleanup Still Pending In Database

The runtime already moved away from some legacy models, but database/schema cleanup is still pending in parts of Supabase.

### Investments / Yield Rollout

Instruments and yield have real UI, API routes, and domain logic, but both are hidden behind feature flags. This suggests active development or selective rollout.

### Income Setup UX

`IncomeSetupModal.tsx` and `IncomeSection.tsx` still exist, but the current product direction is more account- and entry-centric. These look like older flows still present in the repository.

### Service Worker Scope

The PWA setup is real, but the service worker is intentionally minimal. It caches static assets and navigation responses, but it does not provide robust offline-first authenticated data workflows.

## TODOs And Obvious Gaps

No explicit engineering TODO backlog was found in the application code. The main obvious gaps come from behavioral mismatches and omissions.

### Clear Gaps

- No automated tests were found.
- Account deletion is incomplete relative to the UI promise. The endpoint deletes only `expenses`, `monthly_income`, and `user_config`.
- `user-config` GET only returns `default_currency`, even though the table also stores onboarding state and rollover mode.
- The in-memory rate limiter for Gemini parsing is not durable across processes or deployments.
- Some strings show encoding corruption.

### Product/Code Inconsistencies

- `IncomeSection.tsx` is present but not mounted in the current settings page.
- onboarding step numbering skips from `Step2` to `Step4`.
- the login/anonymous flow is polished, but the "saved on this device" claim is only partially verifiable from code because mutations still go through authenticated Supabase-backed APIs.

## Inferred Backlog

Based on implemented direction, these items are the most plausible backlog candidates.

- complete migration from `monthly_income` to `income_entries` and `account_period_balance`
- expose or remove manual rollover mode consistently
- harden account deletion and full data cleanup
- improve error states beyond `alert()` and silent catches
- add automated testing around financial calculations and API flows
- broaden investment support beyond the current gated `plazo_fijo` / `fci` implementation
- improve cross-currency handling and reporting consistency
- unify legacy and current income setup flows
- resolve text-encoding issues in source and UI copy
