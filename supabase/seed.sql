insert into public.items (
  id, title, description, image_path, category, item_type,
  price_usd, price_vnd, quantity_needed,
  fund_target_usd, fund_target_vnd, is_active, sort_order
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'Pigeon glass bottles',
    'A practical set of glass bottles for the everyday feeding rotation.',
    '/products/placeholder.png', 'Feeding', 'fixed',
    42, 1092000, 2, null, null, true, 1
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Baby bouncer',
    'A cozy, supportive place for Eva Vy to relax close by.',
    '/products/placeholder.png', 'Nursery', 'fixed',
    110, 2860000, 1, null, null, true, 2
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Changing table',
    'A simple changing station with room for diapers and daily essentials.',
    '/products/placeholder.png', 'Nursery', 'fixed',
    165, 4290000, 1, null, null, true, 3
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
    'Crib mattress',
    'A firm, breathable mattress for restful nights.',
    '/products/placeholder.png', 'Sleep', 'fixed',
    145, 3770000, 1, null, null, true, 6
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    'Stroller fund',
    'Help us choose a safe, comfortable stroller for family walks.',
    '/products/placeholder.png', 'On the go', 'fund',
    null, null, null, 650, 16900000, true, 7
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    'Crib fund',
    'Contribute toward a sturdy crib that can grow with Eva Vy.',
    '/products/placeholder.png', 'Sleep', 'fund',
    null, null, null, 500, 13000000, true, 8
  ),
  (
    '99999999-9999-4999-8999-999999999999',
    'Hospital & postpartum fund',
    'Support meals, recovery supplies, and the first days at home.',
    '/products/placeholder.png', 'Family care', 'fund',
    null, null, null, 800, 20800000, true, 9
  )
on conflict (id) do nothing;
