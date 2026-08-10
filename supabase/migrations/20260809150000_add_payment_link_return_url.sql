-- PayFlow public API integration: return URL for hosted payment links.
alter table if exists public.payment_links
  add column if not exists return_url text;

create index if not exists payment_links_link_id_idx
  on public.payment_links (link_id);
