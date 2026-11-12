-- Concern: "notify me" waiting list (e.g. community launch)
CREATE TABLE public.notify_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL DEFAULT 'community',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic)
);

GRANT SELECT, INSERT ON public.notify_list TO authenticated;
GRANT ALL ON public.notify_list TO service_role;

ALTER TABLE public.notify_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read her notify rows"
  ON public.notify_list FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can insert her notify rows"
  ON public.notify_list FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX notify_list_user_id_idx ON public.notify_list (user_id);