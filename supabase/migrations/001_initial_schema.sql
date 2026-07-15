begin;

create extension if not exists pgcrypto;

create table public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text not null default '',
  image_path text not null default '/products/placeholder.png',
  category text not null default 'Baby',
  item_type text not null check (item_type in ('fixed', 'fund')),
  price_usd numeric(14, 2),
  price_vnd numeric(18, 0),
  quantity_needed integer,
  fund_target_usd numeric(14, 2),
  fund_target_vnd numeric(18, 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint items_type_fields_check check (
    (
      item_type = 'fixed'
      and price_usd is not null and price_usd > 0
      and price_vnd is not null and price_vnd > 0
      and quantity_needed is not null and quantity_needed > 0
      and fund_target_usd is null and fund_target_vnd is null
    )
    or
    (
      item_type = 'fund'
      and fund_target_usd is not null and fund_target_usd > 0
      and fund_target_vnd is not null and fund_target_vnd > 0
      and price_usd is null and price_vnd is null and quantity_needed is null
    )
  )
);

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null check (char_length(trim(guest_name)) between 1 and 120),
  guest_email text,
  guest_note text,
  intended_payment_method text check (
    intended_payment_method in ('Venmo', 'Cash App')
  ),
  status text not null default 'claimed' check (
    status in ('claimed', 'paid', 'purchased', 'cancelled')
  ),
  admin_note text,
  total_usd numeric(14, 2) not null default 0 check (total_usd >= 0),
  total_vnd numeric(18, 0) not null default 0 check (total_vnd >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.claim_items (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  item_id uuid not null references public.items(id),
  quantity integer,
  contribution_usd numeric(14, 2),
  contribution_vnd numeric(18, 0),
  unit_price_usd numeric(14, 2),
  unit_price_vnd numeric(18, 0),
  created_at timestamptz not null default now(),
  unique (claim_id, item_id),
  constraint claim_item_kind_check check (
    (
      quantity is not null and quantity > 0
      and unit_price_usd is not null and unit_price_usd > 0
      and unit_price_vnd is not null and unit_price_vnd > 0
      and contribution_usd is null and contribution_vnd is null
    )
    or
    (
      quantity is null and unit_price_usd is null and unit_price_vnd is null
      and contribution_usd is not null and contribution_usd > 0
      and contribution_vnd is not null and contribution_vnd > 0
    )
  )
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  claim_id uuid references public.claims(id) on delete set null,
  item_id uuid references public.items(id) on delete set null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index items_active_sort_idx on public.items (is_active, sort_order, created_at);
create index claims_status_created_idx on public.claims (status, created_at desc);
create index claim_items_item_idx on public.claim_items (item_id);
create index claim_items_claim_idx on public.claim_items (claim_id);
create index activity_events_created_idx on public.activity_events (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger items_set_updated_at
before update on public.items
for each row execute function public.set_updated_at();

create trigger claims_set_updated_at
before update on public.claims
for each row execute function public.set_updated_at();

alter table public.items enable row level security;
alter table public.claims enable row level security;
alter table public.claim_items enable row level security;
alter table public.activity_events enable row level security;

-- No anon or authenticated policies are created. All application access goes
-- through server-only code using the service role. This prevents direct reads
-- of guest details even if a visitor obtains the public anon key.
revoke all on table public.items from anon, authenticated;
revoke all on table public.claims from anon, authenticated;
revoke all on table public.claim_items from anon, authenticated;
revoke all on table public.activity_events from anon, authenticated;

create or replace view public.public_item_availability
with (security_invoker = true)
as
select
  i.id,
  i.title,
  i.description,
  i.image_path,
  i.category,
  i.item_type,
  i.price_usd,
  i.price_vnd,
  i.quantity_needed,
  i.fund_target_usd,
  i.fund_target_vnd,
  i.is_active,
  i.sort_order,
  coalesce(a.claimed_quantity, 0)::integer as claimed_quantity,
  greatest(coalesce(i.quantity_needed, 0) - coalesce(a.claimed_quantity, 0), 0)::integer
    as remaining_quantity,
  coalesce(a.funded_usd, 0)::numeric(14, 2) as funded_usd,
  coalesce(a.funded_vnd, 0)::numeric(18, 0) as funded_vnd,
  greatest(coalesce(i.fund_target_usd, 0) - coalesce(a.funded_usd, 0), 0)::numeric(14, 2)
    as remaining_usd,
  greatest(coalesce(i.fund_target_vnd, 0) - coalesce(a.funded_vnd, 0), 0)::numeric(18, 0)
    as remaining_vnd
from public.items i
left join lateral (
  select
    coalesce(sum(ci.quantity) filter (where c.status in ('claimed', 'paid', 'purchased')), 0)
      as claimed_quantity,
    coalesce(sum(ci.contribution_usd) filter (where c.status in ('claimed', 'paid', 'purchased')), 0)
      as funded_usd,
    coalesce(sum(ci.contribution_vnd) filter (where c.status in ('claimed', 'paid', 'purchased')), 0)
      as funded_vnd
  from public.claim_items ci
  join public.claims c on c.id = ci.claim_id
  where ci.item_id = i.id
) a on true;

revoke all on table public.public_item_availability from anon, authenticated;
grant select on table public.public_item_availability to service_role;

create or replace function public.create_registry_claim(
  p_guest_name text,
  p_guest_email text,
  p_guest_note text,
  p_intended_payment_method text,
  p_fixed_items jsonb,
  p_fund_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_claim_id uuid := gen_random_uuid();
  v_entry jsonb;
  v_item public.items%rowtype;
  v_item_id uuid;
  v_quantity integer;
  v_contribution_usd numeric(14, 2);
  v_contribution_vnd numeric(18, 0);
  v_claimed integer;
  v_funded_usd numeric(14, 2);
  v_total_usd numeric(14, 2) := 0;
  v_total_vnd numeric(18, 0) := 0;
  v_requested_ids uuid[];
begin
  p_guest_name := trim(coalesce(p_guest_name, ''));
  p_guest_email := nullif(trim(coalesce(p_guest_email, '')), '');
  p_guest_note := nullif(trim(coalesce(p_guest_note, '')), '');

  if char_length(p_guest_name) not between 1 and 120 then
    raise exception 'INVALID_GUEST_NAME';
  end if;
  if p_guest_email is not null and char_length(p_guest_email) > 254 then
    raise exception 'INVALID_GUEST_EMAIL';
  end if;
  if p_guest_note is not null and char_length(p_guest_note) > 2000 then
    raise exception 'INVALID_GUEST_NOTE';
  end if;
  if p_intended_payment_method is not null
    and p_intended_payment_method not in ('Venmo', 'Cash App') then
    raise exception 'INVALID_PAYMENT_METHOD';
  end if;
  if jsonb_typeof(coalesce(p_fixed_items, '[]'::jsonb)) <> 'array'
    or jsonb_typeof(coalesce(p_fund_items, '[]'::jsonb)) <> 'array' then
    raise exception 'INVALID_ITEMS';
  end if;
  if jsonb_array_length(coalesce(p_fixed_items, '[]'::jsonb))
    + jsonb_array_length(coalesce(p_fund_items, '[]'::jsonb)) = 0 then
    raise exception 'EMPTY_CLAIM';
  end if;

  select array_agg(item_id order by item_id)
  into v_requested_ids
  from (
    select (entry ->> 'item_id')::uuid as item_id
    from jsonb_array_elements(coalesce(p_fixed_items, '[]'::jsonb)) entry
    union all
    select (entry ->> 'item_id')::uuid as item_id
    from jsonb_array_elements(coalesce(p_fund_items, '[]'::jsonb)) entry
  ) requested;

  if cardinality(v_requested_ids) <> (
    select count(distinct requested_id) from unnest(v_requested_ids) requested_id
  ) then
    raise exception 'DUPLICATE_ITEM';
  end if;

  -- Lock every requested item in a deterministic order. Availability checks and
  -- inserts remain in this transaction, so two guests cannot claim the same
  -- last unit or overfund a fund.
  perform 1
  from public.items
  where id = any(v_requested_ids)
  order by id
  for update;

  foreach v_item_id in array v_requested_ids loop
    if not exists (select 1 from public.items where id = v_item_id) then
      raise exception 'ITEM_NOT_AVAILABLE';
    end if;
  end loop;

  for v_entry in select * from jsonb_array_elements(coalesce(p_fixed_items, '[]'::jsonb))
  loop
    v_item_id := (v_entry ->> 'item_id')::uuid;
    v_quantity := (v_entry ->> 'quantity')::integer;
    select * into strict v_item from public.items where id = v_item_id;
    if not v_item.is_active then raise exception 'ITEM_INACTIVE'; end if;
    if v_item.item_type <> 'fixed' then raise exception 'ITEM_TYPE_MISMATCH'; end if;
    if v_quantity < 1 then raise exception 'INVALID_QUANTITY'; end if;

    select coalesce(sum(ci.quantity), 0)::integer
    into v_claimed
    from public.claim_items ci
    join public.claims c on c.id = ci.claim_id
    where ci.item_id = v_item_id
      and c.status in ('claimed', 'paid', 'purchased');

    if v_claimed + v_quantity > v_item.quantity_needed then
      raise exception 'ITEM_NOT_AVAILABLE';
    end if;
    v_total_usd := v_total_usd + (v_item.price_usd * v_quantity);
    v_total_vnd := v_total_vnd + (v_item.price_vnd * v_quantity);
  end loop;

  for v_entry in select * from jsonb_array_elements(coalesce(p_fund_items, '[]'::jsonb))
  loop
    v_item_id := (v_entry ->> 'item_id')::uuid;
    v_contribution_usd := round((v_entry ->> 'contribution_usd')::numeric, 2);
    select * into strict v_item from public.items where id = v_item_id;
    if not v_item.is_active then raise exception 'ITEM_INACTIVE'; end if;
    if v_item.item_type <> 'fund' then raise exception 'ITEM_TYPE_MISMATCH'; end if;
    if v_contribution_usd <= 0 then raise exception 'INVALID_CONTRIBUTION'; end if;

    select coalesce(sum(ci.contribution_usd), 0)
    into v_funded_usd
    from public.claim_items ci
    join public.claims c on c.id = ci.claim_id
    where ci.item_id = v_item_id
      and c.status in ('claimed', 'paid', 'purchased');

    if v_funded_usd + v_contribution_usd > v_item.fund_target_usd then
      raise exception 'FUND_NOT_AVAILABLE';
    end if;
    v_contribution_vnd := round(
      v_contribution_usd * v_item.fund_target_vnd / v_item.fund_target_usd
    );
    v_total_usd := v_total_usd + v_contribution_usd;
    v_total_vnd := v_total_vnd + v_contribution_vnd;
  end loop;

  insert into public.claims (
    id, guest_name, guest_email, guest_note, intended_payment_method,
    status, total_usd, total_vnd
  ) values (
    v_claim_id, p_guest_name, p_guest_email, p_guest_note,
    p_intended_payment_method, 'claimed', v_total_usd, v_total_vnd
  );

  for v_entry in select * from jsonb_array_elements(coalesce(p_fixed_items, '[]'::jsonb))
  loop
    v_item_id := (v_entry ->> 'item_id')::uuid;
    v_quantity := (v_entry ->> 'quantity')::integer;
    select * into strict v_item from public.items where id = v_item_id;
    insert into public.claim_items (
      claim_id, item_id, quantity, unit_price_usd, unit_price_vnd
    ) values (
      v_claim_id, v_item_id, v_quantity, v_item.price_usd, v_item.price_vnd
    );
  end loop;

  for v_entry in select * from jsonb_array_elements(coalesce(p_fund_items, '[]'::jsonb))
  loop
    v_item_id := (v_entry ->> 'item_id')::uuid;
    v_contribution_usd := round((v_entry ->> 'contribution_usd')::numeric, 2);
    select * into strict v_item from public.items where id = v_item_id;
    v_contribution_vnd := round(
      v_contribution_usd * v_item.fund_target_vnd / v_item.fund_target_usd
    );
    insert into public.claim_items (
      claim_id, item_id, contribution_usd, contribution_vnd
    ) values (
      v_claim_id, v_item_id, v_contribution_usd, v_contribution_vnd
    );
  end loop;

  insert into public.activity_events (
    event_type, claim_id, message, metadata
  ) values (
    'claim_created',
    v_claim_id,
    'A new gift claim was created.',
    jsonb_build_object('total_usd', v_total_usd, 'total_vnd', v_total_vnd)
  );

  return v_claim_id;
end;
$$;

revoke all on function public.create_registry_claim(text, text, text, text, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_registry_claim(text, text, text, text, jsonb, jsonb)
  to service_role;

create or replace function public.admin_update_claim(
  p_claim_id uuid,
  p_guest_name text,
  p_guest_email text,
  p_guest_note text,
  p_intended_payment_method text,
  p_status text,
  p_admin_note text,
  p_lines jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_old_claim public.claims%rowtype;
  v_line jsonb;
  v_claim_item public.claim_items%rowtype;
  v_item public.items%rowtype;
  v_quantity integer;
  v_contribution_usd numeric(14, 2);
  v_contribution_vnd numeric(18, 0);
  v_other_claimed integer;
  v_other_funded numeric(14, 2);
  v_total_usd numeric(14, 2) := 0;
  v_total_vnd numeric(18, 0) := 0;
begin
  select * into strict v_old_claim from public.claims where id = p_claim_id for update;
  p_guest_name := trim(coalesce(p_guest_name, ''));
  p_guest_email := nullif(trim(coalesce(p_guest_email, '')), '');
  p_guest_note := nullif(trim(coalesce(p_guest_note, '')), '');
  p_admin_note := nullif(trim(coalesce(p_admin_note, '')), '');

  if char_length(p_guest_name) not between 1 and 120 then raise exception 'INVALID_GUEST_NAME'; end if;
  if p_intended_payment_method is not null
    and p_intended_payment_method not in ('Venmo', 'Cash App') then
    raise exception 'INVALID_PAYMENT_METHOD';
  end if;
  if p_status not in ('claimed', 'paid', 'purchased', 'cancelled') then
    raise exception 'INVALID_STATUS';
  end if;
  if jsonb_typeof(p_lines) <> 'array' then raise exception 'INVALID_LINES'; end if;

  perform 1
  from public.items i
  join public.claim_items ci on ci.item_id = i.id
  where ci.claim_id = p_claim_id
  order by i.id
  for update of i;

  if jsonb_array_length(p_lines) <> (
    select count(*) from public.claim_items where claim_id = p_claim_id
  ) then
    raise exception 'INVALID_LINES';
  end if;

  for v_line in select * from jsonb_array_elements(p_lines)
  loop
    select * into strict v_claim_item
    from public.claim_items
    where id = (v_line ->> 'claim_item_id')::uuid and claim_id = p_claim_id;
    select * into strict v_item from public.items where id = v_claim_item.item_id;

    if v_item.item_type = 'fixed' then
      v_quantity := (v_line ->> 'quantity')::integer;
      if v_quantity < 1 then raise exception 'INVALID_QUANTITY'; end if;
      if p_status in ('claimed', 'paid', 'purchased') then
        select coalesce(sum(ci.quantity), 0)::integer
        into v_other_claimed
        from public.claim_items ci
        join public.claims c on c.id = ci.claim_id
        where ci.item_id = v_item.id
          and ci.claim_id <> p_claim_id
          and c.status in ('claimed', 'paid', 'purchased');
        if v_other_claimed + v_quantity > v_item.quantity_needed then
          raise exception 'ITEM_NOT_AVAILABLE';
        end if;
      end if;
      update public.claim_items set quantity = v_quantity where id = v_claim_item.id;
      v_total_usd := v_total_usd + (v_claim_item.unit_price_usd * v_quantity);
      v_total_vnd := v_total_vnd + (v_claim_item.unit_price_vnd * v_quantity);
    else
      v_contribution_usd := round((v_line ->> 'contribution_usd')::numeric, 2);
      if v_contribution_usd <= 0 then raise exception 'INVALID_CONTRIBUTION'; end if;
      if p_status in ('claimed', 'paid', 'purchased') then
        select coalesce(sum(ci.contribution_usd), 0)
        into v_other_funded
        from public.claim_items ci
        join public.claims c on c.id = ci.claim_id
        where ci.item_id = v_item.id
          and ci.claim_id <> p_claim_id
          and c.status in ('claimed', 'paid', 'purchased');
        if v_other_funded + v_contribution_usd > v_item.fund_target_usd then
          raise exception 'FUND_NOT_AVAILABLE';
        end if;
      end if;
      v_contribution_vnd := round(
        v_contribution_usd * v_item.fund_target_vnd / v_item.fund_target_usd
      );
      update public.claim_items
      set contribution_usd = v_contribution_usd,
          contribution_vnd = v_contribution_vnd
      where id = v_claim_item.id;
      v_total_usd := v_total_usd + v_contribution_usd;
      v_total_vnd := v_total_vnd + v_contribution_vnd;
    end if;
  end loop;

  update public.claims
  set guest_name = p_guest_name,
      guest_email = p_guest_email,
      guest_note = p_guest_note,
      intended_payment_method = p_intended_payment_method,
      status = p_status,
      admin_note = p_admin_note,
      total_usd = v_total_usd,
      total_vnd = v_total_vnd
  where id = p_claim_id;

  insert into public.activity_events (
    event_type, claim_id, message, metadata
  ) values (
    case when v_old_claim.status <> p_status then 'claim_status_changed' else 'claim_edited' end,
    p_claim_id,
    case
      when v_old_claim.status <> p_status
        then 'Claim status changed from ' || v_old_claim.status || ' to ' || p_status || '.'
      else 'Claim details were edited.'
    end,
    jsonb_build_object('old_status', v_old_claim.status, 'new_status', p_status)
  );
end;
$$;

revoke all on function public.admin_update_claim(uuid, text, text, text, text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.admin_update_claim(uuid, text, text, text, text, text, text, jsonb)
  to service_role;

commit;
