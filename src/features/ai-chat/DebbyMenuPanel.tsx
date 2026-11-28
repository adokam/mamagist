// The Debby chat menu: a side panel from the left with her chats, newest
// first, grouped Today, Yesterday, Earlier. Her chats and titles are only
// ever shown here — they are never stored on the phone.
import { useState } from "react";

import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, MoreVertical, Plus, X } from "lucide-react";

import { LogoMark } from "@/components/Logo";
import { LoadError } from "@/components/LoadError";
import { TextInput } from "@/components/TextInput";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/features/auth/FormField";
import { useAuth } from "@/features/auth/AuthProvider";

import { groupChats } from "./chatGroups";
import { MAX_CHAT_TITLE_LENGTH, validateChatTitle } from "./chatTitle";
import { deleteDebbyChat, renameDebbyChat } from "./debbyChatActions";
import type { ChatRow } from "./debbyChats";

type ChatDialog =
  | { type: "rename"; chat: ChatRow }
  | { type: "delete"; chat: ChatRow }
  | null;

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
  const [dialog, setDialog] = useState<ChatDialog>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();
  if (!open) return null;

  const initial = (fullName ?? "").trim().charAt(0).toUpperCase() || "M";
  const groups = groupChats(chats, timeZone);

  const openRename = (chat: ChatRow) => {
    setMenuChatId(null);
    setRenameValue(chat.title);
    setRenameError(null);
    setDialogError(null);
    setDialog({ type: "rename", chat });
  };

  const openDelete = (chat: ChatRow) => {
    setMenuChatId(null);
    setDialogError(null);
    setDialog({ type: "delete", chat });
  };

  const saveRename = () => {
    if (!dialog || dialog.type !== "rename" || busy) return;
    const checked = validateChatTitle(renameValue);
    if (!checked.ok) {
      setRenameError(checked.error);
      return;
    }
    setBusy(true);
    setRenameError(null);
    void renameDebbyChat(userId, dialog.chat.id, checked.title)
      .then(() => {
        const title = checked.title;
        queryClient.setQueryData<InfiniteData<ChatRow[]>>(
          ["debby-chats", userId],
          (old) =>
            old
              ? {
                  ...old,
                  pages: old.pages.map((page) =>
                    page.map((row) => (row.id === dialog.chat.id ? { ...row, title } : row)),
                  ),
                }
              : old,
        );
        setDialog(null);
      })
      .catch(() => setDialogError("We couldn't rename this chat. Please try again."))
      .finally(() => setBusy(false));
  };

  const confirmDelete = () => {
    if (!dialog || dialog.type !== "delete" || busy) return;
    const chat = dialog.chat;
    const wasOpen = chat.id === openChatId;
    setBusy(true);
    setDialogError(null);
    void deleteDebbyChat(userId, chat.id)
      .then(() => {
        queryClient.setQueryData<InfiniteData<ChatRow[]>>(
          ["debby-chats", userId],
          (old) =>
            old
              ? {
                  ...old,
                  pages: old.pages.map((page) => page.filter((row) => row.id !== chat.id)),
                }
              : old,
        );
        setDialog(null);
        if (wasOpen) {
          onClose();
          onNewChat();
        }
      })
      .catch(() => setDialogError("We couldn't delete this chat. Please try again."))
      .finally(() => setBusy(false));
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label="Your chats with Debby">
      {/* Dim layer: tapping it closes the panel. */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40"
      />
      {/* The wrapper is pointer-events-none so taps on the dimmed area around
          the panel reach the dim button below it; the panel and dialogs turn
          their own events back on. Without this the wrapper swallows every
          tap and the dim layer can never close the menu. */}
      <div className="pointer-events-none relative mx-auto flex h-full w-full max-w-[430px]">
        <aside className="pointer-events-auto flex h-full w-[85%] max-w-[340px] flex-col bg-card shadow-xl">
          <div className="shrink-0 px-5 pt-5">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <LogoMark className="h-10 w-10 rounded-[12px]" />
                <span className="text-[18px] leading-none font-extrabold tracking-tight text-ink">
                  Mamagist
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-foreground"
              >
                <X aria-hidden className="h-6 w-6" />
              </button>
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
                                  onClick={() => openRename(chat)}
                                  className="block w-full px-4 py-3 text-left text-base font-bold text-ink"
                                >
                                  Rename
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDelete(chat)}
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

          <div className="flex shrink-0 items-center justify-between border-t border-line px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
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

        {dialog?.type === "rename" ? (
          <div className="pointer-events-auto absolute inset-0 z-10 grid place-items-center bg-black/40 px-6">
            <div
              role="dialog"
              aria-label="Rename chat"
              className="w-full max-w-[320px] rounded-[20px] bg-card p-5 shadow-xl"
            >
              <p className="text-[18px] font-extrabold text-ink">Rename chat</p>
              <div className="mt-3">
                <TextInput
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  maxLength={MAX_CHAT_TITLE_LENGTH}
                  disabled={busy}
                  aria-label="Chat title"
                  autoComplete="off"
                />
              </div>
              {renameError ? (
                <div className="mt-2">
                  <FormError message={renameError} />
                </div>
              ) : null}
              {dialogError ? (
                <div className="mt-2">
                  <FormError message={dialogError} />
                </div>
              ) : null}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={saveRename}
                  disabled={busy}
                  className="flex h-11 flex-1 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-contrast disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setDialog(null)}
                  disabled={busy}
                  className="flex h-11 flex-1 items-center justify-center rounded-full border-2 border-primary text-base font-bold text-primary disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {dialog?.type === "delete" ? (
          <div className="pointer-events-auto absolute inset-0 z-10 grid place-items-center bg-black/40 px-6">
            <div
              role="dialog"
              aria-label="Delete chat"
              className="w-full max-w-[320px] rounded-[20px] bg-card p-5 shadow-xl"
            >
              <p className="text-[18px] font-extrabold text-ink">Delete this chat?</p>
              <p className="mt-2 text-[15px] leading-relaxed text-foreground">
                This removes the chat and its messages for good. Debby keeps short notes
                about you until you clear them in Settings.
              </p>
              {dialogError ? (
                <div className="mt-2">
                  <FormError message={dialogError} />
                </div>
              ) : null}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={busy}
                  className="flex h-11 flex-1 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-contrast disabled:opacity-50"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDialog(null)}
                  disabled={busy}
                  className="flex h-11 flex-1 items-center justify-center rounded-full border-2 border-primary text-base font-bold text-primary disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
