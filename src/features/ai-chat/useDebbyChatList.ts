// Her Debby chats, newest first, for the menu panel. Reads only her own
// rows. Chats and titles are kept in memory only — never on the phone.
import { useInfiniteQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/AuthProvider";

import { debbySupabase, type ChatRow } from "./debbyChats";

export const CHAT_LIST_PAGE_SIZE = 30;

export function useDebbyChatList() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const list = useInfiniteQuery({
    queryKey: ["debby-chats", userId],
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<ChatRow[]> => {
      const from = pageParam * CHAT_LIST_PAGE_SIZE;
      const { data, error } = await debbySupabase
        .from("chats")
        .select("id, user_id, title, created_at, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, from + CHAT_LIST_PAGE_SIZE - 1);
      if (error) throw error;
      return data ?? [];
    },
    getNextPageParam: (last, pages) =>
      last.length === CHAT_LIST_PAGE_SIZE ? pages.length : undefined,
  });

  return {
    chats: list.data?.pages.flat() ?? [],
    isLoading: list.isPending,
    isError: list.isError,
    retry: () => void list.refetch(),
    /** Refresh the list, for example when the menu opens. */
    refetch: () => void list.refetch(),
    hasMore: list.hasNextPage,
    loadingMore: list.isFetchingNextPage,
    loadMore: () => void list.fetchNextPage(),
  } as const;
}
