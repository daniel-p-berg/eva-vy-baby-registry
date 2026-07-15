begin;

create table if not exists public.site_content (
  id text primary key check (id = 'home'),
  story_title text not null check (char_length(trim(story_title)) between 1 and 120),
  story_body text not null check (char_length(trim(story_body)) between 1 and 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;
revoke all on table public.site_content from anon, authenticated;

insert into public.site_content (id, story_title, story_body)
values (
  'home',
  'Our story so far',
  'A little space for our story—how we met, the places that shaped us, and the journey that led us to Eva Vy. We’ll add the photos here soon, ending with her first ultrasound.'
)
on conflict (id) do nothing;

commit;
