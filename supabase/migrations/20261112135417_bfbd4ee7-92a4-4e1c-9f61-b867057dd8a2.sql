-- Concern: weekly pregnancy content (weeks 1 to 42)
CREATE TABLE public.weekly_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week smallint NOT NULL CHECK (week BETWEEN 1 AND 42),
  title text NOT NULL,
  body text,
  tip text,
  source_name text,
  source_url text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.weekly_content TO authenticated;
GRANT ALL ON public.weekly_content TO service_role;

ALTER TABLE public.weekly_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can read weekly content"
  ON public.weekly_content FOR SELECT TO authenticated
  USING (true);