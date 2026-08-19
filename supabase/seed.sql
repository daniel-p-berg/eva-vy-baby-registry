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
    'BabyBjörn Bouncer Bliss fund',
    'An ergonomic mesh bouncer with natural baby-powered rocking, three recline positions, and a lightweight frame that folds flat for moving or storage.',
    '/products/babybjorn-bouncer-bliss.jpg', 'Nursery', 'fund',
    null, null, null, 212, 5500000, true, 2
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Foldable changing table fund',
    'A practical height-adjustable changing station with a wipe-clean top, side organizer, lower shelf, and lockable wheels.',
    '/products/foldable-changing-table.jpg', 'Nursery', 'fund',
    null, null, null, 37, 950000, true, 3
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Stokke Flexi Bath Bundle',
    'A foldable baby bath with a newborn support seat, non-slip base, and heat-sensitive drain plug for bathing from birth through the toddler years.',
    '/products/stokke-flexi-bath-bundle.jpg', 'Bath', 'fixed',
    84, 2190000, 1, null, null, true, 4
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'MOOIMOM baby essentials tote',
    'A lightweight, water-resistant carryall with roomy compartments for bottles, diapers, wipes, spare clothes, and everyday baby gear.',
    '/products/mooimom-baby-essentials-tote.jpg', 'Everyday', 'fixed',
    25, 649000, 1, null, null, true, 5
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'Crib mattress',
    'A firm, flat crib mattress for a wooden cot, with a lightly quilted surface and simple neutral finish.',
    '/products/crib-mattress.jpg', 'Sleep', 'fixed',
    19, 500000, 2, null, null, true, 6
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
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Baby Brezza Bottle Washer Pro fund',
    'An all-in-one countertop machine that washes up to four bottles and pump parts, then steam-sterilizes and hot-air dries them in one cycle.',
    '/products/baby-brezza-bottle-washer.jpg', 'Feeding', 'fund',
    null, null, null, 269, 6990000, true, 10
  )
on conflict (id) do nothing;
