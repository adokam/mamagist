import { useLayoutEffect, useRef, useState, type FormEvent } from "react";

import { useNavigate } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { PrimaryButton } from "@/components/Buttons";
import { LoadError } from "@/components/LoadError";
import { TextInput } from "@/components/TextInput";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/features/auth/FormField";
import { cn } from "@/lib/utils";

import { chipsForStage } from "./chips";
import { DebbyMenuPanel } from "./DebbyMenuPanel";
import { MAX_MESSAGE_LENGTH, SHOW_COUNTER_AFTER } from "./debbyText";
import { useDebbyChat, type ChatItem } from "./useDebbyChat";
import { useDebbyChatList } from "./useDebbyChatList";
import { useKeyboardViewport } from "./useKeyboardViewport";

/** One Debby chat. chatId is the open chat, or null for a new empty chat. */
export function DebbyPage({ chatId }: { chatId: string | null }) {
  const navigate = useNavigate();
  const chat = useDebbyChat(chatId, (state) => {
    // First reply of a new chat: the function created the chat. Move to its
    // address without adding a history entry, so a refresh keeps the chat.
    if (chatId === null && state.chatId) {
      void navigate({
        to: "/debby/$chatId",
        params: { chatId: state.chatId },
        replace: true,
      });
    }
  });
  const keyboard = useKeyboardViewport();
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const chatList = useDebbyChatList();
  const scrollRef = useRef<HTMLDivElement>(null);
  const keepPosition = useRef<number | null>(null);

  const last = chat.items[chat.items.length - 1];
  const showChips =
    chat.status === "ready" &&
    !chat.sending &&
    !chat.limited &&
    last?.from === "debby" &&
    !last.pending;

  // Newest message in view after every change; keep her place when earlier messages are added.
  useLayoutEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    if (keepPosition.current !== null) {
      box.scrollTop = box.scrollHeight - keepPosition.current;
      keepPosition.current = null;
    } else {
      box.scrollTop = box.scrollHeight;
    }
  }, [chat.items, chat.status, showChips, keyboard?.height]);

  const loadEarlier = () => {
    const box = scrollRef.current;
    keepPosition.current = box ? box.scrollHeight - box.scrollTop : null;
    chat.loadEarlier();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (chat.send(draft)) setDraft("");
  };

  const inputOff = chat.sending || chat.limited || chat.gone || chat.status !== "ready";

  return (
    <main
      className={cn(
        "fixed inset-x-0 mx-auto flex w-full max-w-[430px] flex-col bg-background",
        keyboard ? "z-50" : "top-0 h-[calc(100dvh-79px-env(safe-area-inset-bottom))]",
      )}
      style={keyboard ? { top: keyboard.top, height: keyboard.height } : undefined}
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-5 pt-4 pb-3">
        <button
          type="button"
          onClick={() => {
            chatList.refetch();
            setMenuOpen(true);
          }}
          aria-label="Open chat menu"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-foreground"
        >
          <Menu aria-hidden className="h-6 w-6" />
        </button>
        <span
          aria-hidden
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-[20px] font-extrabold text-primary-contrast"
        >
          D
        </span>
        <div className="min-w-0">
          <h1 className="text-[22px] leading-tight font-extrabold tracking-tight text-foreground">
            Ask Debby
          </h1>
          {chat.guide ? (
            <p className="text-[14px] leading-snug text-foreground">{chat.guide}</p>
          ) : (
            <Skeleton className="mt-1 h-4 w-48" />
          )}
        </div>
      </header>

      <div
        ref={scrollRef}
        role="log"
        aria-label="Chat with Debby"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4"
      >
        {chat.status === "error" ? (
          <LoadError onRetry={chat.retryLoad} />
        ) : chat.status === "loading" ? (
          <ChatSkeleton />
        ) : (
          <div className="space-y-3">
            {chat.canLoadEarlier ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={loadEarlier}
                  disabled={chat.loadingEarlier}
                  className="min-h-11 rounded-full border-[1.5px] border-primary px-5 text-[15px] font-bold text-foreground disabled:opacity-50"
                >
                  {chat.loadingEarlier ? "Loading…" : "Load earlier messages"}
                </button>
              </div>
            ) : null}
            {chat.loadEarlierFailed ? (
              <FormError message="We couldn't load earlier messages. Please try again." />
            ) : null}

            {chat.items.map((item) => (
              <Bubble key={item.id} item={item} onRetry={(id, msg) => chat.send(msg, id)} />
            ))}

            {chat.gone ? (
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => void navigate({ to: "/debby" })}
                  className="min-h-11 rounded-full border-[1.5px] border-primary px-5 text-[15px] font-bold text-foreground"
                >
                  Start a new chat
                </button>
              </div>
            ) : null}

            {showChips ? (
              <div className="flex flex-wrap gap-2">
                {chipsForStage(chat.stage).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => chat.send(chip)}
                    className="h-10 rounded-full border-[1.5px] border-primary bg-transparent px-4 text-sm font-medium text-foreground"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="shrink-0 px-5 pt-2 pb-2">
        <p className="mb-2 text-center text-[13px] text-foreground">
          Debby gives general guidance, not a diagnosis.
        </p>
        <form onSubmit={submit} className="flex items-center gap-2">
          <TextInput
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={inputOff}
            placeholder={chat.limited ? "Debby will be back tomorrow" : "Tell Debby how you feel"}
            aria-label="Message to Debby"
            enterKeyHint="send"
            autoComplete="off"
            className="min-w-0 flex-1 disabled:opacity-60"
          />
          <PrimaryButton type="submit" disabled={inputOff} className="h-12 w-12 shrink-0 px-0">
            Go
          </PrimaryButton>
        </form>
        {draft.length > SHOW_COUNTER_AFTER ? (
          <p className="mt-1 px-5 text-[13px] text-foreground" aria-live="polite">
            {draft.length}/{MAX_MESSAGE_LENGTH}
          </p>
        ) : null}
      </div>

      <DebbyMenuPanel
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        chats={chatList.chats}
        openChatId={chatId}
        fullName={chat.fullName}
        timeZone={chat.timezone}
        isLoading={chatList.isLoading}
        isError={chatList.isError}
        onRetry={chatList.retry}
        hasMore={chatList.hasMore}
        loadingMore={chatList.loadingMore}
        onLoadMore={chatList.loadMore}
        onSelectChat={(id) => void navigate({ to: "/debby/$chatId", params: { chatId: id } })}
        onNewChat={() => void navigate({ to: "/debby" })}
        onProfile={() => void navigate({ to: "/profile" })}
      />
    </main>
  );
}

const bubbleText = "text-[15px] leading-relaxed whitespace-pre-wrap break-words";

/** Text only. Replies are never read as HTML or markdown. */
function Bubble({
  item,
  onRetry,
}: {
  item: ChatItem;
  onRetry: (id: string, message: string) => void;
}) {
  if (item.from === "her") {
    return (
      <div className="flex justify-end">
        <p
          className={cn(
            bubbleText,
            "max-w-[85%] rounded-[20px] rounded-br-[4px] bg-primary px-4 py-3 text-primary-contrast",
          )}
        >
          {item.text}
        </p>
      </div>
    );
  }

  if (item.pending) {
    return (
      <div className="flex justify-start">
        <div
          role="status"
          aria-label="Debby is typing"
          className="flex h-12 items-center gap-1.5 rounded-[20px] rounded-bl-[4px] border border-border bg-surface px-4"
        >
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
      <p
        className={cn(
          bubbleText,
          "max-w-[85%] rounded-[20px] rounded-bl-[4px] px-4 py-3 text-foreground",
          item.tone === "safety"
            ? "border-2 border-alert-border bg-alert"
            : "border border-line bg-card",
        )}
      >
        {item.text}
      </p>
      {item.retryMessage !== null ? (
        <button
          type="button"
          onClick={() => onRetry(item.id, item.retryMessage ?? "")}
          className="mt-2 min-h-11 rounded-full border-[1.5px] border-primary px-5 text-[15px] font-bold text-foreground"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="ml-auto h-12 w-3/5 rounded-[20px]" />
      <Skeleton className="h-24 w-4/5 rounded-[20px]" />
      <Skeleton className="ml-auto h-12 w-1/2 rounded-[20px]" />
    </div>
  );
}
