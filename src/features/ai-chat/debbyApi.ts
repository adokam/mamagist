// The only place that talks to Debby: the debby-chat edge function. No keys here.
import { FunctionsHttpError } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

import { debbyReplyState, type DebbyReplyState } from "./debbyResponse";

/**
 * Sends her message to the debby-chat edge function. chatId is the open
 * chat, or null for the first message of a new chat — the function creates
 * the chat then and sends its id and title back in the reply.
 */
export async function askDebby(message: string, chatId: string | null): Promise<DebbyReplyState> {
  try {
    const { data, error } = await supabase.functions.invoke("debby-chat", {
      body: { message, chat_id: chatId },
    });
    if (!error) return debbyReplyState(data);
    // A non-2xx answer may still carry Debby's JSON (for example a limit reply).
    if (error instanceof FunctionsHttpError) {
      const body: unknown = await (error.context as Response).json().catch(() => null);
      return debbyReplyState(body);
    }
    return debbyReplyState(null);
  } catch {
    return debbyReplyState(null);
  }
}
