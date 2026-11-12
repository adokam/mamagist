-- Concern: daily checklist (tasks + completions)
CREATE TABLE public.daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  stage public.life_stage NOT NULL,
  trimester smallint,
  min_week smallint,
  max_week smallint,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.daily_tasks TO authenticated;
GRANT ALL ON public.daily_tasks TO service_role;

ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can read active tasks"
  ON public.daily_tasks FOR SELECT TO authenticated
  USING (is_active = true);

CREATE TABLE public.task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.daily_tasks(id) ON DELETE CASCADE,
  completed_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_id, completed_on)
);

GRANT SELECT, INSERT, DELETE ON public.task_completions TO authenticated;
GRANT ALL ON public.task_completions TO service_role;

ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read her completions"
  ON public.task_completions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can insert her completions"
  ON public.task_completions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete her completions"
  ON public.task_completions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX task_completions_user_id_idx ON public.task_completions (user_id);
CREATE INDEX task_completions_user_id_completed_on_idx ON public.task_completions (user_id, completed_on);
CREATE INDEX task_completions_task_id_idx ON public.task_completions (task_id);