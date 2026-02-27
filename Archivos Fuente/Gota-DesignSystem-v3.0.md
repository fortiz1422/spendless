# Gota — Design System v3.0

**Versión:** 3.0 (Post-Rebrand)
**Fecha:** 27 Febrero 2026
**Status:** ✅ Estado actual del producto

---

## VISIÓN DE PRODUCTO

### Qué es Gota

Gota es una aplicación de registro de gastos personales diseñada para el contexto argentino, construida sobre una premisa simple: el problema no es no saber en qué gastás, es que registrarlo siempre fue demasiado difícil para hacerlo todos los días.

La mayoría de las apps de finanzas personales fallan por exceso — demasiadas pantallas, demasiadas categorías, demasiado setup. Gota hace la apuesta contraria: si el acto de registrar un gasto cuesta menos de 5 segundos, la consistencia se vuelve posible. Y con consistencia, la imagen financiera se construye sola.

### Por qué Gota y no SpendLess

El producto nació con el nombre SpendLess — descriptivo, en inglés, orientado al resultado. Funcionaba como working title pero prometía una transformación que la app no hace. Gota no te promete que vas a gastar menos. Te promete que si registrás, vas a saber.

SpendLess vive en el mismo espacio semántico que cualquier fintech. Gota nace de un concepto diferente: **consistencia sin fricción**. La metáfora es honesta con lo que el producto realmente es: pequeño, constante, liviano. Una gota no transforma nada. Pero una gota todos los días, sin falta, llena cualquier recipiente.

### El diferencial no es el tracking, es el comportamiento

Gota no te promete que vas a ahorrar más ni que vas a gastar mejor. Te da un espejo — cuánto gastás, en qué, con qué intención — y deja que vos saques las conclusiones. La distinción entre Necesidades y Deseos no es un juicio moral, es información para que puedas ver tus patrones y decidir conscientemente.

El contexto argentino es central, no accidental. Múltiples tarjetas, pesos y dólares, gastos devengados vs. percibidos, inflación que distorsiona cualquier comparación histórica — todo eso existe en Gota de manera nativa, no como feature opcional.

---

## RESUMEN DE CAMBIOS v2.0 → v3.0

**Rebrand y paleta:**

- Nombre: SpendLess → Gota
- Acento: indigo `#6366f1` → sky blue `#38bdf8`
- Fondos: navy estándar → casi-negro base azul-marina (Gota Glass)
- Texto secundario: slate → sky blue tintado
- Semánticos: verde/naranja saturados → versiones más suaves

**Componentes:**

- SmartInput: borde celeste sutil (15% idle / 40% focus), sin gradiente en botón
- Top3: barras de progreso con opacidad (track 12% / fill 65% del celeste)
- FiltroEstoico: renombrado "Necesidades vs. Deseos", gap-[2px] entre segmentos
- ParsePreview: botón Guardar sólido, sin gradiente
- DashboardHeader: Settings (Lucide strokeWidth 1.5), mes en text-secondary
- SettingsModal: Cerrar sesión solo text-danger, sin fondo rojo

---

## 1. FOUNDATION

### Colors — Paleta Gota Glass

**Backgrounds:**

```css
--bg-primary:   #060a0e; /* App background — casi-negro, base azul-marina */
--bg-secondary: #0c1520; /* Cards, elevated surfaces */
--bg-tertiary:  #132030; /* Inputs, interactive elements */
--bg-elevated:  #334155; /* Hero card (SaldoVivo), hover states */
```

**Por qué esta paleta:**
La paleta original usaba un navy estándar (`#0a0e1a`) — el mismo que Revolut, Nubank, Belo. El cambio fue correrse hacia lo que el nombre sugería: agua. No de manera literal, sino en temperatura y profundidad. El fondo `#060a0e` es apenas perceptible respecto a negro puro, pero suficiente para que la pantalla no se sienta igual a cualquier otra app financiera.

**Text:**

```css
--text-primary:   #f0f9ff; /* Main content — sky tinted white */
--text-secondary: #bae6fd; /* Labels, metadata — sky blue */
--text-tertiary:  #94a3b8; /* Placeholders, muted */
--text-disabled:  #64748b; /* Disabled state */
```

**Borders:**

```css
--border-subtle: #132030; /* Card dividers */
--border-strong: #334155; /* Inputs, focused */
```

**Accent Colors:**

```css
--primary:   #38bdf8; /* Primary CTA, links, focus ring — sky blue */
--success:   #4ade80; /* Necesidad, positive balance — soft green */
--warning:   #f59e0b; /* Warnings */
--danger:    #ef4444; /* Errors, delete */

/* Semánticos */
--necessity: #4ade80; /* Necesidades vs. Deseos — Necesidad */
--want:      #fdba74; /* Necesidades vs. Deseos — Deseo, soft orange */
```

**Por qué el celeste:**
El acento cambió de indigo (`#6366f1`) — color por defecto del ecosistema SaaS — a sky blue (`#38bdf8`). Es el color que más conecta con la identidad: liviano, transparente, sin el peso institucional del violeta. En interacciones, botones y foco, ese celeste hace que la app se sienta viva sin ser agresiva. Los colores semánticos también se suavizaron: verde `#4ade80` y naranja `#fdba74` — menos saturados, más cómodos para una interfaz que se usa todos los días.

---

### Typography

**Font Stack:**

```css
font-family:
  var(--font-geist-sans), -apple-system, BlinkMacSystemFont,
  'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
```

**Type Scale:**

```css
--text-display: 32px / 700;   /* Page titles */
--text-xl:      20px / 600;   /* SaldoVivo Disponible */
--text-body-lg: 16px / 600;   /* Amounts in lists */
--text-body:    14px / 400;   /* Body text */
--text-body-sm: 12px / 400;   /* Metadata */
--text-caption: 10px / 500;   /* Section labels UPPERCASE */
```

**Uso de peso de fuente:**

- Login heading: `font-light` — liviano, acorde a la identidad
- Section labels: `font-medium uppercase tracking-wider` — jerarquía visual clara
- SaldoVivo Disponible: `font-semibold tabular-nums` — legibilidad en números

---

### Spacing

**8px system:**

```css
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
```

### Border Radius

```css
--radius-card:    16px;
--radius-card-lg: 18px;
--radius-input:   12px;
--radius-button:  12px;
```

---

## 2. COMPONENTS

### Buttons

#### Primary CTA

```css
background: var(--primary); /* #38bdf8 — sólido, sin gradiente */
color: white;
padding: 12px 24px;
border-radius: 12px;
font-size: 14px;
font-weight: 600;

/* Hover */
transform: scale(1.02);

/* Active */
transform: scale(0.95);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;
```

**Importante:** No se usa gradiente. El botón es sky blue sólido.
El gradiente indigo→violeta del v2.0 fue eliminado en el rebrand — era genérico SaaS.

**Uso:**

- "Guardar gasto ✓" en ParsePreview
- Botón envío en SmartInput

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

#### Danger Ghost (Cerrar sesión)

```css
background: transparent;
color: var(--danger);
padding: 10px 0;

/* Hover */
background: rgba(255, 255, 255, 0.05); /* NO fondo rojo */
```

**Nota:** Cerrar sesión usa solo `text-danger`. Sin `bg-danger/10` ni fondo rojo — el rojo para esta acción era demasiado agresivo.

---

### Cards

#### Standard Card

```css
background: var(--bg-secondary); /* #0c1520 */
border: 1px solid var(--border-subtle);
border-radius: 16px;
padding: 16px;
```

**Uso:** Top 3, FiltroEstoico, Últimos Gastos.

#### Elevated Card (Hero — SaldoVivo)

```css
background: var(--bg-elevated); /* #334155 — el más claro */
border-radius: 18px;
padding: 20px;
```

**Nota:** SaldoVivo usa `bg-elevated` (no `bg-secondary`) para diferenciarse como componente hero. Sin border explícito.

---

### Section Labels

**Patrón estándar:**

```css
font-size: 10px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: wider; /* tracking-wider */
color: var(--text-secondary); /* #bae6fd — sky tint */
```

**Uso en todos los componentes del dashboard:**
- SaldoVivo: "Saldo Vivo"
- Top3: "Top Categorías"
- FiltroEstoico: "Necesidades vs. Deseos"
- Últimos gastos: títulos de sección

---

### Inputs

#### Smart Input

```css
background: var(--bg-tertiary);
border: 1px solid rgba(56, 189, 248, 0.15); /* celeste sutil idle */
border-radius: 12px;
padding: 12px 16px;
color: var(--text-primary);
font-size: 14px;

/* Focus */
border-color: rgba(56, 189, 248, 0.4); /* más visible */
outline: none;

/* Disabled */
opacity: 0.5;
```

**Por qué el borde celeste:**
En idle el borde es celeste al 15% — apenas visible, pero conecta con la identidad Gota y distingue el input del fondo sin gritar. En focus sube a 40%.

#### Text Input (ParsePreview / Settings)

```css
background: var(--bg-tertiary);
border: 1px solid transparent;
border-radius: 12px;
padding: 12px 16px;
color: var(--text-primary);

/* Focus */
border-color: var(--primary);
box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);

/* Error */
border-color: var(--danger);
background: rgba(239, 68, 68, 0.05);
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
```

**InputMode confirmado:**

```html
<input inputmode="text" />            <!-- Smart Input -->
<input inputmode="decimal" pattern="[0-9]*" />  <!-- Monto en ParsePreview -->
```

---

### Icons

**Librería:** Lucide React

```typescript
import { Settings, ArrowRight, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
```

**Especificaciones:**

```css
/* Header / UI icons */
size: 16px;
stroke-width: 1.5; /* más delgado que el default 2 — acorde a Gota */

/* Content icons */
size: 18-20px;
stroke-width: 2;
```

**Razón del strokeWidth 1.5:**
El stroke más delgado en iconos de navegación (Settings, flechas) contribuye a la sensación liviana del producto — coherente con font-light en el login y la identidad Gota.

---

## 3. LAYOUT SPECS

### Dashboard Header

```
┌──────────────────────────────────────┐
│ [‹]      Febrero 2026      [›] [⚙]   │
│  ↑           ↑              ↑    ↑   │
│ tertiary  secondary       tertiary primary
└──────────────────────────────────────┘

Layout: grid grid-cols-3 items-center
Height: auto (9 × 9 touch targets)
```

**Especificación de colores:**

- Flechas `‹` `›`: `text-text-tertiary` (#94a3b8) — muted, no distraen
- Mes: `text-sm font-medium text-text-secondary` (#bae6fd) — protagonismo moderado
- Settings: `text-primary` (#38bdf8) — único elemento en color acento, acento intencional

**Botones de navegación:**

```css
width: 36px;
height: 36px;
border-radius: 50%;
background: transparent;

/* Hover */
background: rgba(255, 255, 255, 0.05);

/* Disabled */
opacity: 0.3;
cursor: not-allowed;
```

---

### Smart Input

```
┌──────────────────────────────────────┐
│ [café 2500____________]  [→]         │
│  border celeste 15%       bg-primary │
└──────────────────────────────────────┘

Gap: 12px
Button: 48×48px, bg-primary, rounded-input
Icon: ArrowRight size=18 strokeWidth=2
```

**Hint (período pasado):**

```
ⓘ Se registrará en Feb 2026
[café 2500____________]  [→]

Font: 12px / text-tertiary
Margin-bottom: 8px
```

---

### Saldo Vivo Card

```
┌─────────────────────────────────────┐
│ SALDO VIVO          ← uppercase xs  │  bg-elevated
│                                     │
│ Saldo inicial         +$500.000     │  ← success (si > 0)
│ Ingresos              +$1.000.000   │  ← success
│ Gastos percibidos      -$350.000    │  ← text-primary
│ Pago de tarjetas       -$450.000    │  ← text-primary (si > 0)
│ ─────────────────────────────────── │
│ Disponible            $700.000      │  ← text-xl font-semibold
│                                     │     success o danger según signo
└─────────────────────────────────────┘

Padding: 20px
Background: bg-elevated (#334155)
Border-radius: radius-card-lg (18px)
```

**Disponible:**

```css
font-size: 20px; /* text-xl */
font-weight: 600; /* font-semibold */
font-variant-numeric: tabular-nums;
color: var(--success); /* positivo */
/* o */
color: var(--danger);  /* negativo */
```

**Separador:**

```css
margin-top: 16px;
border-top: 1px solid var(--border-subtle);
padding-top: 16px;
```

---

### Necesidades vs. Deseos (ex Filtro Estoico)

```
┌─────────────────────────────────────┐
│ NECESIDADES VS. DESEOS    12 gastos │
│                                     │
│ Necesidad · 8 · 68%    Deseo · 4 · 32%│
│ [████████████  ░░░░░]               │ ← gap-[2px] entre segmentos
└─────────────────────────────────────┘

Height barra: 8px (h-2)
Gap entre segmentos: 2px
Border-radius: rounded-full
```

**Barra:**

```css
display: flex;
height: 8px;
gap: 2px;
overflow: hidden;
border-radius: 9999px;
background: var(--bg-tertiary); /* track visible si ambos 0% */

/* Segmento Necesidad */
background: var(--success); /* #4ade80 */

/* Segmento Deseo */
background: var(--want); /* #fdba74 */
```

**El gap de 2px** entre segmentos es un detalle intencional — separa visualmente las dos categorías sin añadir ruido.

---

### Top Categorías

```
┌─────────────────────────────────────┐
│ TOP CATEGORÍAS                      │
│                                     │
│ 🛒 Supermercado    $450.000    10x  │
│ [██████████░░░░░░░░░░░░░░░░░░░]    │ ← celeste con opacidad
│                                     │
│ 🍔 Restaurantes    $300.000     6x  │
│ [███████░░░░░░░░░░░░░░░░░░░░░░]    │
│                                     │
│ 🚗 Transporte      $150.000     3x  │
│ [███░░░░░░░░░░░░░░░░░░░░░░░░░░]    │
└─────────────────────────────────────┘
```

**Barra de progreso:**

```css
/* Track */
height: 6px; /* h-1.5 */
background: rgba(56, 189, 248, 0.12); /* celeste 12% */
border-radius: 9999px;

/* Fill */
background: rgba(56, 189, 248, 0.65); /* celeste 65% */
```

**Por qué opacidad en lugar de sólido:**
Las barras con opacidad (track 12% / fill 65%) se sienten más integradas al fondo oscuro que un celeste sólido. Más agua, menos UI kit.

---

### ParsePreview Modal

```
╔═════════════════════════════════════╗
║ [─]  handle bar                     ║
║                                     ║
║ Confirmar gasto         18px/600    ║
║ Revisá los datos antes de guardar   ║
║                                     ║
║ MONTO                               ║
║ [$ 2500]           [ARS ▼]         ║
║                                     ║
║ CATEGORÍA                           ║
║ [🍔 Restaurantes            ▼]     ║
║                                     ║
║ MEDIO DE PAGO                       ║
║ [💵 Efectivo                ▼]     ║
║                                     ║
║ TARJETA          (solo si CREDIT)   ║
║ [BBVA VISA                  ▼]     ║
║                                     ║
║ FECHA                               ║
║ [📅 27 Febrero 2026         ▼]     ║
║                                     ║
║ ¿NECESIDAD O DESEO?                 ║
║ [✓ Necesidad] [  Deseo]             ║
║                                     ║
║ [Guardar gasto ✓]     ← bg-primary  ║
║ [Cancelar]            ← ghost       ║
╚═════════════════════════════════════╝

Width: 90vw, max 420px
Padding: 24px
Background: var(--bg-secondary)
Border-radius: 24px 24px 0 0
```

**Botón Guardar:**

```css
background: var(--primary); /* #38bdf8 — sólido, sin gradiente */
color: white;
width: 100%;
border-radius: 12px;
padding: 12px;
font-size: 14px;
font-weight: 600;
```

**Labels de campo:**

```css
font-size: 10px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: wider;
color: var(--text-secondary);
margin-bottom: 8px;
```

**Validaciones:**

```css
/* Campo requerido vacío */
border-color: var(--danger);
background: rgba(239, 68, 68, 0.05);

/* Mensaje de error */
color: var(--danger);
font-size: 11px;
margin-top: 4px;
```

**Toggle Necesidad/Deseo (activo):**

```css
/* Necesidad activa */
background: var(--success); /* #4ade80 */
color: white;

/* Deseo activo */
background: var(--primary); /* #38bdf8 */
color: white;
```

**CASO ESPECIAL — Pago de Tarjetas:**

- Se oculta el toggle Necesidad/Deseo
- Tarjeta es required (borde rojo si null)
- Botón disabled hasta que tarjeta esté seleccionada

---

### Gasto Expandido (Inline Edit)

```
┌────────────────────────────────────┐
│ 🍔 Café con leche    [$ 2500   ]  │
│                                    │
│ CATEGORÍA                          │
│ [🍔 Restaurantes            ▼]    │
│                                    │
│ MEDIO DE PAGO                      │
│ [💵 Efectivo                ▼]    │
│                                    │
│ TARJETA          (condicional)     │
│ [─ No aplica ─              ▼]    │
│                                    │
│ FECHA                              │
│ [📅 3 Febrero 2026          ▼]    │
│                                    │
│ ¿NECESIDAD O DESEO?                │
│ [✓ Necesidad] [  Deseo]            │
│                                    │
│ [🗑 Eliminar]    ← text-danger     │
└────────────────────────────────────┘

Background: var(--bg-tertiary)
Padding: 16px
Border-radius: 12px
Guardar: al colapsar (tap fuera)
```

---

### Login

```
┌──────────────────────────────────┐
│                                  │
│         [ícono gota PNG]         │
│                                  │
│              Gota                │ ← font-light, grande
│   Tus gastos, sin fricción       │ ← text-tertiary, muted
│                                  │
│   [Continuar con Google]         │
│                                  │
└──────────────────────────────────┘
```

**Tipografía del título:**

```css
font-weight: 300; /* font-light */
```

**Tagline:** `text-text-tertiary` — muted, no compite con el CTA.

---

## 4. MOBILE-SPECIFIC

### Touch Targets

**Mínimo 44×44px:**

- Todos los botones
- Dropdowns y selects
- Gastos expandibles (tap para expandir)
- Flechas de navegación en header

### Keyboard Handling

```typescript
window.visualViewport?.addEventListener('resize', () => {
  if (visualViewport.height < window.innerHeight) {
    scrollToInput()
  }
})
```

### Bottom Sheet (ParsePreview)

```css
position: fixed;
bottom: 0;
left: 0;
right: 0;
max-height: 90vh;
border-radius: 24px 24px 0 0;
background: var(--bg-secondary);
animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Handle bar iOS style */
width: 40px;
height: 4px;
background: var(--text-disabled);
border-radius: 2px;
margin: 12px auto 0;
```

### Safe Area (Dynamic Island / Notch)

```css
.pt-safe {
  padding-top: calc(env(safe-area-inset-top) + 1.5rem);
}
```

---

## 5. LOADING STATES

### Skeleton

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #132030 0%,    /* bg-tertiary */
    #334155 50%,   /* bg-elevated */
    #132030 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
```

**Uso:** Cambio de período, carga inicial.

### Spinner

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #64748b;
  border-top-color: #38bdf8; /* primary */
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```

**Uso:** SmartInput mientras parsea, guardar inline.

---

## 6. ERROR STATES

### Input inválido (Smart Input)

```javascript
alert('El input no parece ser un gasto')
// Native alert — OK para MVP
```

### Inline (ParsePreview / Settings)

```css
/* Campo */
border-color: var(--danger);
background: rgba(239, 68, 68, 0.05);

/* Mensaje */
.error-message {
  color: var(--danger);
  font-size: 11px;
  margin-top: 4px;
}
```

---

## 7. ANIMATIONS

```css
/* Standard easing */
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

/* Slide up (ParsePreview) */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

/* Button press */
button:active { transform: scale(0.95); }

/* Hover (desktop) */
button:hover  { transform: scale(1.02); }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. ACCESSIBILITY

### Focus Ring

```css
*:focus-visible {
  outline: 2px solid #38bdf8; /* primary */
  outline-offset: 2px;
}
```

### ARIA Labels

```html
<button aria-label="Agregar gasto"><ArrowRight /></button>
<button aria-label="Mes anterior">‹</button>
<button aria-label="Configuración"><Settings /></button>
<input aria-label="Monto del gasto" inputmode="decimal" />
```

### Dark Mode Only

```css
:root { color-scheme: dark; }
```

No light mode en MVP.

---

## 9. NUMBER FORMATTING

### Argentina (ARS)

```typescript
const formatARS = (amount: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount)
// → $1.234.567
```

### USD

```typescript
const formatUSD = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
// → US$1,234,567
```

### Números grandes

```css
/* tabular-nums en todos los montos */
font-variant-numeric: tabular-nums;

/* Responsive */
font-size: clamp(16px, 4vw, 20px);
```

---

## 10. RESPONSIVE

```css
/* Mobile-first — diseñado para 375px */

/* Desktop */
@media (min-width: 768px) {
  max-width: 440px;
  margin: 0 auto;
}
```

No breakpoint tablet específico.

---

## QUICK REFERENCE

| Token | Valor | Uso |
|---|---|---|
| `bg-primary` | `#060a0e` | Fondo app |
| `bg-secondary` | `#0c1520` | Cards |
| `bg-tertiary` | `#132030` | Inputs |
| `bg-elevated` | `#334155` | SaldoVivo, hover |
| `primary` | `#38bdf8` | CTAs, focus, acento |
| `success` | `#4ade80` | Necesidad, saldo positivo |
| `want` | `#fdba74` | Deseo |
| `danger` | `#ef4444` | Errores, eliminar |
| `text-primary` | `#f0f9ff` | Contenido principal |
| `text-secondary` | `#bae6fd` | Labels, metadata |
| `text-tertiary` | `#94a3b8` | Muted, placeholders |

| Decisión | Elección |
|---|---|
| Botón primario | Sólido `bg-primary`, sin gradiente |
| Ícono stroke | `strokeWidth={1.5}` en nav, `2` en contenido |
| Labels de sección | UPPERCASE tracking-wider |
| Cerrar sesión | Solo `text-danger`, sin fondo |
| Smart Input border | Celeste 15% idle / 40% focus |
| Top3 bars | Celeste rgba: track 12% / fill 65% |
| FiltroEstoico gap | `gap-[2px]` entre segmentos |

---

**FIN DEL DESIGN SYSTEM v3.0**
