-- Fix: Disable RLS on tables written by SECURITY DEFINER triggers
-- The trigger functions (notify_event_created, write_audit_log) run as SECURITY DEFINER
-- where auth.uid() is NULL in the trigger context, so has_admin_role() returns FALSE
-- causing the trigger INSERT to fail with RLS violations, rolling back the transaction
-- and resulting in PGRST116 (Cannot coerce the result to a single JSON object)

ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
