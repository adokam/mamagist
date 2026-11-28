// Types and pure helpers for Ask Debby multi-chat.
// src/integrations/supabase/types.ts is generated — do not edit it by hand —
// so the chat tables live here and the chat code uses debbySupabase, the
// same client with the chat tables added. The backend (chats table,
// chat_messages.chat_id, chat_summaries) was applied by hand in Supabase;
// the history is recorded in supabase/migrations/20261128120000_*.
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ChatRow = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessageRow = {
  id: string;
  user_id: string;
  chat_id: string | null;
  role: "user" | "assistant";
  content: string;
  safety_triggered: boolean;
  created_at: string;
};

export type ChatSummaryRow = {
  user_id: string;
  summary: string | null;
  updated_at: string;
};

export type DebbyChatTables = {
  chats: {
    Row: ChatRow;
    Insert: { id?: string; user_id: string; title: string; created_at?: string; updated_at?: string };
    Update: Partial<{ title: string; updated_at: string }>;
    Relationships: [];
  };
  chat_messages: {
    Row: ChatMessageRow;
    Insert: {
      id?: string;
      user_id: string;
      chat_id?: string | null;
      role: "user" | "assistant";
      content: string;
      safety_triggered?: boolean;
      created_at?: string;
    };
    Update: Partial<{ content: string; safety_triggered: boolean }>;
    Relationships: [];
  };
  chat_summaries: {
    Row: ChatSummaryRow;
    Insert: { user_id: string; summary?: string | null; updated_at?: string };
    Update: Partial<{ summary: string | null; updated_at: string }>;
    Relationships: [];
  };
};

export type DebbyChatDatabase = {
  __InternalSupabase: Database["__InternalSupabase"];
  public: {
    Tables: Database["public"]["Tables"] & DebbyChatTables;
    Views: Database["public"]["Views"];
    Functions: Database["public"]["Functions"];
    Enums: Database["public"]["Enums"];
    CompositeTypes: Database["public"]["CompositeTypes"];
  };
};

/** The shared Supabase client, typed with the chat tables added. */
export const debbySupabase = supabase as unknown as SupabaseClient<DebbyChatDatabase>;

/**
 * What tapping Debby in the bottom bar should do. Opening Debby always
 * starts a new empty chat — except when she is already on a Debby screen,
 * where tapping it changes nothing.
 */
export function debbyTabAction(currentPath: string): "stay" | "new-chat" {
  return currentPath === "/debby" || currentPath.startsWith("/debby/")
    ? "stay"
    : "new-chat";
}
