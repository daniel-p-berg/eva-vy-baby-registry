begin;

update public.claims
set intended_payment_method = 'Venmo'
where intended_payment_method in ('PayPal', 'Not sure yet');

alter table public.claims
  drop constraint if exists claims_intended_payment_method_check;

alter table public.claims
  add constraint claims_intended_payment_method_check
  check (intended_payment_method in ('Venmo', 'Cash App'));

update public.claim_items
set contribution_usd = unit_price_usd * quantity,
    contribution_vnd = unit_price_vnd * quantity,
    quantity = null,
    unit_price_usd = null,
    unit_price_vnd = null
where item_id in (
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    '66666666-6666-4666-8666-666666666666',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  )
  and quantity is not null;

insert into public.items (
  id, title, description, image_path, category, item_type,
  price_usd, price_vnd, quantity_needed,
  fund_target_usd, fund_target_vnd, is_active, sort_order
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'Pigeon glass bottles',
    'A practical set of glass feeding bottles for the everyday rotation.',
    '/products/pigeon-glass-bottle.png', 'Feeding', 'fixed',
    40, 1040000, 2, null, null, true, 1
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Baby bouncer fund',
    'Help cover a cozy, supportive bouncer where Eva Vy can relax close by.',
    '/products/placeholder.png', 'Nursery', 'fund',
    null, null, null, 110, 2860000, true, 2
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Changing table fund',
    'Contribute toward a simple changing station with room for diapers and daily essentials.',
    '/products/placeholder.png', 'Nursery', 'fund',
    null, null, null, 165, 4290000, true, 3
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Baby bathtub',
    'A safe little tub for comfortable bath time.',
    '/products/placeholder.png', 'Bath', 'fixed',
    48, 1248000, 1, null, null, true, 4
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'Diaper caddy',
    'A portable organizer for diapers, wipes, and tiny necessities.',
    '/products/placeholder.png', 'Everyday', 'fixed',
    32, 832000, 2, null, null, true, 5
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'Crib mattress fund',
    'Help cover a firm, breathable mattress for restful nights.',
    '/products/placeholder.png', 'Sleep', 'fund',
    null, null, null, 145, 3770000, true, 6
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Ergobaby Omni baby carrier fund',
    'A breathable, ergonomic carrier for hands-free walks, errands, and newborn-to-toddler snuggles.',
    '/products/ergobaby-omni-carrier.png', 'On the go', 'fund',
    null, null, null, 200, 5200000, true, 7
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    'Chilux V1.6 stroller fund',
    'A multifunction stroller with bassinet-style recline, adjustable handle, and sturdy wheels for everyday outings.',
    '/products/chilux-v16-stroller.png', 'On the go', 'fund',
    null, null, null, 120, 3120000, true, 8
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    'Chilux Peace wooden crib fund',
    'A sturdy 6-mode wooden crib/cot that can grow with Eva Vy from sleepy newborn days into toddler routines.',
    '/products/chilux-peace-crib.png', 'Sleep', 'fund',
    null, null, null, 280, 7280000, true, 9
  ),
  (
    '99999999-9999-4999-8999-999999999999',
    'Hospital & postpartum fund',
    'Support meals, recovery supplies, and the first days at home.',
    '/products/placeholder.png', 'Family care', 'fund',
    null, null, null, 800, 20800000, true, 10
  )
on conflict (id) do update
set title = excluded.title,
    description = excluded.description,
    image_path = excluded.image_path,
    category = excluded.category,
    item_type = excluded.item_type,
    price_usd = excluded.price_usd,
    price_vnd = excluded.price_vnd,
    quantity_needed = excluded.quantity_needed,
    fund_target_usd = excluded.fund_target_usd,
    fund_target_vnd = excluded.fund_target_vnd,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order,
    updated_at = now();

commit;
