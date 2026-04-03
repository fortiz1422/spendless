# Gota Vision

## What The Product Does

Gota is a personal finance app focused on showing a user's real available money, not just a ledger of transactions. The core concept in the codebase is `Saldo Vivo`: a live view of spendable money that combines account balances, income, card spending, card payments, transfers, rollover between months, and optionally yield/investment effects.

The product is implemented as a mobile-first web app with:

- a dashboard centered on `Saldo Vivo` and `Disponible Real`
- quick expense capture through free-text parsing
- transaction history across expenses, income, transfers, and yield
- analytics about spending behavior and fixed commitments
- account, card, subscription, rollover, and currency configuration
- onboarding for first-time setup

## Problem It Solves

The code consistently targets a specific problem: users do not know how much money is actually available to spend right now once debit, cash, transfers, credit-card timing, recurring charges, and month rollover are considered together.

The implementation distinguishes sharply between:

- immediate outflows: cash, debit, transfer
- deferred outflows: credit-card spending
- card payment events: explicit `Pago de Tarjetas` expenses
- internal transfers: money moving between owned accounts
- recurring income and recurring subscriptions

This suggests the product is trying to replace a fragmented mental model with a single operational number users can trust daily.

## Target Users And Main Needs

The strongest evidence in the code points to Spanish-speaking users in Argentina:

- copy and prompts are in Rioplatense Spanish
- the parser understands Argentine money slang such as `lucas`, `palo`, `mil`, `k`
- date handling repeatedly uses `America/Buenos_Aires`
- categories and product copy are tailored to day-to-day household spending

Primary user needs reflected in the code:

- know current real spending capacity
- capture expenses quickly with minimal friction
- separate direct spending from credit-card obligations
- manage multiple money locations: bank, digital wallet, cash
- register income and recurring income
- review subscriptions and recurring fixed charges
- carry balances across months in a controlled way
- inspect behavior patterns, not just raw totals

## Core Value Proposition

The clearest product promise implemented today is:

`Gota tells you how much money is truly available now, with less manual effort than a traditional budgeting app.`

This value proposition is supported by several concrete implementation choices:

- `SmartInput` lets users type natural-language expenses instead of filling a form first.
- `Saldo Vivo` and `Disponible Real` model cashflow timing explicitly.
- credit-card purchases do not reduce the main balance until card payment is recorded.
- dashboard and movement views combine multiple financial event types into one operational picture.
- analytics add interpretation, not only bookkeeping.

## Current Product Stage And Maturity

Inferred from the codebase, Gota appears to be in an advanced MVP or early production stage rather than a fully hardened platform.

Evidence for meaningful maturity:

- complete signed-in application structure with auth, onboarding, dashboard, analytics, movements, settings, and API routes
- typed Supabase schema and multiple domain models
- polished mobile-first UI and a PWA shell with manifest and service worker
- real product logic for rollover, recurring income, subscriptions, transfers, card cycle prompts, and analytics
- feature flags for yield and instruments, which implies controlled rollout behavior

Evidence that it is still evolving:

- no project-level automated tests were found
- some legacy and new financial models coexist, especially `monthly_income` alongside `income_entries` and `account_period_balance`
- `manual` rollover exists in types and dashboard logic, but settings currently exposes only an auto/off toggle
- investment and yield functionality is substantial but hidden behind flags
- some source files contain mojibake/encoding issues in strings and comments
- at least one destructive-account flow appears incomplete: account deletion claims all user data is deleted, but the endpoint only deletes expenses, `monthly_income`, and `user_config`

Overall assessment:

The product is beyond prototype stage and already implements a coherent opinionated finance workflow, but the codebase still shows active product iteration, migration between old and new models, and missing operational hardening.
