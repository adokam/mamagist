// Data for the Ask Debby screen. Reads only her own rows. Messages are kept in memory only.
import { queryOptions, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { useToday } from "@/features/daily-checklist/useToday";
import { parseIsoDate } from "@/features/pregnancy-calculator/calendarDate";
import { privateProfileKey } from "@/features/profile/privateProfile";
import { supabase } from "@/integrations/supabase/client";

import { askDebby } from "./debbyApi";
import { guideLine, MAX_MESSAGE_LENGTH, welcomeText } from "./debbyText";

const HISTORY_PAGE = 50;

export type ChatItem =
  | { id: string; from: "her"; text: string }
  | {
      id: string;
      from: "debby";
      text: string;
      tone: "normal" | "safety";
      /** Set when a "Try again" button should resend this message. */
      retryMessage: string | null;
      pending: boolean;
    };

const debbyProfileQuery = (userId: string) =>
  queryOptions({
    queryKey: [...privateProfileKey(userId), "debby"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("private_profiles")
        .select("full_name, stage, last_period_date, due_date, baby_birth_date, timezone")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (
        data ?? {
          full_name: null,
          stage: null,
          last_period_date: null,
          due_date: null,
          baby_birth_date: null,
          timezone: null,
        }
      );
    },
  });

type HistoryRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  safety_triggered: boolean;
  created_at: string;
};

export function useDebbyChat() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const profile = useQuery(debbyProfileQuery(userId));
  const today = useToday(profile.data?.timezone);

  // Newest 50 first, then 50 older per page. Not refetched while open, so nothing shows twice.
  const history = useInfiniteQuery({
    queryKey: ["chat-messages", userId],
    enabled: Boolean(userId),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }): Promise<HistoryRow[]> => {
      let query = supabase
        .from("chat_messages")
        .select("id, role, content, safety_triggered, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(HISTORY_PAGE);
      if (pageParam) query = query.lt("created_at", pageParam);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    getNextPageParam: (last) =>
      last.length === HISTORY_PAGE ? (last[last.length - 1]?.created_at ?? undefined) : undefined,
  });

  const [local, setLocal] = useState<ChatItem[]>([]);
  const [sending, setSending] = useState(false);
  const [limitDay, setLimitDay] = useState<string | null>(null);
  const sendingRef = useRef(false);
  const nextId = useRef(0);
  const todayRef = useRef(today);
  todayRef.current = today;

  const limited = limitDay !== null && limitDay === today;

  const items = useMemo((): ChatItem[] | null => {
    if (!profile.data || !history.data) return null;
    const rows = history.data.pages.flat().reverse();
    const saved: ChatItem[] = rows.map((row) =>
      row.role === "user"
        ? { id: row.id, from: "her", text: row.content }
        : {
            id: row.id,
            from: "debby",
            text: row.content,
            tone: row.safety_triggered ? "safety" : "normal",
            retryMessage: null,
            pending: false,
          },
    );
    const welcome: ChatItem[] =
      saved.length === 0
        ? [
            {
              id: "welcome",
              from: "debby",
              text: welcomeText(profile.data.full_name, profile.data.stage),
              tone: "normal",
              retryMessage: null,
              pending: false,
            },
          ]
        : [];
    return [...welcome, ...saved, ...local];
  }, [profile.data, history.data, local]);

  /**
   * Sends her message. With `retryOf`, replaces that failed Debby bubble and does not add her bubble again.
   * Returns false when nothing was sent (empty, too long, busy or limited), so the input is kept.
   */
  const send = useCallback(
    (raw: string, retryOf?: string): boolean => {
      const message = raw.trim();
      if (!message || message.length > MAX_MESSAGE_LENGTH) return false;
      if (sendingRef.current || limited || !userId) return false;

      sendingRef.current = true;
      setSending(true);
      const pendingId = `local-${nextId.current++}`;
      const herId = `local-${nextId.current++}`;
      setLocal((current) => [
        ...(retryOf
          ? current.filter((item) => item.id !== retryOf)
          : [...current, { id: herId, from: "her" as const, text: message }]),
        {
          id: pendingId,
          from: "debby",
          text: "",
          tone: "normal",
          retryMessage: null,
          pending: true,
        },
      ]);

      void askDebby(message).then((state) => {
        setLocal((current) =>
          current.map((item) =>
            item.id === pendingId
              ? {
                  id: pendingId,
                  from: "debby",
                  text: state.text,
                  tone: state.tone,
                  retryMessage: state.showRetry ? message : null,
                  pending: false,
                }
              : item,
          ),
        );
        if (state.limitReached) setLimitDay(todayRef.current);
        sendingRef.current = false;
        setSending(false);
      });
      return true;
    },
    [limited, userId],
  );

  const todayDate = parseIsoDate(today);
  const guide = profile.data && todayDate ? guideLine(profile.data, todayDate) : null;

  return {
    status:
      profile.isError || (history.isError && !history.data) ? "error" : items ? "ready" : "loading",
    retryLoad: () => {
      if (profile.isError) void profile.refetch();
      if (history.isError) void history.refetch();
    },
    guide,
    stage: profile.data?.stage ?? null,
    items: items ?? [],
    canLoadEarlier: history.hasNextPage,
    loadingEarlier: history.isFetchingNextPage,
    loadEarlierFailed: history.isFetchNextPageError,
    loadEarlier: () => void history.fetchNextPage(),
    sending,
    limited,
    send,
  } as const;
}
