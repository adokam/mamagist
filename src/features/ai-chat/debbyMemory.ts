// Clearing what Debby remembers: the short notes she keeps about her.
// Updates her own chat_summaries row with an empty summary. When she has
// no row yet there is nothing to clear, so that counts as success. Her
// chats are never touched by this.
import { debbySupabase } from "./debbyChats";

/** Clear the short notes Debby keeps about her. Throws when it fails. */
export async function clearDebbyMemory(userId: string): Promise<void> {
  const { error } = await debbySupabase
    .from("chat_summaries")
    .update({ summary: "", updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
}
