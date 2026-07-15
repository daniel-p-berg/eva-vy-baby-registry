begin;

update public.claims
set intended_payment_method = 'Venmo'
where intended_payment_method in ('PayPal', 'Not sure yet');

alter table public.claims
  drop constraint if exists claims_intended_payment_method_check;

alter table public.claims
  add constraint claims_intended_payment_method_check
  check (intended_payment_method in ('Venmo', 'Cash App'));

commit;
