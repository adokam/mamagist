// Renaming and deleting her own chats. Only the title column is ever
// updated; deleting a chat also deletes its messages (backend cascade).
// These throw when nothing was saved, so the screen can show a friendly
// error instead of pretending it worked.
import { debbySupabase } from "./debbyChats";

/** Rename her own chat. The title column only — RLS allows nothing else. */
export async function renameDebbyChat(
  userId: string,
  chatId: string,
  title: string,
): Promise<void> {
  const { data, error } = await debbySupabase
    .from("chats")
    .update({ title })
    .eq("id", chatId)
    .eq("user_id", userId)
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No chat was renamed");
}

/** Delete her own chat. Its messages go with it. */
export async function deleteDebbyChat(userId: string, chatId: string): Promise<void> {
  const { error } = await debbySupabase
    .from("chats")
    .delete()
    .eq("id", chatId)
    .eq("user_id", userId);
  if (error) throw error;
}
