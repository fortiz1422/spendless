# SpendLess — Design System v2.0 FINAL

**Versión:** 2.0 (Post-Interrogación)  
**Fecha:** 3 Febrero 2026  
**Status:** ✅ Specs visuales finales

---

## RESUMEN DE CAMBIOS v1.0 → v2.0

**Actualizaciones críticas:**

- Saldo Vivo simplificado (eliminado desglose "Comprometido")
- ParsePreview layout confirmado: Opción A (Vertical Stack)
- Gasto expandido layout: Opción A (Vertical Stack)
- Validaciones visuales especificadas (campos rojos, disabled states)
- "Pago de Tarjetas" sin toggle Need/Want
- Input modes confirmados (decimal para montos)
- Keyboard handling mobile especificado

---

## 1. FOUNDATION

### Colors

**Backgrounds:**

```css
--bg-primary: #0a0e1a; /* App background */
--bg-secondary: #111827; /* Cards, elevated */
--bg-tertiary: #1e293b; /* Inputs, interactive */
--bg-elevated: #334155; /* Hover states */
```

**Text:**

```css
--text-primary: #f1f5f9; /* Main content */
--text-secondary: #cbd5e1; /* Metadata, labels */
--text-tertiary: #94a3b8; /* Placeholders */
--text-disabled: #64748b; /* Disabled state */
```

**Borders:**

```css
--border-subtle: #1e293b; /* Card dividers */
--border-strong: #334155; /* Inputs, focused */
```

**Accent Colors:**

```css
--primary: #6366f1; /* Primary CTA, links */
--success: #22c55e; /* Necesidad, positive */
--warning: #f59e0b; /* Warnings */
--danger: #ef4444; /* Errors, delete */

/* Contextual */
--necessity: #22c55e; /* Filtro Estoico */
--want: #fb923c; /* Filtro Estoico */
```

### Typography

**Font Stack:**

```css
font-family:
  -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto,
  sans-serif;
```

**Type Scale:**

```css
--text-display: 32px / 700; /* Page titles */
--text-amount-xl: 28px / 700; /* Saldo Vivo */
--text-amount-lg: 20px / 700; /* Top 3 amounts */
--text-amount-md: 16px / 600; /* List amounts */
--text-body: 14px / 400; /* Body text */
--text-body-sm: 12px / 400; /* Metadata */
--text-caption: 10px / 500; /* Labels UPPERCASE */
```

### Spacing

**8px system:**

```css
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

### Border Radius

```css
--radius-card: 16px;
--radius-card-lg: 18px;
--radius-input: 12px;
--radius-button: 12px;
```

---

## 2. COMPONENTS

### Buttons

#### Primary CTA

```css
background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
color: white;
padding: 12px 24px;
border-radius: 12px;
font-size: 14px;
font-weight: 600;
box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

/* Hover */
transform: scale(1.02);
box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);

/* Active */
transform: scale(0.98);
```

**Uso:**

- "Guardar gasto" en ParsePreview
- "Agregar" en Smart Input
- Confirmaciones críticas

#### Secondary

```css
background: var(--bg-secondary);
color: var(--text-primary);
border: 1px solid var(--border-strong);
padding: 12px 24px;
border-radius: 12px;

/* Hover */
background: var(--bg-tertiary);
```

**Uso:**

- "Ver todos" en dashboard
- "Gestionar" en Settings

#### Ghost

```css
background: transparent;
color: var(--text-secondary);
padding: 12px 24px;

/* Hover */
color: var(--text-primary);
background: rgba(255, 255, 255, 0.05);
```

**Uso:**

- "Cancelar" en modals
- Links secundarios

#### Disabled State

```css
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;
```

**Uso crítico:**

- ParsePreview cuando field required vacío
- Input cuando offline

---

### Cards

#### Standard Card

```css
background: var(--bg-secondary);
border: 1px solid var(--border-subtle);
border-radius: 16px;
padding: 16px;
```

**Uso:**

- Top 3 Categorías
- Filtro Estoico
- Últimos 5 Gastos

#### Elevated Card (Hero)

```css
background: var(--bg-secondary);
border: 2px solid var(--border-strong);
border-radius: 18px;
padding: 20px;
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
```

**Uso:**

- Saldo Vivo (hero component)

#### Accent Border Card

```css
border-left: 3px solid var(--primary);
/* O success/danger según contexto */
```

**Uso:**

- Estados especiales
- Warnings

---

### Inputs

#### Text Input

```css
background: var(--bg-tertiary);
border: 1px solid transparent;
border-radius: 12px;
padding: 12px 16px;
color: var(--text-primary);
font-size: 14px;

/* Focus */
border-color: var(--primary);
box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

**InputMode confirmado:**

```html
<!-- Smart Input -->
<input inputmode="text" />

<!-- Monto en ParsePreview -->
<input inputmode="decimal" pattern="[0-9]*" />

<!-- Descripción (si fuera editable) -->
<input inputmode="text" maxlength="100" />
```

#### Error State

```css
border-color: var(--danger);
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
```

**Mensaje de error:**

```css
color: var(--danger);
font-size: 11px;
margin-top: 4px;
```

**Ejemplo:**

```html
<input class="error" />
<span class="error-message"> Seleccioná una tarjeta </span>
```

#### Required Field (Vacío)

```css
border-color: var(--danger);
background: rgba(239, 68, 68, 0.05);
```

**Con label:**

```css
label::after {
  content: ' *';
  color: var(--danger);
}
```

---

### Dropdowns/Selects

```css
background: var(--bg-tertiary);
border: 1px solid transparent;
border-radius: 12px;
padding: 12px 40px 12px 16px;
appearance: none;
background-image: url('data:image/svg+xml,...'); /* Chevron */

/* Focus */
border-color: var(--primary);
```

**Opciones:**

```css
option {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
```

---

### Toggles

#### Binary Toggle (Need/Want)

```css
display: flex;
gap: 8px;
background: var(--bg-tertiary);
border-radius: 12px;
padding: 4px;

/* Option */
button {
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
}

/* Active */
button.active {
  background: var(--success); /* Necesidad */
  /* O var(--want) para Deseo */
  color: white;
}
```

**Layout en ParsePreview:**

```
¿NECESIDAD O DESEO?
[✓ Necesidad] [  Deseo]
     green      transparent
```

---

### Badges

```css
display: inline-flex;
padding: 3px 8px;
border-radius: 6px;
font-size: 10px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.5px;
```

**Variantes:**

```css
/* Success (Verificado) */
background: rgba(34, 197, 94, 0.2);
color: var(--success);

/* Warning (Posible duplicado) */
background: rgba(245, 158, 11, 0.2);
color: var(--warning);

/* Info (USD) */
background: rgba(99, 102, 241, 0.2);
color: var(--primary);
```

---

## 3. LAYOUT SPECS

### Header

```
┌──────────────────────────────────────┐
│ ←  Febrero 2026  →         [⚙]      │
│    ↑               ↑          ↑      │
│   prev         title        next     │
└──────────────────────────────────────┘

Height: 56px
Background: var(--bg-primary)
Border-bottom: 1px solid var(--border-subtle)
Padding: 16px
```

**Arrow buttons:**

```css
width: 40px;
height: 40px;
border-radius: 8px;
background: transparent;

/* Hover */
background: var(--bg-tertiary);

/* Disabled */
opacity: 0.3;
cursor: not-allowed;
```

**Title (tap for picker):**

```css
font-size: 16px;
font-weight: 600;
cursor: pointer;

/* Hover */
color: var(--primary);
```

---

### Smart Input

```
┌──────────────────────────────────────┐
│ [café 2500____________]  [▶]         │
└──────────────────────────────────────┘

Height: 56px (total container)
Gap: 12px entre input y button
```

**Input:**

```css
flex: 1;
background: var(--bg-tertiary);
border: 1px solid transparent;
border-radius: 12px;
padding: 14px 16px;
font-size: 14px;

/* Focus */
border-color: var(--primary);
```

**Button "Agregar":**

```css
width: 48px;
height: 48px;
border-radius: 12px;
background: var(--primary);

/* Disabled (empty input) */
opacity: 0.5;
cursor: not-allowed;
```

**Hint contextual (período pasado):**

```
┌──────────────────────────────────────┐
│ ⓘ Se registrará en Feb 2026          │ ← hint arriba
│ [café 2500____________]  [▶]         │
└──────────────────────────────────────┘

Font: 12px
Color: var(--text-tertiary)
Margin-bottom: 8px
```

---

### Saldo Vivo Card (Actualizado)

```
┌─────────────────────────────────────┐
│ 💰 Saldo del Mes (ARS)              │ ← title 16px/600
│                                     │
│ Ingresos del mes      $1.000.000    │ ← tap aquí edita
│ Gastos percibidos       -$350.000   │
│ Pago de tarjetas        -$450.000   │ ← NUEVO (simplificado)
│ ───────────────────────────────────  │
│ Disponible              $200.000    │ ← 28px/700
│ ✓ Verificado 10 feb                 │ ← badge success
│                                     │
│ [████████░░░░░░░░] 20% restante     │
└─────────────────────────────────────┘

Padding: 20px
Border: 2px solid var(--border-strong)
Border-radius: 18px
```

**Estados visuales:**

**Sin configurar (ingresos $0):**

```css
'Ingresos del mes' {
  color: var(--danger);
  font-weight: 600;
}
```

**Verificado:**

```css
badge {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
}
```

**No verificado:**

- No muestra badge

---

### Gastos con Tarjeta (Nuevo - Simplificado)

```
┌─────────────────────────────────────┐
│ 💳 Gastos con tarjeta este mes      │
│                                     │
│ $370.000                            │ ← 20px/700
│ (se pagarán en marzo)               │ ← 12px, tertiary
└─────────────────────────────────────┘

Padding: 16px
Background: var(--bg-secondary)
Border-radius: 16px
```

**ELIMINADO:**

- ❌ Desglose por tarjeta
- ❌ Fechas de cierre
- ❌ "Comprometido" con rollforward

**NUEVO:**

- ✅ Solo total simple
- ✅ Texto estático (no cambia si mes pasado)
- ✅ Siempre visible (aunque $0)

---

### ParsePreview Modal (Opción A - Confirmado)

```
╔═════════════════════════════════════╗
║ [─]  handle bar (8px centered)      ║ ← iOS style
║                                     ║
║ Confirmar gasto                     ║ ← title 18px/600
║ Revisá los datos antes de guardar   ║ ← subtitle 12px
║                                     ║
║ ┌─────────────────────────────────┐ ║
║ │ MONTO                   ← label │ ║
║ │ [$ 2500]         [ARS ▼]        │ ║ ← monto + toggle
║ └─────────────────────────────────┘ ║
║                                     ║
║ CATEGORÍA                           ║
║ [🍔 Restaurantes            ▼]      ║
║                                     ║
║ MEDIO DE PAGO                       ║
║ [💵 Efectivo                ▼]      ║
║                                     ║
║ TARJETA                             ║ ← condicional (solo si CREDIT)
║ [BBVA VISA                  ▼]      ║
║                                     ║
║ FECHA                               ║
║ [📅 3 Febrero 2026          ▼]      ║
║                                     ║
║ ¿NECESIDAD O DESEO?                 ║
║ [✓ Necesidad] [  Deseo]             ║
║                                     ║
║ ─────────────────────────────────   ║
║                                     ║
║ [Guardar gasto ✓]                   ║ ← Primary CTA
║ [Cancelar]                          ║ ← Ghost button
╚═════════════════════════════════════╝

Width: 90vw, max 420px
Padding: 24px
Background: var(--bg-secondary)
Border-radius: 24px 24px 0 0 (mobile)
Height: auto, max 80vh
```

**Labels:**

```css
font-size: 10px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.5px;
color: var(--text-secondary);
margin-bottom: 8px;
```

**Spacing entre fields:**

```css
margin-bottom: 20px;
```

**CASO ESPECIAL: "Pago de Tarjetas"**

```
╔═════════════════════════════════════╗
║ Confirmar gasto                     ║
║                                     ║
║ MONTO                               ║
║ [$ 320000]          [ARS ▼]         ║
║                                     ║
║ CATEGORÍA                           ║
║ [💳 Pago de Tarjetas        ▼]      ║
║                                     ║
║ TARJETA                             ║ ← REQUIRED (rojo si null)
║ [BBVA VISA                  ▼]      ║
║                                     ║
║ MEDIO DE PAGO                       ║
║ [💳 Débito                  ▼]      ║
║                                     ║
║ FECHA                               ║
║ [📅 15 Febrero 2026         ▼]      ║
║                                     ║
║ (NO muestra toggle Need/Want)       ║ ← OCULTO
║                                     ║
║ [Guardar gasto]                     ║
╚═════════════════════════════════════╝
```

**Validaciones visuales:**

**Campo required vacío:**

```css
border-color: var(--danger);
background: rgba(239, 68, 68, 0.05);

+ mensaje abajo:
"Seleccioná una tarjeta"
color: var(--danger);
font-size: 11px;
```

**Botón disabled cuando required vacío:**

```css
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;
```

---

### Gasto Expandido (Inline Edit - Opción A)

```
┌────────────────────────────────────┐
│ 🍔 Café con leche     [$ 2500   ]  │ ← monto editable
│                                    │
│ CATEGORÍA                          │
│ [🍔 Restaurantes            ▼]     │
│                                    │
│ MEDIO DE PAGO                      │
│ [💵 Efectivo                ▼]     │
│                                    │
│ TARJETA                            │ ← condicional
│ [─ No aplica ─              ▼]     │
│                                    │
│ FECHA                              │
│ [📅 3 Febrero 2026          ▼]     │
│                                    │
│ ¿NECESIDAD O DESEO?                │
│ [✓ Necesidad] [  Deseo]            │
│                                    │
│ [🗑️ Eliminar]                      │ ← danger button
└────────────────────────────────────┘

Background: var(--bg-tertiary)
Padding: 16px
Border-radius: 12px
```

**Guardar:** Al colapsar (tap fuera).

**Loading state (while saving):**

```css
opacity: 0.6;
pointer-events: none;

+ spinner overlay center
```

**Error state:**

```css
border: 2px solid var(--danger);

+ mensaje dentro:
"❌ No se pudo guardar. Intentá de nuevo."
```

---

### Filtro Estoico

```
┌─────────────────────────────────────┐
│ 🧘 Filtro Estoico                   │
│                                     │
│ 68% Necesidad, 32% Deseo            │ ← 16px/600
│ [████████████░░░░░░]                │ ← progress bar
│ 12 necesidad · 7 deseo              │ ← 12px/400
└─────────────────────────────────────┘
```

**Progress bar:**

```css
height: 6px;
background: var(--bg-tertiary); /* track */
border-radius: 3px;
overflow: hidden;

/* Fill (gradient) */
background: linear-gradient(
  90deg,
  var(--necessity) 0%,
  var(--necessity) 68%,
  var(--want) 68%,
  var(--want) 100%
);
```

**Transition:**

```css
transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
```

---

### Top 3 Categorías

```
┌─────────────────────────────────────┐
│ 📊 Top 3 Categorías                 │
│                                     │
│ 🛒 Supermercado        45%  $450K   │
│ [█████████░░░░░░░░░░░░░]            │
│                                     │
│ 🍽️ Restaurantes        30%  $300K   │
│ [██████░░░░░░░░░░░░░░░░]            │
│                                     │
│ 🚗 Transporte          15%  $150K   │
│ [███░░░░░░░░░░░░░░░░░░░]            │
└─────────────────────────────────────┘
```

**Layout por fila:**

```css
display: flex;
align-items: center;
gap: 12px;
margin-bottom: 16px;

/* Emoji */
font-size: 20px;

/* Nombre categoría */
flex: 1;
font-size: 14px;

/* Porcentaje */
font-size: 14px;
font-weight: 600;
color: var(--text-secondary);

/* Monto */
font-size: 16px;
font-weight: 600;
color: var(--text-primary);
```

**Progress bar:**

```css
height: 4px;
background: var(--bg-tertiary);
border-radius: 2px;

/* Fill */
background: var(--primary);
```

---

### Últimos 5 Gastos

```
┌─────────────────────────────────────┐
│ 📝 Últimos 5 Gastos                 │
│                                     │
│ 🍔 Café con leche          $2.500   │
│    Hoy · Efectivo                   │
│ ───────────────────────────────────  │
│ 🚗 Uber                    $3.500   │
│    Ayer · Débito                    │
│ ───────────────────────────────────  │
│ 💳 Pago BBVA VISA        $320.000   │ ← Pago Tarjetas
│    2 Feb · Débito                   │   (visual diferente)
│ ───────────────────────────────────  │
│                                     │
│ [Ver todos →]                       │
└─────────────────────────────────────┘
```

**Gasto item (colapsado):**

```css
display: grid;
grid-template-columns: 24px 1fr auto;
gap: 12px;
padding: 12px;
cursor: pointer;
border-radius: 8px;

/* Hover */
background: var(--bg-tertiary);
```

**Visual "Pago de Tarjetas":**

```css
emoji: 💳
color: var(--text-tertiary); /* gris, no es gasto "real" */
background: rgba(100, 116, 139, 0.1);
```

**Empty state:**

```
│ (vacío)                             │
```

```css
color: var(--text-disabled);
font-size: 14px;
text-align: center;
padding: 40px 20px;
```

---

## 4. MOBILE-SPECIFIC

### Touch Targets

**Mínimo 44x44px:**

- Botones
- Dropdowns
- Gastos (tap para expandir)
- Header arrows

### Keyboard Handling

**Problema:** Teclado cubre botón "Agregar".

**Solución:**

```typescript
// Listener en Smart Input
window.visualViewport?.addEventListener('resize', () => {
  if (visualViewport.height < window.innerHeight) {
    // Teclado visible
    scrollToInput()
  }
})
```

**Auto-scroll:**

- Input gets focus → scroll to keep visible
- Botón "Agregar" always accessible

### Bottom Sheet (ParsePreview Mobile)

```css
position: fixed;
bottom: 0;
left: 0;
right: 0;
max-height: 90vh;
border-radius: 24px 24px 0 0;
background: var(--bg-secondary);

/* iOS handle bar */
&::before {
  content: '';
  width: 40px;
  height: 4px;
  background: var(--text-disabled);
  border-radius: 2px;
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
}
```

**Animación entrada:**

```css
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 5. LOADING STATES

### Skeleton (Dashboard Loading)

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 0%,
    var(--bg-elevated) 50%,
    var(--bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

**Uso:**

- Cambiar período (← →)
- Initial page load
- ParsePreview waiting for API

**NO usar para:**

- Micro-interactions <200ms
- Guardar gasto (usa spinner)

### Spinner (Inline Actions)

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--text-disabled);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

**Uso:**

- ParsePreview "Procesando..."
- Guardar gasto inline
- API calls explícitos

---

## 6. ERROR STATES

### Alert (Input Inválido)

```javascript
alert('El input no parece ser un gasto')
```

**Estilo nativo OK** (no custom modal en MVP).

### Inline Error (ParsePreview)

```
TARJETA
[                            ▼]  ← campo rojo
⚠️ Seleccioná una tarjeta         ← mensaje
```

```css
.error-message {
  color: var(--danger);
  font-size: 11px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
```

### Toast (Opcional Post-MVP)

```
┌─────────────────────────────┐
│ ✓ Gasto guardado            │
└─────────────────────────────┘

Position: bottom center
Duration: 2s
Background: var(--bg-elevated)
```

---

## 7. RESPONSIVE BREAKPOINTS

```css
/* Mobile-first (default) */
@media (max-width: 767px) {
  /* Todo diseñado para 375px */
}

/* Desktop */
@media (min-width: 768px) {
  /* Centered container */
  max-width: 440px;
  margin: 0 auto;

  /* Hover states enabled */
  button:hover { ... }

  /* /expenses → tabla */
  .expense-list {
    display: table;
  }
}
```

**No tablets específico** (usa mobile <768, desktop ≥768).

---

## 8. ANIMATIONS

### Transitions

**Standard easing:**

```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

**Reducir si prefers-reduced-motion:**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Micro-interactions

**Button press:**

```css
button:active {
  transform: scale(0.97);
}
```

**Card hover (desktop only):**

```css
@media (min-width: 768px) {
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
  }
}
```

---

## 9. ACCESSIBILITY

### Focus States

```css
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### ARIA Labels

```html
<button aria-label="Agregar gasto">▶</button>

<input aria-label="Monto del gasto" inputmode="decimal" />
```

### Color Contrast

**Mínimo WCAG AA:**

- Text primary on bg-primary: 15.8:1 ✓
- Text secondary on bg-secondary: 9.2:1 ✓
- Primary button text: 4.8:1 ✓

---

## 10. ICONS

**Lucide React:**

```typescript
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  Trash2,
  Check,
} from 'lucide-react'
```

**Size:**

```css
width: 20px;
height: 20px;
stroke-width: 2;
```

**Color:**

- Default: `currentColor`
- Inherit from parent text color

---

## 11. NUMBER FORMATTING

### Argentina Format

```typescript
// ARS
$1.234.567  // dot as thousands separator
$1.234.567,89  // comma as decimal (si aplica)

// USD
US$1,234,567  // comma as thousands
US$1,234,567.89  // dot as decimal
```

**Formateo código:**

```typescript
const formatARS = (amount: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount)

const formatUSD = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
```

### Responsive Numbers

**Si monto >9 dígitos → stack vertical:**

```
DISPONIBLE
$1.234.567.890
ARS
```

```css
.amount-lg {
  font-size: clamp(20px, 5vw, 28px);
}
```

---

## 12. DARK MODE ONLY

**No light mode en MVP.**

**Variables globales:**

```css
:root {
  color-scheme: dark;
}
```

**Meta tag:**

```html
<meta name="theme-color" content="#0a0e1a" />
```

---

**FIN DEL DESIGN SYSTEM v2.0 FINAL**
