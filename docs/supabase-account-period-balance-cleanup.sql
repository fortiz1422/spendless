-- APB cleanup
-- Fecha: 2026-04-09
-- Objetivo:
-- 1. verificar si existen rows legacy con source != 'rollover_auto'
-- 2. opcionalmente normalizarlas
-- 3. dejar account_period_balance.source alineado con la app actual

-- ============================================
-- 1. PRECHECK
-- ============================================

select
  source,
  count(*) as rows
from account_period_balance
group by source
order by source;

-- Si queres inspeccionar las rows legacy antes de tocar nada:
select
  account_id,
  period,
  balance_ars,
  balance_usd,
  source,
  updated_at
from account_period_balance
where source <> 'rollover_auto'
order by period desc, updated_at desc;

-- ============================================
-- 2. NORMALIZACION OPCIONAL
-- ============================================

-- Si confirmas que no necesitas conservar semantica legacy en source,
-- podes convertir cualquier source viejo a rollover_auto antes de cerrar el CHECK.
update account_period_balance
set source = 'rollover_auto'
where source <> 'rollover_auto';

-- Verificacion post-normalizacion:
select
  source,
  count(*) as rows
from account_period_balance
group by source
order by source;

-- ============================================
-- 3. CONSTRAINT CLEANUP
-- ============================================

-- Nota:
-- El nombre usual del CHECK inline es account_period_balance_source_check,
-- pero primero lo borramos con IF EXISTS para no depender de recordar el nombre exacto.
alter table account_period_balance
drop constraint if exists account_period_balance_source_check;

alter table account_period_balance
add constraint account_period_balance_source_check
check (source in ('rollover_auto'));

-- ============================================
-- 4. VERIFICACION FINAL
-- ============================================

select
  conname as constraint_name,
  pg_get_constraintdef(c.oid) as definition
from pg_constraint c
join pg_class t on t.oid = c.conrelid
where t.relname = 'account_period_balance'
  and c.contype = 'c'
order by conname;

select
  source,
  count(*) as rows
from account_period_balance
group by source
order by source;
