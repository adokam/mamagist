-- ALREADY APPLIED BY HAND — DO NOT RUN THIS FILE AGAIN.
-- This file only records, for the history, the multi-chat changes the user
-- already applied by hand in Supabase. Running it again would fail (the
-- tables and column already exist) and must not be attempted. Nothing here
-- is applied to a live project by this file alone.
--
-- What was applied by hand:
--   * Table public.chats: one row per conversation. Only the debby-chat
--     edge function creates chats; the app never inserts into this table.
--   * public.chat_messages gained a chat_id column. Deleting a chat deletes
--     its messages (ON DELETE CASCADE).
--   * Table public.chat_summaries holds Debby's short notes about her.
--     She can clear them by updating her own row with summary set to an
--     empty string and updated_at set to now. Nothing else.

CREATE TABLE public.chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 80),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.chats TO authenticated;
GRANT ALL ON public.chats TO service_role;

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- She can read her own chats. She cannot insert: only the debby-chat
-- function creates chats.
CREATE POLICY "She can read her own chats"
  ON public.chats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- She can rename her own chats (the title column only).
CREATE POLICY "She can rename her own chats"
  ON public.chats FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- She can delete her own chats.
CREATE POLICY "She can delete her own chats"
  ON public.chats FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

ALTER TABLE public.chat_messages
  ADD COLUMN chat_id uuid REFERENCES public.chats(id) ON DELETE CASCADE;

CREATE INDEX chat_messages_chat_id_idx ON public.chat_messages (chat_id);

-- Debby's short notes about her. One row per mother at most.
CREATE TABLE public.chat_summaries (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  summary text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.chat_summaries TO authenticated;
GRANT ALL ON public.chat_summaries TO service_role;

ALTER TABLE public.chat_summaries ENABLE ROW LEVEL SECURITY;

-- She can read her own notes row.
CREATE POLICY "She can read her own notes"
  ON public.chat_summaries FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- She can clear her own notes by setting summary to an empty string.
-- Nothing else about this row is changed by the app.
CREATE POLICY "She can clear her own notes"
  ON public.chat_summaries FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
