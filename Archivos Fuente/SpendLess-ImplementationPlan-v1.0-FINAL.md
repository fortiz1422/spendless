# SpendLess — Implementation Plan v1.0 FINAL

**Versión:** 1.0  
**Fecha:** 3 Febrero 2026  
**Target:** MVP en 4-6 semanas  
**Desarrollador:** Solo (Facundo)

---

## ÍNDICE

1. [Overview](#1-overview)
2. [Phase 0: Setup (Week 1)](#2-phase-0-setup-week-1)
3. [Phase 1: Auth & Core (Week 2)](#3-phase-1-auth--core-week-2)
4. [Phase 2: Smart Input & ParsePreview (Week 3)](#4-phase-2-smart-input--parsepreview-week-3)
5. [Phase 3: Dashboard Analytics (Week 4)](#5-phase-3-dashboard-analytics-week-4)
6. [Phase 4: Expenses & Settings (Week 5)](#6-phase-4-expenses--settings-week-5)
7. [Phase 5: Polish & Deploy (Week 6)](#7-phase-5-polish--deploy-week-6)
8. [Testing Strategy](#8-testing-strategy)
9. [Deployment Strategy](#9-deployment-strategy)
10. [Risk Mitigation](#10-risk-mitigation)

---

## 1. OVERVIEW

### 1.1 Approach

**Philosophy:** Build → Test → Iterate

- **No perfectionism** - MVP first, refine later
- **Vertical slices** - Complete features end-to-end
- **Daily validation** - Use the app yourself cada día
- **Kill switches** - Si algo no funciona, pivotear rápido

---

### 1.2 Timeline

```
Week 1: Setup & Infrastructure
Week 2: Auth + Database + API Foundation
Week 3: Smart Input + AI Parsing (Core UX)
Week 4: Dashboard Analytics (Saldo Vivo, Filtro, Top 3)
Week 5: Expenses Page + Settings
Week 6: Polish, Testing, Deploy

Total: 4-6 semanas (flexible based on blockers)
```

---

### 1.3 Success Criteria por Phase

| Phase | Done When...                                             |
| ----- | -------------------------------------------------------- |
| 0     | Project boots locally, DB connected, types generated     |
| 1     | Can login with Google, see protected dashboard           |
| 2     | Can register expense with AI parsing → saved to DB       |
| 3     | Dashboard calculates Saldo Vivo, Top 3, Filtro correctly |
| 4     | Can view/filter/edit/delete expenses, manage settings    |
| 5     | Deployed to production, no critical bugs                 |

---

## 2. PHASE 0: SETUP (Week 1)

**Goal:** Project infrastructure + local development working

**Time estimate:** 8-12 hours

---

### 2.1 Tasks

#### 2.1.1 Initialize Project

```bash
# Create Next.js project
npx create-next-app@15.1.3 spendless \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir

cd spendless
```

**Validation:** `npm run dev` works on `localhost:3000`

---

#### 2.1.2 Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js@^2.45.4 @supabase/ssr@^0.5.2
npm install @google/generative-ai@^0.21.0
npm install zod@^3.23.8
npm install @tanstack/react-query@^5.59.20
npm install lucide-react@^0.460.0
npm install date-fns@^4.1.0

# Dev dependencies
npm install -D @tailwindcss/forms@^0.5.9
npm install -D prettier@^3.4.2
npm install -D prettier-plugin-tailwindcss@^0.6.9
```

**Validation:** No peer dependency warnings

---

#### 2.1.3 Setup Supabase Project

1. Create project at https://supabase.com
   - Project name: `spendless-prod`
   - Region: **South America (São Paulo)**
   - Database password: (save in 1Password)

2. Get credentials:
   - Project URL
   - Anon public key
   - Service role key (secret)

3. Copy to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**Validation:** Can connect from local with `createClient()`

---

#### 2.1.4 Run Database Migration

**File:** Create `schema.sql` (copy from Backend Structure doc)

**Run in Supabase SQL Editor:**

1. Go to SQL Editor
2. Paste entire schema (extensions, tables, RLS, functions)
3. Execute
4. Verify: Tables appear in Table Editor

**Validation:**

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- Should return: expenses, monthly_income, user_config
```

---

#### 2.1.5 Generate TypeScript Types

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Generate types
npx supabase gen types typescript \
  --project-id your-project-id > types/database.ts
```

**Validation:** `types/database.ts` exists with correct types

---

#### 2.1.6 Setup Gemini API

1. Go to https://aistudio.google.com/app/apikey
2. Create API key
3. Add to `.env.local`:

```bash
GEMINI_API_KEY=AIzaSy...
```

**Validation:** Test with simple call:

```typescript
// test-gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

const result = await model.generateContent('Hello')
console.log(result.response.text())
```

---

#### 2.1.7 Configure Tailwind

**File:** `tailwind.config.ts`

Copy configuration from Tech Stack document (colors, fonts, spacing).

**Validation:** Run dev server, verify dark theme loads

---

#### 2.1.8 Setup ESLint + Prettier

**File:** `.eslintrc.json` (from Frontend Guidelines)

**File:** `.prettierrc` (from Frontend Guidelines)

**Add scripts to package.json:**

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\""
  }
}
```

**Validation:** `npm run lint` passes

---

### 2.2 Checkpoint: Phase 0 Complete

**Checklist:**

- ✅ Project runs locally (`npm run dev`)
- ✅ Supabase connected (credentials in .env.local)
- ✅ Database schema deployed (3 tables + RLS)
- ✅ TypeScript types generated
- ✅ Gemini API key working
- ✅ Tailwind configured with Design System colors
- ✅ ESLint + Prettier configured

**Time check:** If >12 hours, investigate blockers before continuing.

---

## 3. PHASE 1: AUTH & CORE (Week 2)

**Goal:** User can login with Google, see empty dashboard

**Time estimate:** 12-16 hours

---

### 3.1 Tasks

#### 3.1.1 Setup Supabase Auth

**In Supabase Dashboard:**

1. Authentication → Providers → Enable Google
2. Add OAuth Redirect URL:
   - Development: `http://localhost:3000/auth/callback`
   - Production: (defer until Phase 5)

3. Get Google OAuth credentials:
   - Go to Google Cloud Console
   - Create OAuth 2.0 Client ID
   - Add to Supabase

**Validation:** OAuth flow works in Supabase dashboard

---

#### 3.1.2 Create Supabase Clients

**File:** `lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

**File:** `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Validation:** Both clients compile without errors

---

#### 3.1.3 Create Auth Routes

**File:** `app/(auth)/login/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/')

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center">
        <h1 className="text-display text-text-primary mb-2">💰 SpendLess</h1>
        <p className="text-body text-text-secondary mb-8">
          Tus gastos, sin fricción
        </p>

        <form action="/auth/login" method="post">
          <button
            type="submit"
            className="px-6 py-3 bg-white text-gray-900 rounded-button font-semibold"
          >
            Continuar con Google
          </button>
        </form>
      </div>
    </div>
  )
}
```

**File:** `app/auth/login/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return redirect('/login?error=oauth')
  }

  return redirect(data.url)
}
```

**File:** `app/auth/callback/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/', request.url))
}
```

**Validation:**

1. Go to `/login`
2. Click "Continuar con Google"
3. Authorize
4. Should redirect to `/` (dashboard)

---

#### 3.1.4 Create Middleware (Auth Protection)

**File:** `middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect away from login if authenticated
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Validation:**

1. Logout
2. Try to access `/` → redirects to `/login`
3. Login → redirects to `/`

---

#### 3.1.5 Create Empty Dashboard

**File:** `app/(dashboard)/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-md mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-text-primary">
            Febrero 2026
          </h1>
          <button className="text-text-secondary">⚙️</button>
        </header>

        <div className="bg-bg-secondary rounded-card p-4">
          <p className="text-text-secondary">Dashboard vacío</p>
          <p className="text-body-sm text-text-tertiary mt-2">
            Logged in as: {user.email}
          </p>
        </div>
      </div>
    </div>
  )
}
```

**Validation:** After login, see dashboard with your email

---

#### 3.1.6 Initialize User Config

**File:** Add trigger to Supabase (if not already done)\*\*

```sql
-- Should already exist from schema migration
-- Verify it's working:
SELECT * FROM user_config WHERE user_id = 'your-user-id';
-- Should have default cards
```

**If trigger didn't fire, manually insert:**

```sql
INSERT INTO user_config (user_id, default_currency, cards)
VALUES (
  'your-user-id',
  'ARS',
  '[
    {"id": "bbva_visa", "name": "BBVA VISA", "archived": false},
    {"id": "bbva_master", "name": "BBVA MÁSTER", "archived": false},
    {"id": "bna_master", "name": "BNA MASTER", "archived": false}
  ]'::jsonb
);
```

**Validation:** Query returns your config with 3 cards

---

### 3.2 Checkpoint: Phase 1 Complete

**Manual Test:**

1. Open `http://localhost:3000`
2. Should redirect to `/login`
3. Click "Continuar con Google"
4. Authorize Google
5. Should redirect to `/` (dashboard)
6. Dashboard shows "Logged in as: your@email.com"
7. Refresh page → still logged in (session persists)
8. Open `/login` directly → redirects to `/`

**Checklist:**

- ✅ Google OAuth working
- ✅ Session persists across refreshes
- ✅ Middleware protects routes
- ✅ user_config created automatically
- ✅ Can see empty dashboard

---

## 4. PHASE 2: SMART INPUT & PARSEPREVIEW (Week 3)

**Goal:** Can register expense with AI parsing → saves to DB

**Time estimate:** 16-20 hours (AI integration is tricky)

---

### 4.1 Tasks

#### 4.1.1 Create Gemini Client

**File:** `lib/gemini/client.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
})
```

**File:** `lib/gemini/prompts.ts`

```typescript
export function createExpensePrompt(input: string): string {
  return `
Sos un asistente que parsea gastos en español argentino.

Input del usuario: "${input}"

Debés extraer:
- amount: número (mínimo 1)
- currency: "ARS" o "USD" (default ARS)
- category: una de estas 21 categorías:
  - Supermercado, Alimentos, Restaurantes, Delivery, Kiosco y Varios
  - Casa/Mantenimiento, Muebles y Hogar, Servicios del Hogar
  - Auto/Combustible, Auto/Mantenimiento, Transporte
  - Salud, Farmacia, Educación
  - Ropa e Indumentaria, Cuidado Personal, Suscripciones
  - Regalos, Transferencias Familiares, Otros, Pago de Tarjetas
  
- description: máximo 100 caracteres (extraído del input)
- is_want: true si es deseo/impulso, false si es necesidad
- payment_method: "CASH", "DEBIT", "TRANSFER", o "CREDIT"
- card_id: null (default) o "bbva_visa", "bbva_master", "bna_master"
- date: ISO 8601 con timezone (default: hoy)

Keywords moneda:
- "dólares", "USD", "usd" → USD
- Default → ARS

Payment keywords:
- "efectivo" → CASH
- "débito" → DEBIT
- "transferencia" → TRANSFER
- "tarjeta", "crédito" → CREDIT

Date parsing (hoy es ${new Date().toISOString()}):
- "ayer" → -1 día
- "anteayer" → -2 días
- Sin mención → hoy

Si el input NO parece ser un gasto, responde:
{
  "is_valid": false,
  "reason": "El input no parece ser un gasto"
}

Si es válido, responde SOLO con JSON:
{
  "is_valid": true,
  "data": {
    "amount": 2500,
    "currency": "ARS",
    "category": "Restaurantes",
    "description": "Café con amigos",
    "is_want": true,
    "payment_method": "CASH",
    "card_id": null,
    "date": "2026-02-03T10:30:00-03:00"
  }
}
`
}
```

---

#### 4.1.2 Create Parse Endpoint

**File:** `app/api/parse-expense/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { model } from '@/lib/gemini/client'
import { createExpensePrompt } from '@/lib/gemini/prompts'
import { z } from 'zod'

const ParseResponseSchema = z.union([
  z.object({
    is_valid: z.literal(false),
    reason: z.string(),
  }),
  z.object({
    is_valid: z.literal(true),
    data: z.object({
      amount: z.number().min(1),
      currency: z.enum(['ARS', 'USD']),
      category: z.string(),
      description: z.string().max(100),
      is_want: z.boolean(),
      payment_method: z.enum(['CASH', 'DEBIT', 'TRANSFER', 'CREDIT']),
      card_id: z.string().nullable(),
      date: z.string().datetime(),
    }),
  }),
])

export async function POST(request: Request) {
  try {
    const { input } = await request.json()

    if (!input || input.trim().length === 0) {
      return NextResponse.json({
        is_valid: false,
        reason: 'Input vacío',
      })
    }

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: createExpensePrompt(input) }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    })

    const text = result.response.text()
    const parsed = JSON.parse(text)
    const validated = ParseResponseSchema.parse(parsed)

    return NextResponse.json(validated)
  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json({
      is_valid: false,
      reason: 'Error al procesar',
    })
  }
}
```

**Validation:** Test with curl:

```bash
curl -X POST http://localhost:3000/api/parse-expense \
  -H "Content-Type: application/json" \
  -d '{"input": "café 2500"}'

# Should return valid parsed expense
```

---

#### 4.1.3 Create UI Components

**File:** `components/ui/Input.tsx` (copy from Frontend Guidelines)

**File:** `components/ui/Button.tsx` (copy from Frontend Guidelines)

**File:** `components/ui/Modal.tsx`

```typescript
'use client'

import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-bg-secondary rounded-t-3xl sm:rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>,
    document.body
  )
}
```

---

#### 4.1.4 Create SmartInput Component

**File:** `components/dashboard/SmartInput.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ParsePreview } from './ParsePreview'

export function SmartInput() {
  const [input, setInput] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [parsed, setParsed] = useState<any>(null)

  const handleSubmit = async () => {
    if (!input.trim()) return

    setIsParsing(true)

    try {
      const response = await fetch('/api/parse-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })

      const data = await response.json()

      if (data.is_valid) {
        setParsed(data.data)
      } else {
        alert(data.reason)
      }
    } catch (error) {
      alert('Error al procesar el gasto')
    } finally {
      setIsParsing(false)
    }
  }

  const handleSave = () => {
    setParsed(null)
    setInput('')
  }

  return (
    <>
      <div className="flex gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="café 2500"
          disabled={isParsing}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
        />
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isParsing}
          loading={isParsing}
        >
          ▶
        </Button>
      </div>

      {parsed && (
        <ParsePreview
          data={parsed}
          onSave={handleSave}
          onCancel={() => setParsed(null)}
        />
      )}
    </>
  )
}
```

---

#### 4.1.5 Create ParsePreview Component

**File:** `components/dashboard/ParsePreview.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ParsePreview({ data, onSave, onCancel }) {
  const [formData, setFormData] = useState(data)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save')

      onSave()
    } catch (error) {
      alert('Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal open onClose={onCancel}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Confirmar gasto</h2>

        <Input
          label="Monto"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            amount: Number(e.target.value)
          }))}
        />

        {/* Add more fields: category, payment_method, etc */}

        <div className="flex gap-3 pt-4">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isSaving}
          >
            Guardar gasto
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

---

#### 4.1.6 Create Expenses API

**File:** `app/api/expenses/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // TODO: Add Zod validation

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        ...body,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Create expense error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

### 4.2 Checkpoint: Phase 2 Complete

**Manual Test:**

1. Open dashboard
2. Type "café 2500 con amigos"
3. Click "▶" or press Enter
4. Wait ~1-2 seconds
5. ParsePreview modal appears with:
   - Amount: 2500
   - Currency: ARS
   - Category: Restaurantes
   - Description: Café con amigos
   - is_want: true
6. Click "Guardar gasto"
7. Modal closes
8. Input clears

**Verify in Supabase:**

```sql
SELECT * FROM expenses WHERE user_id = 'your-user-id';
-- Should have 1 expense with correct data
```

**Checklist:**

- ✅ Gemini API parses correctly
- ✅ ParsePreview shows editable fields
- ✅ Expense saves to database
- ✅ RLS allows insert (as logged-in user)
- ✅ Input clears after save

---

## 5. PHASE 3: DASHBOARD ANALYTICS (Week 4)

**Goal:** Dashboard calculates Saldo Vivo, Top 3, Filtro

**Time estimate:** 12-16 hours

---

### 5.1 Tasks

#### 5.1.1 Create Monthly Income Setup Modal

(First time only)

#### 5.1.2 Create Saldo Vivo Component

#### 5.1.3 Create Gastos con Tarjeta Component

#### 5.1.4 Create Filtro Estoico Component

#### 5.1.5 Create Top 3 Categorías Component

#### 5.1.6 Create Últimos 5 Gastos Component

---

### 5.2 Checkpoint: Phase 3 Complete

**Manual Test:**

1. Dashboard shows all sections
2. Saldo Vivo calculates correctly
3. Can verify with bank balance
4. Top 3 shows correct categories
5. Filtro Estoico shows correct percentages

---

## 6. PHASE 4: EXPENSES & SETTINGS (Week 5)

**Goal:** Can view/filter/edit/delete expenses, manage settings

**Time estimate:** 12-16 hours

---

### 6.1 Tasks

#### 6.1.1 Create /expenses Page

#### 6.1.2 Create ExpenseItem (inline edit)

#### 6.1.3 Create Settings Modal

#### 6.1.4 Implement Period Navigation

---

### 6.2 Checkpoint: Phase 4 Complete

---

## 7. PHASE 5: POLISH & DEPLOY (Week 6)

**Goal:** Production deployment + bug fixes

**Time estimate:** 8-12 hours

---

### 7.1 Tasks

#### 7.1.1 PWA Configuration

**File:** `public/manifest.json`

#### 7.1.2 Production Environment Variables

**Vercel Dashboard:**

- Add all env vars from `.env.local`
- Mark secrets as encrypted

#### 7.1.3 Deploy to Vercel

```bash
vercel --prod
```

#### 7.1.4 Configure Custom Domain (Optional)

#### 7.1.5 Test Production

---

### 7.2 Checkpoint: Phase 5 Complete

**Production Test:**

1. Open production URL
2. Complete full flow end-to-end
3. No console errors
4. Performance acceptable (LCP <1s)

---

## 8. TESTING STRATEGY

### 8.1 Per Phase

**No automated tests in MVP** (too much overhead for solo dev)

**Manual testing per phase:**

- Happy path working
- No console errors
- Database state correct

---

### 8.2 Pre-Deploy Checklist

- [ ] Login/logout works
- [ ] Can register expense
- [ ] Dashboard calculates correctly
- [ ] Can edit/delete expense
- [ ] Settings persist
- [ ] Mobile responsive
- [ ] No console errors

---

## 9. DEPLOYMENT STRATEGY

### 9.1 Environments

**Development:**

- Local: `http://localhost:3000`
- Supabase: Development database

**Production:**

- Vercel: Auto-deploy on push to `main`
- Supabase: Production database

---

### 9.2 Rollback Plan

**If production breaks:**

1. Revert commit: `git revert HEAD`
2. Push: `git push origin main`
3. Vercel auto-deploys previous version
4. Fix locally, redeploy

---

## 10. RISK MITIGATION

### 10.1 Known Risks

| Risk                    | Probability | Impact | Mitigation                           |
| ----------------------- | ----------- | ------ | ------------------------------------ |
| Gemini API down         | Low         | High   | Show manual form fallback            |
| Supabase quota exceeded | Low         | High   | Monitor usage, upgrade if needed     |
| Parsing accuracy <80%   | Medium      | Medium | Iterate on prompts, collect examples |
| Mobile keyboard issues  | Medium      | Low    | Test on real device early            |

---

### 10.2 Blockers

**If stuck >4 hours on any task:**

1. Document blocker in notes
2. Ask for help (ChatGPT, Claude, Stack Overflow)
3. Consider workaround
4. If >8 hours → defer to post-MVP

---

## TIMELINE SUMMARY

```
Week 1: ████████░░░░░░░░░░░░  Setup (8-12h)
Week 2: ████████████░░░░░░░░  Auth & Core (12-16h)
Week 3: ████████████████████  Smart Input (16-20h)
Week 4: ████████████████░░░░  Dashboard (12-16h)
Week 5: ████████████████░░░░  Expenses & Settings (12-16h)
Week 6: ████████████░░░░░░░░  Polish & Deploy (8-12h)

Total: 68-92 hours (~4-6 weeks @ 15h/week)
```

---

**FIN DEL IMPLEMENTATION PLAN v1.0 FINAL**

Este documento es tu roadmap de ejecución paso a paso.
