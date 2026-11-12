-- Concern: private profiles (private health data) + updated_at trigger
CREATE TYPE public.life_stage AS ENUM ('pregnant', 'new_mother', 'breastfeeding');

CREATE TABLE public.private_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  last_period_date date,
  due_date date,
  stage public.life_stage,
  first_baby boolean,
  state text,
  baby_birth_date date,
  timezone text NOT NULL DEFAULT 'Africa/Lagos',
  language text,
  reminders_enabled boolean NOT NULL DEFAULT false,
  reminder_time time,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.private_profiles TO authenticated;
GRANT ALL ON public.private_profiles TO service_role;

ALTER TABLE public.private_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read her private profile"
  ON public.private_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Owner can insert her private profile"
  ON public.private_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Owner can update her private profile"
  ON public.private_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Shared helper: keep updated_at current on every change
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_private_profiles_updated_at
  BEFORE UPDATE ON public.private_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();