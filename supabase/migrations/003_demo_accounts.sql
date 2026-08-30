-- Demo accounts for SNS Vol (password for all: SnsDemo2026!)
-- Emails: demo-admin@sns-vol.demo, demo-organiser@sns-vol.demo, demo-volunteer@sns-vol.demo

create extension if not exists pgcrypto;

do $$
declare
  admin_id uuid := 'a0000001-0000-4000-8000-000000000001';
  org_id uuid := 'a0000002-0000-4000-8000-000000000002';
  vol_id uuid := 'a0000003-0000-4000-8000-000000000003';
  demo_pw text := crypt('SnsDemo2026!', gen_salt('bf'));
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) values
    (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'demo-admin@sns-vol.demo', demo_pw, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Demo Admin","college":"SNS HQ"}'::jsonb,
      now(), now(), '', '', '', ''
    ),
    (
      org_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'demo-organiser@sns-vol.demo', demo_pw, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Demo Organiser","college":"SNS HQ"}'::jsonb,
      now(), now(), '', '', '', ''
    ),
    (
      vol_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'demo-volunteer@sns-vol.demo', demo_pw, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Demo Volunteer","college":"Demo College"}'::jsonb,
      now(), now(), '', '', '', ''
    )
  on conflict (id) do nothing;

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values
    (
      admin_id, admin_id, admin_id::text,
      jsonb_build_object('sub', admin_id::text, 'email', 'demo-admin@sns-vol.demo'),
      'email', now(), now(), now()
    ),
    (
      org_id, org_id, org_id::text,
      jsonb_build_object('sub', org_id::text, 'email', 'demo-organiser@sns-vol.demo'),
      'email', now(), now(), now()
    ),
    (
      vol_id, vol_id, vol_id::text,
      jsonb_build_object('sub', vol_id::text, 'email', 'demo-volunteer@sns-vol.demo'),
      'email', now(), now(), now()
    )
  on conflict do nothing;

  alter table public.profiles disable trigger profiles_protect_admin_fields;

  insert into public.profiles (id, name, college, role, status, volunteer_id, valid_until)
  values
    (admin_id, 'Demo Admin', 'SNS HQ', 'admin', 'active', 'SNS-VOL-DEMO-ADMIN', '2027-12-31'),
    (org_id, 'Demo Organiser', 'SNS HQ', 'organiser', 'active', null, null),
    (vol_id, 'Demo Volunteer', 'Demo College', 'volunteer', 'active', 'SNS-VOL-DEMO-001', '2027-12-31')
  on conflict (id) do update set
    name = excluded.name,
    college = excluded.college,
    role = excluded.role,
    status = excluded.status,
    volunteer_id = excluded.volunteer_id,
    valid_until = excluded.valid_until;

  alter table public.profiles enable trigger profiles_protect_admin_fields;
end $$;
