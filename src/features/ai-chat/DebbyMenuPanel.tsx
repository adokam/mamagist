// The Debby chat menu: a side panel from the left with her chats, newest
// first, grouped Today, Yesterday, Earlier. Her chats and titles are only
// ever shown here — they are never stored on the phone.
import { useState } from "react";

import { MessageSquare, MoreVertical, Plus } from "lucide-react";

import { LogoMark } from "@/components/Logo";
import { LoadError } from "@/components/LoadError";
import { Skeleton } from "@/components/ui/skeleton";

import { groupChats } from "./chatGroups";
import type { ChatRow } from "./debbyChats";

export function DebbyMenuPanel({
  open,
  onClose,
  chats,
  openChatId,
  fullName,
  timeZone,
  isLoading,
  isError,
  onRetry,
  hasMore,
  loadingMore,
  onLoadMore,
  onSelectChat,
  onNewChat,
  onProfile,
}: {
  open: boolean;
  onClose: () => void;
  chats: ChatRow[];
  openChatId: string | null;
  fullName: string | null;
  timeZone: string | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onProfile: () => void;
}) {
  const [menuChatId, setMenuChatId] = useState<string | null>(null);
  if (!open) return null;

  const initial = (fullName ?? "").trim().charAt(0).toUpperCase() || "M";
  const groups = groupChats(chats, timeZone);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label="Your chats with Debby">
      {/* Dim layer: tapping it closes the panel. */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40"
      />
      {/* The panel stays inside the 430px app column on wide screens. */}
      <div className="relative mx-auto flex h-full w-full max-w-[430px]">
        <aside className="flex h-full w-[85%] max-w-[340px] flex-col bg-card shadow-xl">
          <div className="shrink-0 px-5 pt-5">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-10 w-10 rounded-[12px]" />
              <span className="text-[18px] leading-none font-extrabold tracking-tight text-ink">
                Mamagist
              </span>
            </div>
            <p className="mt-5 text-[13px] font-bold tracking-wide text-muted uppercase">
              Recents
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-2 pb-4">
            {isLoading ? (
              <div className="space-y-2 px-2" aria-busy="true" aria-label="Loading chats">
                <Skeleton className="h-12 w-full rounded-[12px]" />
                <Skeleton className="h-12 w-full rounded-[12px]" />
                <Skeleton className="h-12 w-full rounded-[12px]" />
              </div>
            ) : isError ? (
              <div className="px-2">
                <LoadError onRetry={onRetry} />
              </div>
            ) : chats.length === 0 ? (
              <p className="px-2 pt-2 text-[15px] leading-relaxed text-foreground">
                No chats yet. Tell Debby how you feel to start one.
              </p>
            ) : (
              <>
                {groups.map((group) => (
                  <div key={group.heading}>
                    <p className="px-2 pt-3 pb-1 text-[13px] font-bold text-muted">
                      {group.heading}
                    </p>
                    {group.chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={
                          chat.id === openChatId
                            ? "flex h-12 items-center gap-2 rounded-[12px] bg-surface pr-1 pl-2"
                            : "flex h-12 items-center gap-2 rounded-[12px] pr-1 pl-2"
                        }
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectChat(chat.id);
                          }}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                          aria-label={`Open chat: ${chat.title}`}
                        >
                          <MessageSquare
                            aria-hidden
                            className="h-5 w-5 shrink-0 text-muted"
                          />
                          <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-foreground">
                            {chat.title}
                          </span>
                        </button>
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setMenuChatId((current) => (current === chat.id ? null : chat.id))
                            }
                            aria-label={`Options for ${chat.title}`}
                            aria-expanded={menuChatId === chat.id}
                            className="grid h-10 w-10 place-items-center rounded-full text-muted"
                          >
                            <MoreVertical aria-hidden className="h-5 w-5" />
                          </button>
                          {menuChatId === chat.id ? (
                            <>
                              <button
                                type="button"
                                aria-label="Close options"
                                onClick={() => setMenuChatId(null)}
                                className="fixed inset-0 z-30 cursor-default bg-transparent"
                              />
                              <div className="absolute right-0 z-40 mt-1 w-48 overflow-hidden rounded-[16px] border border-line bg-card shadow">
                                <button
                                  type="button"
                                  onClick={() => setMenuChatId(null)}
                                  className="block w-full px-4 py-3 text-left text-base font-bold text-ink"
                                >
                                  Rename
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMenuChatId(null)}
                                  className="block w-full px-4 py-3 text-left text-base font-bold text-ink"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {hasMore ? (
                  <div className="flex justify-center pt-3">
                    <button
                      type="button"
                      onClick={onLoadMore}
                      disabled={loadingMore}
                      className="min-h-11 rounded-full border-[1.5px] border-primary px-5 text-[15px] font-bold text-foreground disabled:opacity-50"
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-line px-5 py-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onProfile();
              }}
              aria-label="Open your profile"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-[18px] font-extrabold text-primary-contrast"
            >
              {initial}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNewChat();
              }}
              className="flex h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-[15px] font-bold text-primary-contrast"
            >
              <Plus aria-hidden className="h-5 w-5" />
              New chat
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
