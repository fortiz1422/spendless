# Working with Claude on SpendLess

**Última actualización:** 3 Febrero 2026  
**Propósito:** Guía para maximizar productividad con Claude AI durante desarrollo

---

## ÍNDICE

1. [Quick Context (Para Nuevas Conversaciones)](#1-quick-context-para-nuevas-conversaciones)
2. [Document Navigation](#2-document-navigation)
3. [Prompting Patterns](#3-prompting-patterns)
4. [Code Generation Best Practices](#4-code-generation-best-practices)
5. [Debugging Workflow](#5-debugging-workflow)
6. [Phase-Specific Guidance](#6-phase-specific-guidance)
7. [Common Pitfalls](#7-common-pitfalls)
8. [Context Window Management](#8-context-window-management)
9. [Document Priority Matrix](#9-document-priority-matrix)
10. [Prompt Templates](#10-prompt-templates)

---

## 1. QUICK CONTEXT (Para Nuevas Conversaciones)

### 1.1 Copy-Paste Context Starter

**Usa esto al inicio de CUALQUIER conversación nueva con Claude:**

```
I'm building SpendLess - a personal expense tracker MVP for solo use.

**Stack:**
- Next.js 15 (App Router) + React 18 + TypeScript
- Supabase (PostgreSQL + Auth)
- Gemini Flash 2.5 (AI parsing)
- Tailwind CSS

**Core Philosophy:**
- Friction = 0 (single text input: "café 2500")
- Review-first (AI parses → user validates → save)
- Simplicidad > completeness (aggressive MVP scope)

**Key Constraints:**
- $0/month cost (free tiers only)
- Solo developer
- 4-6 week timeline

**Current Phase:** [Phase X - descripción corta]

Full docs available in 8 markdown files (PRD, Context, Design System, etc).
```

---

### 1.2 30-Second Elevator Pitch

**Si Claude pregunta "what is this project?":**

> SpendLess es un expense tracker minimalista. El usuario escribe "café 2500 con amigos" en un input, Gemini AI lo parsea, el usuario valida en un modal, se guarda. El dashboard muestra análisis (Saldo Vivo, Top 3 categorías, Filtro Estoico). Scope ultra-agresivo: MVP en 4-6 semanas, $0/mes, solo yo desarrollando.

---

## 2. DOCUMENT NAVIGATION

### 2.1 What to Read When

**Por tipo de tarea:**

| Tarea                 | Documentos Críticos                 | Nice-to-Have |
| --------------------- | ----------------------------------- | ------------ |
| Entender el proyecto  | PRD + Context                       | -            |
| Crear componente UI   | Design System + Frontend Guidelines | -            |
| Implementar feature   | PRD (feature spec) + App Flows      | Context      |
| Hacer API endpoint    | Backend Structure                   | Tech Stack   |
| Setup inicial         | Tech Stack + Implementation Plan    | -            |
| Debugging             | Relevant doc section                | All docs     |
| Decisión arquitectura | Context + Frontend Guidelines       | -            |

---

### 2.2 Quick Reference by Document

**1. PRD v3.0**

- **Cuándo:** Necesitas specs de features
- **Secciones clave:**
  - Sec 5: Data Model
  - Sec 7-13: Features
  - Sec 14: Validaciones
- **Busca:** "¿Qué campos tiene expense?" → Sec 5.1

**2. Context v2.0**

- **Cuándo:** Decisiones de diseño, trade-offs
- **Secciones clave:**
  - Sec 3: Filosofía (Friction=0, Precision>Speed)
  - Sec 5: Decisiones Críticas
- **Busca:** "¿Por qué Review-first?" → Sec 5.1

**3. Design System v2.0**

- **Cuándo:** Styling, layouts, componentes visuales
- **Secciones clave:**
  - Sec 1-3: Foundation (colores, fonts, spacing)
  - Sec 4: Components
  - Sec 7: ParsePreview layout
- **Busca:** "¿Qué color es primary?" → Sec 1.1

**4. App Flows v1.0**

- **Cuándo:** Implementando flujo de usuario
- **Secciones clave:**
  - Sec 2: Quick Registration (happy path)
  - Sec 14: Error Flows
- **Busca:** "¿Qué pasa si parseo falla?" → Sec 14A

**5. Tech Stack v1.0**

- **Cuándo:** Setup, dependencies, configs
- **Secciones clave:**
  - Sec 1: Dependencies exactas
  - Sec 6-8: Configs (TS, Tailwind, Next)
- **Busca:** "¿Qué versión de React?" → Sec 1

**6. Backend Structure v1.0**

- **Cuándo:** Database, APIs, validaciones
- **Secciones clave:**
  - Sec 1: Database schema (copy-paste SQL)
  - Sec 4: API endpoints
  - Sec 6: Zod schemas
- **Busca:** "¿Cómo es el constraint de card_id?" → Sec 1.2

**7. Frontend Guidelines v1.0**

- **Cuándo:** Patterns React, arquitectura componentes
- **Secciones clave:**
  - Sec 2: Component patterns
  - Sec 3: Server vs Client
  - Sec 4: State management (React Query)
- **Busca:** "¿Cuándo usar 'use client'?" → Sec 3.1

**8. Implementation Plan v1.0**

- **Cuándo:** Planificando sprints, ordenando tareas
- **Secciones clave:**
  - Por phase actual
- **Busca:** "¿Qué hago primero en Phase 2?" → Sec 4.1

---

## 3. PROMPTING PATTERNS

### 3.1 Formula General

```
[Action] + [Component/Feature] + [Following specs] + [Context docs]

Ejemplo:
"Create SaldoVivo component following Design System section 7.1
and calculation logic from PRD section 9.1. Use React Query pattern
from Frontend Guidelines 4.2."
```

---

### 3.2 Bad vs Good Prompts

#### ❌ BAD PROMPTS

```
"Make the dashboard"
→ Too vague, no specs

"Create an expense form"
→ Missing design system, validation rules

"Fix the bug"
→ No error details, no context

"Add authentication"
→ Too broad, no architecture specified
```

#### ✅ GOOD PROMPTS

```
"Create SmartInput component following:
- Design: Design System 6.1 (input + button layout)
- Behavior: App Flows section 2 (happy path)
- State: Frontend Guidelines 4.2 (React Query mutation)
Include loading state and error handling per App Flows 14A."

"Implement POST /api/expenses endpoint:
- Validation: Backend Structure 6.1 (ExpenseSchema)
- RLS: User must be authenticated
- Rate limit: 50/day per Backend Structure 8
Return 201 with created expense or 400 with Zod errors."

"Debug ParsePreview modal not showing:
[Stack trace]
[Relevant code from ParsePreview.tsx]
[Console errors]
Expected: Modal appears after successful parse (App Flows 2.3)"
```

---

### 3.3 Include Enough Context

**Minimum context for ANY request:**

1. **What** you're building (component/endpoint name)
2. **Where** it fits (which page/flow)
3. **Spec reference** (which doc section)
4. **Any constraints** (must use X pattern, avoid Y)

**Example:**

```
Building ParsePreview modal for dashboard SmartInput flow.

Specs:
- Layout: Design System 7.2 (Vertical Stack)
- Fields: All from PRD 5.1 (expense model)
- Validation: Show red borders per Design System 4.3
- Save: POST /api/expenses per Backend Structure 4.2

Constraints:
- Must be Client Component (uses useState)
- Use React Query mutation (Frontend Guidelines 4.2)
- Modal closes on successful save
```

---

## 4. CODE GENERATION BEST PRACTICES

### 4.1 Always Specify

✅ **DO specify:**

- Component type (Server vs Client)
- State management approach (React Query, useState)
- Styling (Tailwind classes from Design System)
- File location (`components/dashboard/SmartInput.tsx`)
- Imports needed

❌ **DON'T assume:**

- Default styling (always reference Design System)
- State library (we use React Query, not Redux)
- API structure (reference Backend Structure)

---

### 4.2 Request Complete Files

**Instead of snippets, ask for complete files:**

```
❌ "Show me how to parse with Gemini"
✅ "Create lib/gemini/client.ts with parseExpense function
   following Backend Structure section 3 pattern"
```

**Why:** Snippets require manual integration. Complete files are copy-paste ready.

---

### 4.3 Ask for Type Safety

```
✅ "Include TypeScript types for all props"
✅ "Use Zod schema from Backend Structure 6.1"
✅ "Type the React Query hooks properly"
```

---

### 4.4 Request Validation

```
✅ "Include error handling per App Flows section 14"
✅ "Add loading states per Design System 5.3"
✅ "Validate with ExpenseSchema before submitting"
```

---

## 5. DEBUGGING WORKFLOW

### 5.1 Bug Report Template

**Copy this format when asking for debugging help:**

````markdown
## Bug Description

[What's happening vs what should happen]

## Current Code

```typescript
// Relevant file(s)
```
````

## Error Output

```
[Stack trace, console errors, network errors]
```

## Expected Behavior

Per [Doc Name] section [X.X]: [quote spec]

## What I've Tried

- [Attempt 1]
- [Attempt 2]

## Environment

- Phase: [X]
- Browser: [Chrome/Safari/etc]
- Device: [Desktop/Mobile]

```

---

### 5.2 Common Debug Scenarios

**Scenario: Component not rendering**

Include:
- Component code
- Parent component code
- Browser console errors
- React DevTools screenshot (if possible)

**Scenario: API returning 401**

Include:
- API route code
- Request (curl or fetch code)
- Response headers
- Supabase client setup

**Scenario: Database constraint violation**

Include:
- SQL constraint (from Backend Structure)
- Data being inserted
- Postgres error message
- RLS policies

---

### 5.3 Progressive Debugging

**Don't dump everything at once. Start with:**

1. High-level description
2. If Claude asks for more → provide specific code
3. If Claude asks for errors → provide logs

**Example dialogue:**

```

You: "ParsePreview modal not appearing after successful parse"

Claude: "Can you share the SmartInput component code?"

You: [Share SmartInput.tsx]

Claude: "I see the issue. The parsed state isn't being set.
Can you share the parse endpoint response?"

You: [Share network tab]

```

---

## 6. PHASE-SPECIFIC GUIDANCE

### Phase 0: Setup

**Context to share:**
- Tech Stack (full doc)
- Implementation Plan sections 2.1-2.2

**Common requests:**
- "Help me debug Supabase connection"
- "Types not generating correctly"
- "Tailwind not applying Design System colors"

**Tip:** Share .env.local structure (not actual values)

---

### Phase 1: Auth & Core

**Context to share:**
- Backend Structure section 6 (Auth Flow)
- App Flows section 1 (Onboarding)

**Common requests:**
- "OAuth callback not working"
- "Middleware redirecting in loop"
- "RLS blocking my queries"

**Tip:** Test auth flow manually first, then ask for fixes

---

### Phase 2: Smart Input & Parsing

**Context to share:**
- Backend Structure section 3.1 (Gemini prompts)
- App Flows section 2 (Happy path)
- Design System section 7.2 (ParsePreview)

**Common requests:**
- "Parsing accuracy low"
- "Modal not appearing"
- "How to handle edge case: [X]"

**Tip:** Collect 5-10 real parsing examples before optimizing prompt

---

### Phase 3: Dashboard Analytics

**Context to share:**
- PRD section 9-12 (Analytics components)
- Design System section 7 (Dashboard layouts)
- Frontend Guidelines section 4 (React Query)

**Common requests:**
- "Calculation incorrect for Saldo Vivo"
- "Top 3 not excluding Pago de Tarjetas"
- "How to structure dashboard query"

**Tip:** Verify calculations manually in Supabase SQL first

---

### Phase 4: Expenses & Settings

**Context to share:**
- App Flows sections 7-8 (Editing, Deleting)
- Design System section 8 (Gasto Expandido)
- Backend Structure section 4 (API endpoints)

**Common requests:**
- "Inline edit not saving"
- "Settings not persisting"
- "Period navigation broken"

**Tip:** Test each CRUD operation in isolation

---

### Phase 5: Deploy & Polish

**Context to share:**
- Implementation Plan section 7
- Tech Stack section 11 (Vercel)

**Common requests:**
- "Environment variables not working in prod"
- "Build failing on Vercel"
- "Mobile keyboard issues"

**Tip:** Test production build locally first: `npm run build && npm start`

---

## 7. COMMON PITFALLS

### 7.1 Styling Issues

❌ **Pitfall:** Asking for component without Design System

```

"Create a button component"
→ Claude uses generic Tailwind, not your colors

```

✅ **Fix:** Always reference Design System

```

"Create Button component using Design System section 4.1
(colors, spacing, states)"

```

---

### 7.2 State Management Confusion

❌ **Pitfall:** Not specifying state approach

```

"Add state to track expenses"
→ Claude might use Context, Redux, etc

```

✅ **Fix:** Specify React Query pattern

```

"Create useExpenses hook following Frontend Guidelines 4.2
(React Query pattern with optimistic updates)"

```

---

### 7.3 Missing Validation

❌ **Pitfall:** Creating forms without validation

```

"Create expense form"
→ No Zod validation, no error states

```

✅ **Fix:** Reference validation schemas

```

"Create expense form with:

- Validation: Backend Structure 6.1 (ExpenseSchema)
- Error states: Design System 4.3 (red borders)
- Submit: POST /api/expenses"

```

---

### 7.4 Server vs Client Confusion

❌ **Pitfall:** Not specifying component type

```

"Create dashboard component"
→ Claude might make it Client when Server would work

```

✅ **Fix:** Specify explicitly

```

"Create DashboardPage as Server Component (async, fetch on server).
Pass data to Client Components for interactivity per
Frontend Guidelines 3.4 (Hybrid pattern)."

```

---

### 7.5 Incomplete Error Handling

❌ **Pitfall:** Only happy path

```

"Implement parse endpoint"
→ No error handling for invalid input, API failures

```

✅ **Fix:** Request error flows

```

"Implement parse endpoint with error handling:

- Invalid input: App Flows 14A
- Rate limit: App Flows 14C
- Gemini API down: Manual form fallback"

```

---

## 8. CONTEXT WINDOW MANAGEMENT

### 8.1 Document Size Strategy

**Claude's context window is large but not infinite.**

**Priority by phase:**

**Phase 0-1 (Setup/Auth):**
- Essential: Tech Stack, Backend Structure (DB schema)
- Optional: Everything else

**Phase 2 (Smart Input):**
- Essential: Backend Structure (Gemini), Design System (ParsePreview), App Flows (flow 2)
- Optional: PRD, Context

**Phase 3 (Dashboard):**
- Essential: PRD (analytics), Design System (dashboard), Frontend Guidelines (React Query)
- Optional: Backend Structure (already implemented)

**Phase 4 (Expenses/Settings):**
- Essential: App Flows (7-13), Design System (full)
- Optional: Implementation Plan

**Phase 5 (Deploy):**
- Essential: Implementation Plan (phase 5), Tech Stack (Vercel)
- Optional: Code files

---

### 8.2 When to Start New Conversation

**Start fresh when:**
- ✅ Switching to new phase (Phase 1 → Phase 2)
- ✅ Context getting messy (>50 messages)
- ✅ Debugging has too many tangents
- ✅ Need to focus on different subsystem

**Continue same conversation when:**
- ❌ Still working on same component
- ❌ Debugging related issues
- ❌ Building related features (SmartInput → ParsePreview)

---

### 8.3 Summarizing State

**When continuing in new conversation:**

```

Previous conversation summary:

- Completed: [list what's done]
- Current issue: [specific problem]
- Relevant code: [paste key file]
- What I need: [specific request]

Context docs: [list 2-3 relevant sections]

```

---

## 9. DOCUMENT PRIORITY MATRIX

### 9.1 By Task Type

**Creating UI Component:**
1. Design System ⭐⭐⭐ (mandatory)
2. Frontend Guidelines ⭐⭐⭐ (mandatory)
3. App Flows ⭐⭐ (for behavior)
4. PRD ⭐ (for context)

**Creating API Endpoint:**
1. Backend Structure ⭐⭐⭐ (mandatory)
2. PRD ⭐⭐ (for business rules)
3. App Flows ⭐ (for error cases)

**Implementing Business Logic:**
1. PRD ⭐⭐⭐ (mandatory)
2. Backend Structure ⭐⭐ (for validation)
3. Context ⭐ (for trade-offs)

**Debugging:**
1. Relevant code ⭐⭐⭐ (mandatory)
2. Error logs ⭐⭐⭐ (mandatory)
3. Spec doc ⭐⭐ (for expected behavior)

**Architecture Decision:**
1. Context ⭐⭐⭐ (mandatory)
2. Frontend Guidelines ⭐⭐⭐ (mandatory)
3. Tech Stack ⭐⭐ (for constraints)

---

## 10. PROMPT TEMPLATES

### 10.1 Component Creation

```

Create [ComponentName] component:

**Location:** components/[folder]/[ComponentName].tsx

**Type:** [Server Component | Client Component]

**Design:**

- Layout: Design System section [X.X]
- Colors: [reference specific colors]
- States: Design System section 5 (loading, error, empty)

**Behavior:**

- Per App Flows section [X]: [describe flow]
- On [event]: [action]

**State Management:**

- [useState | React Query | URL params]
- Pattern: Frontend Guidelines section [X.X]

**Props:**

- [prop1]: [type] - [description]
- [prop2]: [type] - [description]

**Include:**

- TypeScript types
- Error handling
- Loading states
- Responsive design (mobile-first)

```

---

### 10.2 API Endpoint Creation

```

Create [METHOD] /api/[endpoint] endpoint:

**Purpose:** [What it does]

**Authentication:** [Required | Optional | Public]

**Request:**

- Body: [describe structure]
- Validation: Backend Structure section [X.X] ([SchemaName])

**Response:**

- Success: [status code] - [structure]
- Errors: [list error cases with codes]

**Business Logic:**

- Per PRD section [X.X]: [quote rule]
- [Additional rules]

**Database:**

- Tables: [list]
- RLS: [describe policy]

**Rate Limiting:** [if applicable]

**Include:**

- Error handling per Backend Structure section 7
- Proper TypeScript types
- Supabase client usage (server-side)

```

---

### 10.3 Debugging Request

```

**Issue:** [Concise description of problem]

**Expected:** Per [Doc] section [X.X]: [quote expected behavior]

**Actual:** [What's happening]

**Code:**

```typescript
// Paste relevant code
```

**Error:**

```
// Paste error message / stack trace
```

**Environment:**

- Phase: [X]
- Browser/Device: [if relevant]
- Database state: [if relevant]

**Already Tried:**

- [Attempt 1] → [Result]
- [Attempt 2] → [Result]

```

---

### 10.4 Architecture Question

```

**Context:** Building [feature/component]

**Options:**

1. [Option A] - [pros/cons]
2. [Option B] - [pros/cons]

**Constraints:**

- From Context doc: [quote relevant philosophy/constraint]
- From Tech Stack: [tech limitation]
- Timeline: [time pressure if any]

**Question:** Which approach aligns better with SpendLess
philosophy and constraints?

**Relevant docs:**

- Context section [X]
- Frontend Guidelines section [X]

```

---

### 10.5 Refactoring Request

```

**Current Code:**

```typescript
// Paste code to refactor
```

**Issues:**

- [Issue 1]
- [Issue 2]

**Goals:**

- [Goal 1]
- [Goal 2]

**Constraints:**

- Must follow Frontend Guidelines section [X.X]
- Keep compatibility with [other component]
- Don't break [specific feature]

**Improve:**

- Performance: [specific concern]
- Readability: [specific concern]
- Type safety: [specific concern]

```

---

## 11. ADVANCED WORKFLOW PATTERNS

### 11.1 Plan Mode Default

**Rule:** For ANY non-trivial task (3+ steps or architectural decisions), enter plan mode FIRST.

**How to apply:**

```

❌ BAD:
"Create the dashboard"
→ Claude starts coding immediately
→ Realizes midway it needs data structure
→ Stops, refactors
→ Wasted time

✅ GOOD:
"Plan the dashboard implementation:

1. What data do we need?
2. Which components are required?
3. What's the render order?
4. Any dependencies?

After plan, we implement step by step."

```

**When something goes wrong:**
- **STOP immediately**
- Don't keep pushing
- Re-plan with lessons learned
- Use clarification steps, not blind building

**Example for SpendLess:**

```

Task: Implement Saldo Vivo component

Step 1 - Plan:
"Let's plan Saldo Vivo before coding:

- Data needed: monthly_income, expenses (filtered by payment_method)
- Calculation: PRD section 9.1 formula
- Components: Card wrapper, 4 line items, progress bar
- State: React Query for expenses
- Edge cases: No income set, negative balance

Correct? Then we implement."

Step 2 - Verify Plan:
[Review with Claude]

Step 3 - Implement:
[Build component]

Step 4 - Verify Works:
[Test with real data]

```

**Benefits:**
- Catches issues before coding
- Reduces refactoring
- Documents decisions
- Forces you to think through edge cases

---

### 11.2 Verification Protocol

**Rule:** NEVER mark a task complete without proving it works.

**Verification checklist:**

```

Before saying "done":

1. ✅ Runs without errors
2. ✅ Matches expected behavior (per App Flows)
3. ✅ Edge cases handled (per PRD)
4. ✅ Visual matches Design System
5. ✅ Works on mobile (if applicable)
6. ✅ Database state correct (if writing data)

Ask yourself: "Would a senior engineer approve this?"

```

**Example:**

```

❌ BAD:
You: "Created ParsePreview component"
Claude: "Great! ✅"
→ Never actually tested it

✅ GOOD:
You: "Created ParsePreview component. Testing now..."
[Tests manually]
You: "Works! Verified:

- Modal appears after parse ✅
- All fields editable ✅
- Saves to DB correctly ✅
- Validation working ✅
  Screenshot: [attach]
  Now it's done."

````

**Diff behavior check:**

Before deploying any change, ask:
- "What changed between main and my branch?"
- "Are these changes minimal and intentional?"
- "Did I introduce any unintended side effects?"

**Run tests / check logs:**
```bash
# Before marking complete:
npm run build          # Does it build?
npm run type-check     # TypeScript happy?
npm run lint           # ESLint passing?

# Manual test in browser
# Check Network tab for errors
# Check Console for warnings
````

---

### 11.3 Demand Elegance (Balanced)

**Rule:** For non-trivial changes, pause and ask "Is there a more elegant way?"

**When to apply:**

✅ **DO demand elegance for:**

- Core abstractions (useExpenses hook)
- Reusable components (Button, Input)
- Business logic (Saldo Vivo calculation)
- API design (endpoint structure)

❌ **DON'T over-engineer:**

- One-off components
- Obvious fixes (typo, missing prop)
- Time-critical bugs
- MVP scope features

**Example dialogue:**

````
You: "ParsePreview has 15 props. Feels messy."

Claude: "We could group related props:
```typescript
// Before (messy)
<ParsePreview
  amount={amount}
  currency={currency}
  category={category}
  description={description}
  // ... 11 more props
/>

// After (elegant)
<ParsePreview
  data={parsedExpense}
  onSave={handleSave}
  onCancel={handleCancel}
/>
````

Cleaner API, easier to maintain."

```

**Challenge your own work:**

Before submitting code, ask Claude:
```

"Review this code. Is there a simpler way?
[paste code]

Don't over-engineer, but eliminate obvious complexity."

```

**Red flags:**
- Function >50 lines → can it be split?
- Component >200 lines → can it be composed?
- Deeply nested ternaries → extract to variable
- Copied code 3+ times → extract to function

---

### 11.4 Autonomous Problem Solving

**Rule:** When given a bug, just fix it. No hand-holding.

**How this works:**

```

❌ BAD (requires back-and-forth):
You: "Modal not showing"
Claude: "Can you share the Modal component?"
You: [shares code]
Claude: "Can you share where it's called?"
You: [shares code]
Claude: "Can you check the console?"
→ 5 messages to fix

✅ GOOD (autonomous):
You: "Modal not showing. Here's context:

- Modal.tsx code: [paste]
- Parent component: [paste]
- Console: no errors
- Expected: Should appear after parse success"

Claude: "Found it. Issue is in line 23 - missing 'open' prop.
Here's the fix:
[provides complete solution]

Test this and confirm it works."
→ 1 message to fix

```

**Point at logs, errors, failing tests:**

```

You: "Build failing in Vercel:
[paste build log]

Fix without asking for more context."

Claude: [provides fix directly]

````

**Zero context switching:**

Don't make Claude ask for:
- Error messages → include them upfront
- Relevant code → paste it
- What you tried → mention it
- Expected behavior → reference doc section

---

### 11.5 Self-Correction Loop

**Rule:** After ANY mistake, document the lesson to prevent recurrence.

**How to apply in SpendLess:**

Keep a `lessons.md` file (mental or actual):

```markdown
# SpendLess Development Lessons

## 2026-02-05: ParsePreview validation
**Mistake:** Forgot to validate card_id when payment_method=CREDIT
**Impact:** Database constraint violation
**Fix:** Added Zod refinement
**Lesson:** Always check Backend Structure constraints before creating forms
**Prevention:** Review Backend Structure section 1.2 before any form

## 2026-02-06: Saldo Vivo calculation
**Mistake:** Included "Pago de Tarjetas" in gastos_percibidos
**Impact:** Incorrect available balance
**Fix:** Added category filter
**Lesson:** "Pago de Tarjetas" is special case (PRD 11.3)
**Prevention:** Re-read PRD section 11 before implementing new calculations
````

**Review at session start:**

Before each coding session:

```
1. Open lessons.md
2. Read last 3 lessons
3. Keep them in mind while working
```

**Ruthlessly iterate:**

If mistake rate isn't dropping:

- Review lessons more frequently
- Add specific checks to workflow
- Update CLAUDE.md with new patterns

---

### 11.6 Core Workflow Principles

**Simplicity First:**

- Make every change as simple as possible
- Impact minimal code
- Avoid introducing new abstractions unless clearly needed
- Senior developer standards = simple, not clever

**Example:**

```
❌ CLEVER (but complex):
const calculations = useMemo(() =>
  pipe(
    expenses,
    filter(byCategory),
    map(toAmount),
    reduce(sum)
  ), [expenses])

✅ SIMPLE (readable):
const total = expenses
  .filter(e => e.category !== 'Pago de Tarjetas')
  .reduce((sum, e) => sum + e.amount, 0)
```

**No Laziness:**

- Find root causes, not symptoms
- No temporary fixes that "we'll fix later"
- No hardcoded values without comments
- Senior developer = thorough, not fast

**Minimal Impact:**

- Changes should only touch what's necessary
- Avoid introducing bugs in unrelated code
- Test everything you touch
- Don't break existing features

---

### 11.7 Applying These Patterns to SpendLess

**Phase 0-1 (Setup):**

- Plan Mode: Every config decision
- Verification: Each setup step works before next
- Elegance: N/A (setup is mechanical)

**Phase 2 (Smart Input):**

- Plan Mode: AI parsing strategy, modal flow
- Verification: Parse 10 test inputs, all work correctly
- Elegance: Clean separation (parse → validate → save)
- Autonomous: Fix parsing errors without back-and-forth

**Phase 3 (Dashboard):**

- Plan Mode: Data fetching strategy, calculation order
- Verification: Manually verify math matches bank statement
- Elegance: Extract calculations to pure functions
- Self-Correction: Document any calculation bugs

**Phase 4 (Expenses/Settings):**

- Plan Mode: State management for inline edit
- Verification: Test all CRUD operations
- Elegance: Reuse components, DRY
- Minimal Impact: Don't break existing dashboard

**Phase 5 (Deploy):**

- Verification: Full manual test in production
- Autonomous: Fix deployment issues immediately
- No Laziness: Fix all console warnings

---

## QUICK REFERENCE CARD

**Memorize these shortcuts:**

```
Need specs? → PRD
Need philosophy? → Context
Need visual specs? → Design System
Need user flow? → App Flows
Need setup? → Tech Stack
Need backend? → Backend Structure
Need React patterns? → Frontend Guidelines
Need execution plan? → Implementation Plan
Need to work with Claude? → CLAUDE.md (this doc)
```

---

## FINAL TIPS

### ✅ DO:

- Start conversations with Quick Context
- Reference specific doc sections
- Share complete files, not snippets
- Ask for TypeScript types
- Request error handling
- Specify Server vs Client
- Include Design System in styling requests

### ❌ DON'T:

- Ask vague questions ("make the dashboard")
- Assume Claude knows your stack defaults
- Skip validation/error handling
- Mix multiple unrelated requests
- Forget to mention which phase you're in
- Request code without design specs

---

**Remember:** Claude is most helpful when you're specific about:

1. **What** you're building
2. **Where** it fits in the system
3. **Which specs** it follows
4. **What constraints** apply

**Quality of output = Quality of input**

---

**FIN DE CLAUDE.MD**

Este documento mejora con uso. Anota patterns que funcionan y actualiza este archivo.
