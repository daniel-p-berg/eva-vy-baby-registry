begin;

alter table public.claims
  alter column intended_payment_method drop not null;

commit;
