-- Concern: Ask Debby chat history
CREATE TYPE public.chat_role AS ENUM ('user', 'assistant');

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.chat_role NOT NULL,
  content text NOT NULL,
  safety_triggered boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Owner can read. No insert/update/delete policies: only the service role writes.
CREATE POLICY "Owner can read her messages"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX chat_messages_user_id_idx ON public.chat_messages (user_id);
CREATE INDEX chat_messages_user_id_created_at_idx ON public.chat_messages (user_id, created_at);

CREATE TABLE public.chat_summaries (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  summary text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.chat_summaries TO authenticated;
GRANT ALL ON public.chat_summaries TO service_role;

ALTER TABLE public.chat_summaries ENABLE ROW LEVEL SECURITY;

-- Owner can read. Only the service role writes.
CREATE POLICY "Owner can read her chat summary"
  ON public.chat_summaries FOR SELECT TO authenticated
  USING (auth.uid() = user_id);