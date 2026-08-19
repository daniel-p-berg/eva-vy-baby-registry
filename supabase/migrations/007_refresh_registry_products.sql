begin;

update public.items
set title = 'BabyBjörn Bouncer Bliss fund',
    description = 'An ergonomic mesh bouncer with natural baby-powered rocking, three recline positions, and a lightweight frame that folds flat for moving or storage.',
    image_path = '/products/babybjorn-bouncer-bliss.jpg',
    category = 'Nursery',
    item_type = 'fund',
    price_usd = null,
    price_vnd = null,
    quantity_needed = null,
    fund_target_usd = 212,
    fund_target_vnd = 5500000,
    is_active = true,
    updated_at = now()
where id = '22222222-2222-4222-8222-222222222222';

update public.items
set title = 'Foldable changing table fund',
    description = 'A practical height-adjustable changing station with a wipe-clean top, side organizer, lower shelf, and lockable wheels.',
    image_path = '/products/foldable-changing-table.jpg',
    category = 'Nursery',
    item_type = 'fund',
    price_usd = null,
    price_vnd = null,
    quantity_needed = null,
    fund_target_usd = 37,
    fund_target_vnd = 950000,
    is_active = true,
    updated_at = now()
where id = '33333333-3333-4333-8333-333333333333';

update public.items
set title = 'Baby bathtub',
    description = 'A roomy PP baby tub with a removable support seat, non-slip handholds, and an easy-drain plug for simpler newborn bath time.',
    image_path = '/products/baby-bathtub.jpg',
    category = 'Bath',
    item_type = 'fixed',
    price_usd = 15,
    price_vnd = 400000,
    quantity_needed = 1,
    fund_target_usd = null,
    fund_target_vnd = null,
    is_active = true,
    updated_at = now()
where id = '44444444-4444-4444-8444-444444444444';

update public.items
set title = 'Diaper caddy',
    description = 'A portable organizer with divided compartments and outer pockets for diapers, wipes, creams, and other changing essentials.',
    image_path = '/products/diaper-caddy.jpg',
    category = 'Everyday',
    item_type = 'fixed',
    price_usd = 7,
    price_vnd = 190000,
    quantity_needed = 1,
    fund_target_usd = null,
    fund_target_vnd = null,
    is_active = true,
    updated_at = now()
where id = '55555555-5555-4555-8555-555555555555';

update public.items
set title = 'Crib mattress fund',
    description = 'A firm, flat crib mattress for a wooden cot, with a lightly quilted surface and simple neutral finish.',
    image_path = '/products/crib-mattress.jpg',
    category = 'Sleep',
    item_type = 'fund',
    price_usd = null,
    price_vnd = null,
    quantity_needed = null,
    fund_target_usd = 19,
    fund_target_vnd = 500000,
    is_active = true,
    updated_at = now()
where id = '66666666-6666-4666-8666-666666666666';

insert into public.items (
  id, title, description, image_path, category, item_type,
  price_usd, price_vnd, quantity_needed,
  fund_target_usd, fund_target_vnd, is_active, sort_order
) values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'Baby Brezza Bottle Washer Pro fund',
  'An all-in-one countertop machine that washes up to four bottles and pump parts, then steam-sterilizes and hot-air dries them in one cycle.',
  '/products/baby-brezza-bottle-washer.jpg', 'Feeding', 'fund',
  null, null, null, 269, 6990000, true, 10
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

-- Hide this fund from the public registry while preserving any historical records.
update public.items
set is_active = false,
    updated_at = now()
where id = '99999999-9999-4999-8999-999999999999';

commit;
