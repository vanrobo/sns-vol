-- Grievance resolve notifications are created in resolveGrievance() (app code).
-- Drop the DB trigger so volunteers do not get duplicate alerts on fresh installs.
drop trigger if exists grievances_notify on public.grievances;
