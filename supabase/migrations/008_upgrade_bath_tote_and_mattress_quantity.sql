begin;

update public.items
set title = 'Stokke Flexi Bath Bundle',
    description = 'A foldable baby bath with a newborn support seat, non-slip base, and heat-sensitive drain plug for bathing from birth through the toddler years.',
    image_path = '/products/stokke-flexi-bath-bundle.jpg',
    category = 'Bath',
    item_type = 'fixed',
    price_usd = 84,
    price_vnd = 2190000,
    quantity_needed = 1,
    fund_target_usd = null,
    fund_target_vnd = null,
    is_active = true,
    updated_at = now()
where id = '44444444-4444-4444-8444-444444444444';

update public.items
set title = 'MOOIMOM baby essentials tote',
    description = 'A lightweight, water-resistant carryall with roomy compartments for bottles, diapers, wipes, spare clothes, and everyday baby gear.',
    image_path = '/products/mooimom-baby-essentials-tote.jpg',
    category = 'Everyday',
    item_type = 'fixed',
    price_usd = 25,
    price_vnd = 649000,
    quantity_needed = 1,
    fund_target_usd = null,
    fund_target_vnd = null,
    is_active = true,
    updated_at = now()
where id = '55555555-5555-4555-8555-555555555555';

update public.items
set title = 'Crib mattress',
    description = 'A firm, flat crib mattress for a wooden cot, with a lightly quilted surface and simple neutral finish.',
    image_path = '/products/crib-mattress.jpg',
    category = 'Sleep',
    item_type = 'fixed',
    price_usd = 19,
    price_vnd = 500000,
    quantity_needed = 2,
    fund_target_usd = null,
    fund_target_vnd = null,
    is_active = true,
    updated_at = now()
where id = '66666666-6666-4666-8666-666666666666';

commit;
