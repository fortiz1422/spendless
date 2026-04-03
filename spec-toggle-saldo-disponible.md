# Spec: Toggle Saldo Vivo / Disponible Real — Home Screen

## Contexto
En la pantalla Home existe un hero number que muestra el Saldo Vivo del mes. Debajo de ese número hay dos pills: Percibidos y Tarjeta. Al tocar el número hero se abre un bottom sheet con el desglose de cuentas (Banco Nación, Efectivo, BBVA, MercadoPago, etc.).

Este spec agrega:
1. Un toggle en el label del hero para alternar entre dos estados: **Saldo Vivo** y **Disponible Real**
2. Un hint de discoverabilidad debajo del número hero
3. Un segundo bottom sheet para el estado Disponible Real
4. Ajuste de la nota explicativa en ambos sheets

---

## Lineamientos de diseño — NO negociables
- Paleta de colores del tema "Fría": usar exclusivamente los tokens CSS ya definidos en el proyecto (`--bgPrimary`, `--textPrimary`, `--accent`, `--orange`, `--green`, etc.). No hardcodear colores.
- Tipografía: DM Sans en todos los textos nuevos.
- Iconos: usar exclusivamente **Phosphor Icons** en peso `Light` con `stroke-width: 1.5`. No usar emojis ni otros icon sets.
- Bordes y sombras: seguir el mismo estilo de los cards existentes (border-radius 20px, sombra sutil). No inventar nuevos estilos.
- No modificar ningún archivo fuera de los componentes de la pantalla Home y sus bottom sheets.
- No reformatear código que no se toca.

---

## Cambio 1: Toggle en el label del hero

**Dónde:** en la línea donde dice "DISPONIBLE" (el label eyebrow sobre el número grande).

**Qué hacer:**
- Renombrar el label de "DISPONIBLE" a "SALDO VIVO" — este es el nombre correcto del concepto.
- Agregar a la derecha del label un ícono de Phosphor `ArrowsDownUp` (peso Light, tamaño 13px, color `--textDim`, opacidad 0.5).
- El label + ícono deben ser tocables como una unidad (touchable/pressable).
- Al tocar, alterna entre dos estados: `saldo_vivo` y `disponible_real`.

**Estado `saldo_vivo` (default):**
- Label: "SALDO VIVO"
- Número hero: valor del saldo vivo del mes (el mismo que hoy)
- Color del número: `--textPrimary`

**Estado `disponible_real`:**
- Label: "DISPONIBLE REAL"
- Número hero: saldo vivo menos el total comprometido en tarjeta del mes
- Color del número: `--accent`

**Animación del cambio:**
- El número hero hace una transición suave: sale hacia arriba con fade out (150ms), entra desde abajo con fade in (200ms).
- El label cambia sin animación.
- No hay animación en los pills — permanecen estáticos en ambos estados.

---

## Cambio 2: Hint de discoverabilidad

**Dónde:** inmediatamente debajo del número hero, antes de los pills.

**Qué hacer:**
- Agregar un texto pequeño que diga "Ver detalle" con un ícono Phosphor `CaretRight` (peso Light, tamaño 11px) a su derecha.
- Estilo: font-size 11px, font-weight 600, color `--textDim`.
- En estado `disponible_real`, el color cambia a `--accent`.
- El hint forma parte del área tappeable del número hero (mismo touchable que abre el sheet).

---

## Cambio 3: Bottom sheet — estado Saldo Vivo

El bottom sheet existente para Saldo Vivo ya funciona. Solo agregar al final del sheet, después del row de Total, una nota explicativa:

**Componente nota:**
- Contenedor con fondo `--bgSecondary`, border-radius 14px, padding 14px 16px.
- Ícono Phosphor `Info` (peso Light, tamaño 16px, color `--textDim`) alineado arriba a la izquierda.
- Texto a la derecha del ícono: *"El Saldo Vivo es la suma real de todo tu dinero ahora mismo: cuentas bancarias, billeteras digitales y efectivo. Es el mismo número que ves en cada uno de tus bancos."*
- Estilo del texto: font-size 12px, color `--textSecond`, line-height 1.55.

---

## Cambio 4: Bottom sheet — estado Disponible Real

Crear un nuevo bottom sheet que se abre cuando el usuario toca el número hero estando en estado `disponible_real`. Seguir exactamente el mismo estilo visual del bottom sheet de Saldo Vivo existente.

**Contenido del sheet:**

Eyebrow: "DISPONIBLE REAL · [MES ACTUAL]"

Número hero del sheet: valor del disponible real, color `--accent`

Tres rows:
| Label | Valor |
|---|---|
| Saldo Vivo | [valor saldo vivo] en `--textPrimary` |
| Comprometido en tarjeta | − [valor tarjeta] en `--orange` |

Separador (border-top).

Row total:
| Label | Valor |
|---|---|
| Disponible real | [valor disponible real] en `--accent`, font-size mayor (20px) |

Nota explicativa (mismo componente que en Cambio 3):
- Ícono Phosphor `Info` (peso Light, 16px, `--textDim`).
- Texto: *"El Disponible Real descuenta lo que ya gastaste con tarjeta este mes pero todavía no salió de tu cuenta. Es lo que podés usar sin sorpresas cuando llegue el resumen."*

---

## Comportamiento del toggle sobre los pills

Los pills de Percibidos y Tarjeta **no cambian** en ninguno de los dos estados. Siempre visibles, siempre al 100% de opacidad. No agregar ninguna lógica sobre ellos.

---

## Cálculo del Disponible Real

```
disponible_real = saldo_vivo - total_comprometido_tarjeta_mes
```

Donde `total_comprometido_tarjeta_mes` es el mismo valor que hoy muestra el pill de Tarjeta. No crear nueva lógica de negocio — reutilizar el dato que ya existe.

---

## Stop conditions

Detener y consultar si:
- El bottom sheet de Saldo Vivo existente no es un componente separado y está todo inline — antes de refactorizar, preguntar.
- No existe un token de color para `--accent` o `--orange` en el sistema de tokens actual — no hardcodear, consultar.
- La animación del número hero requiere instalar una dependencia nueva — consultar antes de instalar.
- Cualquier cambio implica tocar archivos fuera de la pantalla Home o sus sheets — no proceder sin confirmación.
