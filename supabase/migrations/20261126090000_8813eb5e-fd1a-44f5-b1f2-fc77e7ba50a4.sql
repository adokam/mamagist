-- Concern: community foundation — groups, group members, posts, likes,
-- comments, reports, and the photo bucket. The app reads and writes these
-- through the Supabase client; nothing here is applied to a live project
-- by this file alone (run `supabase db push`, or apply it in the dashboard).

CREATE TABLE public.community_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_groups TO authenticated;
GRANT ALL ON public.community_groups TO service_role;

ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

-- Any signed-in mother can see all groups and create one.
CREATE POLICY "Anyone signed in can read groups"
  ON public.community_groups FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Anyone signed in can create a group"
  ON public.community_groups FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Only the creator can change or delete her own group.
CREATE POLICY "Creator can update her group"
  ON public.community_groups FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can delete her group"
  ON public.community_groups FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

CREATE TABLE public.community_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.community_group_members TO authenticated;
GRANT ALL ON public.community_group_members TO service_role;

ALTER TABLE public.community_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can read group members"
  ON public.community_group_members FOR SELECT TO authenticated
  USING (true);

-- Joining: a mother can only add her own membership row.
CREATE POLICY "A mother can join a group"
  ON public.community_group_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Leaving: a mother can remove her own membership row.
CREATE POLICY "A member can leave a group"
  ON public.community_group_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Removing people: the group admin (creator) can remove any member row
-- of her group. She cannot remove herself through the app.
CREATE POLICY "Group admin can remove members"
  ON public.community_group_members FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.community_group_members admin
      WHERE admin.group_id = community_group_members.group_id
        AND admin.user_id = auth.uid()
        AND admin.role = 'admin'
    )
  );

CREATE INDEX community_group_members_group_id_idx
  ON public.community_group_members (group_id);

CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.community_groups(id) ON DELETE CASCADE,
  body text NOT NULL DEFAULT '',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- A post must have words, a photo, or both. NULL group_id is the big feed.
  CHECK (body <> '' OR image_url IS NOT NULL)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can read posts"
  ON public.community_posts FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "A mother can post as herself"
  ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update her post"
  ON public.community_posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete her post"
  ON public.community_posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX community_posts_group_created_idx
  ON public.community_posts (group_id, created_at DESC);
CREATE INDEX community_posts_user_id_idx
  ON public.community_posts (user_id);

CREATE TABLE public.community_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.community_post_likes TO authenticated;
GRANT ALL ON public.community_post_likes TO service_role;

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can read likes"
  ON public.community_post_likes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "A mother can like as herself"
  ON public.community_post_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "A mother can unlike her own like"
  ON public.community_post_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX community_post_likes_post_id_idx
  ON public.community_post_likes (post_id);

CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.community_comments TO authenticated;
GRANT ALL ON public.community_comments TO service_role;

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can read comments"
  ON public.community_comments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "A mother can comment as herself"
  ON public.community_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete her comment"
  ON public.community_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX community_comments_post_created_idx
  ON public.community_comments (post_id, created_at);

-- Reports are for moderation later. Mothers can file one, but nobody in
-- the app can read them — only the service role can.
CREATE TABLE public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT '',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.community_reports TO authenticated;
GRANT ALL ON public.community_reports TO service_role;

ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "A mother can report as herself"
  ON public.community_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Photo storage for community posts. Photos are public to read (anyone
-- with the link can see a post photo); only a signed-in mother can upload,
-- only into a folder named with her own user id, images only.
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read community photos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'community-images');

CREATE POLICY "A mother can upload her post photo"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'community-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif')
  );

CREATE POLICY "A mother can replace her post photo"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'community-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'community-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif')
  );

CREATE POLICY "A mother can delete her post photo"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'community-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
