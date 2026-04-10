# Cuotas Feature Audit

**Fecha:** 2026-04-09  
**Objetivo:** documentar como funciona hoy cuotas, como interactua el usuario con la feature, que hace tecnicamente, y cuales son los gaps, riesgos y decisiones abiertas.

## 1. Que es la feature

Cuotas permite registrar consumos con tarjeta de credito que se pagan en varios meses.

Hoy la feature soporta dos caminos distintos:

- compra nueva en cuotas
- compra ya en curso que el usuario empezo a pagar antes de cargarla en Gota

En ambos casos, la representacion final vive en `expenses` como multiples filas, una por cuota.

Campos clave en `expenses`:

- `installment_group_id`
- `installment_number`
- `installment_total`

## 2. Que problema resuelve

Sin esta feature, una compra con tarjeta en cuotas se registraria de forma incorrecta de una de estas maneras:

- como un gasto unico en el mes inicial
- como una serie manual de gastos repetidos
- o directamente no se reflejaria correctamente en tarjetas, movimientos y analytics

La intencion de producto es que cada cuota impacte el mes que corresponde.

## 3. Como interactua el usuario hoy

## A. Compra nueva en cuotas

Entrada principal:

- [ParsePreview.tsx](/C:/Users/Admin/Documents/gota/components/dashboard/ParsePreview.tsx)

Experiencia:

1. el usuario escribe un gasto en Smart Input
2. si el origen es tarjeta de credito, puede elegir cantidad de cuotas
3. al guardar, la app expande el gasto en varias filas futuras

Que ve el usuario:

- chips como `3x`, `6x`, `12x`, etc.
- texto de ayuda mostrando monto por mes y total

## B. Cuotas ya en curso

Entrada principal:

- [CuotasEnCursoSheet.tsx](/C:/Users/Admin/Documents/gota/components/dashboard/CuotasEnCursoSheet.tsx)

Experiencia:

1. el usuario abre el acceso desde el plus button
2. completa descripcion, monto por cuota, tarjeta, categoria, cuota actual y total
3. la app calcula cuantas cuotas faltan
4. al guardar, crea todas las cuotas restantes desde el mes actual hacia adelante

Que ve el usuario:

- formulario especifico
- feedback tipo "se registraran N cuotas desde este mes"

## C. Visualizacion

Lugares visibles:

- [Ultimos5.tsx](/C:/Users/Admin/Documents/gota/components/dashboard/Ultimos5.tsx)
- [ExpenseItem.tsx](/C:/Users/Admin/Documents/gota/components/expenses/ExpenseItem.tsx)

Que muestra:

- texto tipo `Cuota 3/12`
- la fila individual de cada cuota, no una entidad agregada de compra madre

## D. Borrado

Ruta principal:

- [route.ts](/C:/Users/Admin/Documents/gota/app/api/expenses/[id]/route.ts)

Experiencia:

- si el gasto pertenece a un `installment_group_id`
- al eliminar una cuota, la app elimina todo el grupo

En UI esto aparece explicito:

- "Eliminar las X cuotas?"

## E. Edicion

Ruta principal:

- [route.ts](/C:/Users/Admin/Documents/gota/app/api/expenses/[id]/route.ts)

Experiencia actual:

- si la fila pertenece a un `installment_group_id`, la edicion individual esta bloqueada
- la UI lo comunica explicitamente
- la API devuelve `409` si alguien intenta editar una cuota agrupada por fuera de la UI
- no existe todavia edicion grupal explicita

La asimetria quedo cerrada de forma segura:

- borrar = grupal
- editar individual = no permitido

## 4. Como funciona tecnicamente

## A. Creacion en backend

Ruta:

- [route.ts](/C:/Users/Admin/Documents/gota/app/api/expenses/route.ts)

Regla actual:

- si `installments` es `1` o null, inserta una sola fila
- si `installments > 1`, inserta multiples filas en `expenses`

Mecanica:

- genera `installment_group_id`
- calcula importes por cuota reconciliando centavos para que la suma final cierre exacto con el total original
- crea una fila por mes usando `addMonths(baseDate, i)`
- asigna `installment_number`
- asigna `installment_total`

Caso especial:

- si llega `installment_start`, el monto se interpreta como "monto por cuota"
- esto es lo que usa cuotas en curso

## B. Esquema de validacion

Archivo:

- [schemas.ts](/C:/Users/Admin/Documents/gota/lib/validation/schemas.ts)

Campos relevantes:

- `installments`
- `installment_start`
- `installment_grand_total`

Restricciones:

- `installments` entre 1 y 72
- `installment_start` entero >= 1
- `installment_grand_total` entero >= 1

## C. Borrado grupal

Ruta:

- [route.ts](/C:/Users/Admin/Documents/gota/app/api/expenses/[id]/route.ts)

Comportamiento:

- si la fila tiene `installment_group_id`, borra todas las filas de ese grupo
- si no, borra solo la fila puntual

## D. Analytics / compromisos / tarjetas

Archivos:

- [Compromisos.tsx](/C:/Users/Admin/Documents/gota/components/analytics/Compromisos.tsx)
- [computeResumen.ts](/C:/Users/Admin/Documents/gota/lib/analytics/computeResumen.ts)
- [card-summaries.ts](/C:/Users/Admin/Documents/gota/lib/card-summaries.ts)

Politica observada hoy:

- las cuotas se contabilizan en el mes en que se registra cada fila
- el impacto en resumen de tarjeta depende de la fecha mensual de cada cuota
- una compra hecha despues del cierre cae en el siguiente ciclo, y las cuotas siguientes caen en los ciclos siguientes

Esto es importante porque la feature no modela una "compra madre" abstracta.
Modela cuotas ya distribuidas en meses concretos.

## 5. Que hace bien hoy

- resuelve el alta de compras nuevas en cuotas
- resuelve el alta de cuotas ya en curso
- guarda las cuotas como filas mensuales explicitas
- muestra el numero de cuota en feed y gastos
- borra grupos completos
- evita inventar una segunda tabla compleja solo para cuotas
- reparte compras nuevas con cierre exacto del total en centavos

## 6. Gaps actuales

## A. Edicion grupal todavia ausente

Problema:

- no existe edicion grupal real de una operacion en cuotas
- la edicion individual quedo bloqueada a proposito

Impacto:

- si el usuario quiere corregir una compra en cuotas, hoy tiene que eliminar el grupo y volver a registrarlo

## B. Falta de semantica de origen

Problema:

- compra nueva y cuotas en curso terminan casi en la misma estructura
- no hay metadata clara para distinguir origen de negocio

Impacto:

- debugging mas dificil
- mas dificil explicar analytics o futuros cambios UX

## C. Politica contable no cerrada del todo

Problema:

- la app asume que las cuotas impactan en el mes de cada fila registrada
- pero no hay una definicion operativa cerrada y documentada de todos los efectos

Impacto:

- dudas en compromisos
- dudas en analytics mensuales
- riesgo de confusion futura si cambia el modelo de tarjetas

## D. Falta de tests

No hay evidencia de tests especificos para:

- insercion grupal
- cuotas en curso
- borrado grupal
- cambio de mes
- redondeo
- bloqueo de edicion individual

## 7. Riesgos

## Riesgo 1. Lectura confusa para el usuario

Cuotas en curso crea varias filas futuras de una vez.

Eso puede ser correcto, pero requiere que producto defina claramente:

- si eso debe contar como compromiso futuro
- si debe verse igual que una compra nueva en cuotas

## Riesgo 2. Reclamos dificiles de explicar

Si una compra en cuotas queda mal expandida:

- no hay entidad agregada simple que mostrar
- solo varias filas

Eso complica soporte y debugging.

## 8. Open items

## A. Cuotas sigue siendo feature oficialmente soportada?

Hay que definir si:

- se sostiene como feature core
- se simplifica
- o se congela hasta dejarla auditada

## B. Editar una cuota debe editar el grupo o solo la fila?

Opciones:

- mantener bloqueo de edicion individual si hay `installment_group_id`
- editar todo el grupo
- permitir edicion parcial, pero documentarla como decision explicita

## C. Hay que distinguir compra nueva vs cuotas en curso?

Hoy no esta diferenciado de forma rica.

Puede hacer falta un campo extra o una convencion mas explicita.

## D. Que esperan analytics y compromisos de esta feature?

Hay que definir con claridad:

- que cuenta en el mes actual
- que cuenta en futuros meses
- que significa "compromiso" vs "gasto registrado"

## 9. Recomendacion

No expandir mas la feature hasta cerrar una definicion minima.

La recomendacion practica es:

1. decidir si vale la pena implementar edicion grupal real
2. documentar semantica de cuotas en dashboard / analytics / tarjetas
3. agregar tests especificos del flujo
4. recien despues considerar la feature auditada

## 10. Estado implementado

Cambios ya aplicados:

- creacion de cuotas nuevas con reconciliacion exacta de centavos
- bloqueo explicito de edicion individual para filas con `installment_group_id`
- borrado grupal preservado
- comportamiento de impacto por ciclo de tarjeta confirmado segun la fecha de cada fila mensual

## 11. Conclusion

Cuotas hoy funciona, pero no esta completamente cerrada.

Estado real:

- creacion: si
- cuotas en curso: si
- visualizacion: si
- borrado grupal: si
- edicion individual coherente: si, porque quedo bloqueada
- edicion grupal: no
- semantica totalmente cerrada: no
- tests de confianza: no

Por eso sigue siendo una deuda real de producto y de ingenieria.
