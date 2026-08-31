-- Track event reminder notifications per application (cron job)
alter table public.applications
  add column if not exists reminder_sent_at timestamptz;
