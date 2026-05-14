"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Source = { title: string; url: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  status?: string;
  loading?: boolean;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Streaming buffer flushed once per animation frame to avoid re-rendering
  // on every chunk arrival (which makes text appear in choppy bursts).
  const bufferRef = useRef("");
  const rafRef = useRef<number | null>(null);

  // Track whether the user is at (or near) the bottom of the scroll area.
  // We only auto-scroll while streaming if they haven't scrolled up.
  const isAtBottomRef = useRef(true);

  const isEmpty = messages.length === 0;

  // Autoresize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [input]);

  // Track scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      isAtBottomRef.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Stick to bottom on new content (only if user was already at bottom).
  // Instant scroll feels smoother than smooth-scroll during rapid streaming.
  useEffect(() => {
    if (!isAtBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const flushBuffer = useCallback(() => {
    rafRef.current = null;
    const chunk = bufferRef.current;
    if (!chunk) return;
    bufferRef.current = "";
    setMessages((m) => {
      if (m.length === 0) return m;
      const last = m[m.length - 1];
      if (last.role !== "assistant") return m;
      return [
        ...m.slice(0, -1),
        { ...last, content: last.content + chunk, status: undefined },
      ];
    });
  }, []);

  const scheduleFlush = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(flushBuffer);
  }, [flushBuffer]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    isAtBottomRef.current = true;
    setMessages((m) => [
      ...m,
      { role: "user", content: trimmed },
      { role: "assistant", content: "", loading: true },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let msg: {
            type: string;
            content?: string;
            text?: string;
            items?: Source[];
            message?: string;
          };
          try {
            msg = JSON.parse(line);
          } catch {
            continue;
          }

          if (msg.type === "text" && msg.content) {
            bufferRef.current += msg.content;
            scheduleFlush();
          } else if (msg.type === "status") {
            // Flush any pending text first so the status doesn't appear
            // before the prior chunk lands.
            flushBuffer();
            setMessages((m) => {
              if (m.length === 0) return m;
              const last = m[m.length - 1];
              if (last.role !== "assistant") return m;
              return [...m.slice(0, -1), { ...last, status: msg.text }];
            });
          } else if (msg.type === "sources" && msg.items) {
            flushBuffer();
            const items = msg.items;
            setMessages((m) => {
              if (m.length === 0) return m;
              const last = m[m.length - 1];
              if (last.role !== "assistant") return m;
              return [...m.slice(0, -1), { ...last, sources: items }];
            });
          } else if (msg.type === "error") {
            flushBuffer();
            const errMsg = msg.message ?? "Unknown error";
            setMessages((m) => {
              if (m.length === 0) return m;
              const last = m[m.length - 1];
              if (last.role !== "assistant") return m;
              return [
                ...m.slice(0, -1),
                { ...last, content: `Error: ${errMsg}` },
              ];
            });
          }
        }
      }
      flushBuffer();
    } catch (err) {
      flushBuffer();
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages((m) => {
        if (m.length === 0) return m;
        const last = m[m.length - 1];
        if (last.role !== "assistant") return m;
        return [
          ...m.slice(0, -1),
          { ...last, content: `Error: ${errMsg}` },
        ];
      });
    } finally {
      setLoading(false);
      setMessages((m) => {
        if (m.length === 0) return m;
        const last = m[m.length - 1];
        return [...m.slice(0, -1), { ...last, loading: false }];
      });
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <>
      <header className="shrink-0 border-b border-stone-200/70 dark:border-stone-800/70 px-6 py-3.5 text-center">
        <h1 className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          Quantix
        </h1>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-6 pb-16">
            <h2 className="mb-3 text-center text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              What do you want to know?
            </h2>
            <p className="text-stone-500 dark:text-stone-400">
              AI search that doesn&apos;t lie.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-8">
            {messages.map((m, i) => (
              <div key={i} className="msg-enter">
                <MessageBlock message={m} />
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-stone-200/70 dark:border-stone-800/70 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur px-4 sm:px-6 py-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 shadow-sm transition-colors focus-within:border-stone-500 dark:focus-within:border-stone-500">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={loading}
              rows={1}
              className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-2 text-base leading-relaxed text-stone-900 placeholder:text-stone-400 focus:outline-none disabled:opacity-50 dark:text-stone-100 dark:placeholder:text-stone-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white transition-all duration-200 hover:bg-stone-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              {loading ? (
                <Spinner inverse />
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-stone-400 dark:text-stone-500">
            Enter to send · Shift + Enter for new line
          </p>
        </form>
      </footer>
    </>
  );
}

function MessageBlock({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-md bg-stone-200/80 px-4 py-2.5 text-base leading-relaxed text-stone-900 dark:bg-stone-800/80 dark:text-stone-100">
          {message.content}
        </div>
      </div>
    );
  }

  const isStreaming = message.loading && !message.content && !message.status;

  return (
    <div className="space-y-3">
      {message.status && (
        <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <Spinner />
          <span>{message.status}</span>
        </div>
      )}
      {(message.content || isStreaming) && (
        <article className="prose prose-stone max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-stone-200 prose-pre:bg-stone-100 dark:prose-pre:border-stone-800 dark:prose-pre:bg-stone-900">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content || "​"}
          </ReactMarkdown>
          {isStreaming && <Spinner />}
        </article>
      )}
      {message.sources && message.sources.length > 0 && (
        <section className="space-y-2 border-t border-stone-200 pt-3 dark:border-stone-800">
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Sources
          </h3>
          <ol className="space-y-1 text-sm">
            {message.sources.map((s, i) => (
              <li key={s.url} className="flex gap-2">
                <span className="shrink-0 tabular-nums text-stone-400 dark:text-stone-500">
                  {i + 1}.
                </span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-stone-900 hover:decoration-stone-600 dark:text-stone-400 dark:decoration-stone-700 dark:hover:text-stone-100 dark:hover:decoration-stone-400"
                >
                  {s.title || new URL(s.url).hostname}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function Spinner({ inverse = false }: { inverse?: boolean }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${
        inverse
          ? "border-stone-400/40 border-t-white dark:border-stone-600/40 dark:border-t-stone-900"
          : "border-stone-300 border-t-stone-700 dark:border-stone-700 dark:border-t-stone-300"
      }`}
      aria-hidden
    />
  );
}
