-- SNS Magazine, newsletters, and public document library

create table public.sns_publications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  pdf_url text not null,
  kind text not null check (kind in ('magazine', 'newsletter')),
  category text not null default 'general',
  published_on date not null default current_date,
  sort_order int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index sns_publications_kind_idx on public.sns_publications (kind, published_on desc);
create index sns_publications_category_idx on public.sns_publications (category);

alter table public.sns_publications enable row level security;

create policy "sns_publications_public_read"
  on public.sns_publications for select
  using (true);

create policy "sns_publications_admin_insert"
  on public.sns_publications for insert
  with check (public.is_admin());

create policy "sns_publications_admin_update"
  on public.sns_publications for update
  using (public.is_admin());

create policy "sns_publications_admin_delete"
  on public.sns_publications for delete
  using (public.is_admin());

insert into public.sns_publications (title, description, pdf_url, kind, category, published_on, sort_order)
values
  (
    'SNS Family Magazine — Sample Issue',
    'A sample magazine layout for the SNS Family digital library.',
    'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    'magazine',
    'general',
    '2026-01-15',
    1
  ),
  (
    'STEAM Education Guide',
    'Sample STEAM education resource for volunteers and centres.',
    'https://pdfobject.com/pdf/sample.pdf',
    'magazine',
    'steam',
    '2026-02-01',
    2
  ),
  (
    'Legal & Compliance Brief',
    'Sample legal reference document for NGO volunteers.',
    'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table.pdf',
    'magazine',
    'legal',
    '2026-03-01',
    3
  ),
  (
    'Newsletter — January 2026',
    'Monthly SNS Family newsletter for January 2026.',
    'https://pdfobject.com/pdf/sample.pdf',
    'newsletter',
    'general',
    '2026-01-01',
    10
  ),
  (
    'Newsletter — February 2026',
    'Monthly SNS Family newsletter for February 2026.',
    'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table.pdf',
    'newsletter',
    'general',
    '2026-02-01',
    11
  );
