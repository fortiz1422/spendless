# Monthly Income Audit

**Fecha:** 2026-04-09  
**Objetivo:** dejar claro qué sigue haciendo hoy `monthly_income`, dónde impacta realmente, y qué verificar antes de decidir si se mantiene como compatibilidad o se elimina.

## 1. Estado actual

`monthly_income` ya no es la fuente principal de ingresos del producto.

La dirección vigente del sistema es:

- `income_entries` = fuente operativa de ingresos
- `accounts.opening_balance_*` = saldo base histórico
- `monthly_income` = compatibilidad residual / cierre legacy de mes

## 2. Dónde sigue vivo en código

## A. API legacy dedicada

Archivo: [route.ts](/C:/Users/Admin/Documents/gota/app/api/monthly-income/route.ts)

Qué hace:

- `GET`: lee `amount_ars`, `amount_usd`, `saldo_inicial_ars`, `saldo_inicial_usd`, `closed`, `closed_at`
- `POST`: crea o actualiza una fila mensual
- `PUT`: marca un mes como cerrado

Conclusión:

- esta API sigue siendo la principal superficie operativa de `monthly_income`

## B. Fallback en rollover

Archivo: [rollover.ts](/C:/Users/Admin/Documents/gota/lib/rollover.ts)

Qué hace:

- `buildPrevMonthSummary()` sigue usando `monthly_income` como fallback
- prioridad actual:
  - ingresos: `income_entries > monthly_income`
  - saldo inicial: `account_period_balance > monthly_income`

Conclusión:

- `monthly_income` todavía puede afectar el resumen del mes anterior si faltan datos nuevos

## C. Borrado de cuenta/usuario

Archivo: [route.ts](/C:/Users/Admin/Documents/gota/app/api/account/route.ts)

Qué hace:

- elimina filas de `monthly_income` al borrar el usuario

Conclusión:

- la tabla sigue considerada como dato vivo del usuario, aunque no sea central

## 3. Dónde ya no debería mandar

Según el roadmap y los cambios recientes:

- dashboard ya no lo usa como fuente principal
- analytics ya no lo usa como fuente principal
- `Saldo Vivo` ya no depende de `monthly_income`

Entonces el foco de auditoría ya no es Home. Es:

- API legacy
- rollover
- datos legacy reales

## 4. Preguntas que faltan cerrar

### A. ¿Hay consumo real de `/api/monthly-income` desde la UI actual?

Si no hay fetches reales en pantallas actuales:

- la API puede quedar como legacy pasiva
- o directamente entrar en plan de retiro

### B. ¿Tu base todavía tiene filas en `monthly_income`?

Si no hay datos:

- el costo de eliminar compatibilidad baja mucho

Si hay datos:

- hay que decidir si migrarlos a `income_entries`
- o dejarlos solo como histórico legacy no operativo

### C. ¿Rollover realmente necesita el fallback?

Si todos tus meses relevantes ya tienen:

- `income_entries`
- y snapshots/APB cuando corresponde

entonces el fallback a `monthly_income` puede sobrar.

## 5. Queries para Supabase

## A. Ver si existen filas

```sql
select count(*) as total_rows
from monthly_income;
```

## B. Ver cuántos usuarios tienen datos

```sql
select count(distinct user_id) as users_with_monthly_income
from monthly_income;
```

## C. Ver detalle por usuario y mes

```sql
select
  mi.user_id,
  u.email,
  u.is_anonymous,
  mi.month,
  mi.amount_ars,
  mi.amount_usd,
  mi.saldo_inicial_ars,
  mi.saldo_inicial_usd,
  mi.closed,
  mi.closed_at
from monthly_income mi
join auth.users u on u.id = mi.user_id
order by mi.user_id, mi.month desc;
```

## D. Ver solo tu usuario principal

```sql
select
  month,
  amount_ars,
  amount_usd,
  saldo_inicial_ars,
  saldo_inicial_usd,
  closed,
  closed_at
from monthly_income
where user_id = '9083ebd0-6082-4067-9bd8-ef07e346a1d9'
order by month desc;
```

## E. Ver si hay users anónimos con filas legacy

```sql
select
  mi.user_id,
  u.email,
  u.is_anonymous,
  count(*) as months
from monthly_income mi
join auth.users u on u.id = mi.user_id
group by mi.user_id, u.email, u.is_anonymous
order by months desc, u.is_anonymous desc;
```

## 6. Señales para decidir rápido

### Caso 1. No hay filas y no hay consumo UI

Conclusión recomendada:

- retirar `/api/monthly-income`
- sacar fallback en rollover
- dejar `monthly_income` en plan de eliminación

### Caso 2. Hay filas, pero solo históricas y sin uso UI

Conclusión recomendada:

- mantener lectura pasiva temporal
- no seguir escribiendo
- evaluar migración o retiro posterior

### Caso 3. Hay consumo UI real

Conclusión recomendada:

- mapear exactamente qué pantalla depende de la API
- decidir si esa UX se migra a `income_entries`

## 7. Hipótesis actual

La hipótesis más probable, viendo el código actual, es esta:

- `monthly_income` ya quedó casi aislado
- la única dependencia funcional real puede ser rollover legacy
- si en tu base no hay datos útiles, el siguiente paso razonable sería retirar el fallback y apagar la API

## 8. Estado actualizado

Resultado de la auditoría:

- no hay consumo UI real de `/api/monthly-income`
- las únicas filas actuales pertenecen a users anónimos de prueba
- `monthly_income` no aporta valor operativo al usuario principal

Decisión recomendada:

- retirar el fallback de `monthly_income` en rollover
- eliminar la API legacy `/api/monthly-income`
- dejar la tabla en la base como legacy pasivo hasta decidir cleanup SQL posterior
