// Types for the community tables (migration 20261126090000).
// src/integrations/supabase/types.ts is generated — do not edit it by hand —
// so the community tables live here and the community code uses
// communitySupabase, the same client with the community tables added.
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type CommunityPostRow = {
  id: string;
  user_id: string;
  group_id: string | null;
  body: string;
  image_url: string | null;
  created_at: string;
};

export type CommunityPostInsert = {
  id?: string;
  user_id: string;
  group_id?: string | null;
  body?: string;
  image_url?: string | null;
  created_at?: string;
};

export type CommunityGroupRow = {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
};

export type CommunityGroupInsert = {
  id?: string;
  name: string;
  description?: string;
  created_by: string;
  created_at?: string;
};

export type CommunityGroupMemberRow = {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
};

export type CommunityGroupMemberInsert = {
  id?: string;
  group_id: string;
  user_id: string;
  role?: string;
  joined_at?: string;
};

export type CommunityPostLikeRow = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type CommunityCommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export type CommunityCommentInsert = {
  id?: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at?: string;
};

export type CommunityReportInsert = {
  id?: string;
  post_id?: string | null;
  reported_user_id?: string | null;
  reason?: string;
  created_by: string;
  created_at?: string;
};

export type CommunityTables = {
  community_groups: {
    Row: CommunityGroupRow;
    Insert: CommunityGroupInsert;
    Update: Partial<CommunityGroupInsert>;
    Relationships: [];
  };
  community_group_members: {
    Row: CommunityGroupMemberRow;
    Insert: CommunityGroupMemberInsert;
    Update: Partial<CommunityGroupMemberInsert>;
    Relationships: [];
  };
  community_posts: {
    Row: CommunityPostRow;
    Insert: CommunityPostInsert;
    Update: Partial<CommunityPostInsert>;
    Relationships: [];
  };
  community_post_likes: {
    Row: CommunityPostLikeRow;
    Insert: { id?: string; post_id: string; user_id: string; created_at?: string };
    Update: Partial<{ post_id: string; user_id: string }>;
    Relationships: [];
  };
  community_comments: {
    Row: CommunityCommentRow;
    Insert: CommunityCommentInsert;
    Update: Partial<CommunityCommentInsert>;
    Relationships: [];
  };
  community_reports: {
    Row: {
      id: string;
      post_id: string | null;
      reported_user_id: string | null;
      reason: string;
      created_by: string;
      created_at: string;
    };
    Insert: CommunityReportInsert;
    Update: Partial<CommunityReportInsert>;
    Relationships: [];
  };
};

export type CommunityDatabase = {
  __InternalSupabase: Database["__InternalSupabase"];
  public: {
    Tables: Database["public"]["Tables"] & CommunityTables;
    Views: Database["public"]["Views"];
    Functions: Database["public"]["Functions"];
    Enums: Database["public"]["Enums"];
    CompositeTypes: Database["public"]["CompositeTypes"];
  };
};

/** The shared Supabase client, typed with the community tables added. */
export const communitySupabase = supabase as unknown as SupabaseClient<CommunityDatabase>;
