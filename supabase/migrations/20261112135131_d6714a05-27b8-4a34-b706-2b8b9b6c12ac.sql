-- Concern: remove unused role-check helper (not needed in Step 1; flagged by the security linter)
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);