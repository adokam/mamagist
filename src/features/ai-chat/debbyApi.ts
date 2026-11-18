// The only place that talks to Debby: the debby-chat edge function. No keys here.
import { FunctionsHttpError } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

import { debbyReplyState, type DebbyReplyState } from "./debbyResponse";

export async function askDebby(message: string): Promise<DebbyReplyState> {
  try {
    const { data, error } = await supabase.functions.invoke("debby-chat", { body: { message } });
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
