"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Source = { title: string; url: string };

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setAnswer("");
    setStatus("");
    setSources([]);
    setLoading(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
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
          try {
            const msg = JSON.parse(line);
            if (msg.type === "text") {
              setAnswer((prev) => prev + msg.content);
              setStatus("");
            } else if (msg.type === "status") {
              setStatus(msg.text);
            } else if (msg.type === "sources") {
              setSources(msg.items);
            } else if (msg.type === "error") {
              setAnswer(`Error: ${msg.message}`);
            }
          } catch {
            // skip malformed line
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setAnswer(`Error: ${message}`);
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  return (
    <main className="flex flex-1 w-full flex-col items-center px-4 pt-16 pb-24 sm:pt-24">
      <div className="w-full max-w-2xl mx-auto flex flex-col">
        <header className="mb-12 text-center">
          <h1
            className="font-[family-name:var(--font-pixel-title)] text-3xl sm:text-5xl text-emerald-300 pixel-glow tracking-widest mb-4 leading-tight"
          >
            QUANTIX
          </h1>
          <p className="text-base text-zinc-500 uppercase tracking-[0.3em]">
            AI SEARCH THAT DOESN&apos;T LIE
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mb-10 space-y-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 text-2xl pointer-events-none select-none">
              {">"}
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ASK ANYTHING_"
              disabled={loading}
              autoFocus
              className="w-full bg-black border-2 border-zinc-700 px-12 py-4 text-2xl text-zinc-100 placeholder:text-zinc-600 placeholder:uppercase placeholder:tracking-wider focus:border-emerald-400 focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full border-2 border-emerald-400 bg-black px-6 py-3 text-emerald-300 text-xl uppercase tracking-[0.3em] hover:bg-emerald-400 hover:text-black active:bg-emerald-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-emerald-300"
          >
            {loading ? "[ ... PROCESSING ]" : "[ EXECUTE ]"}
          </button>
        </form>

        {status && (
          <div className="mb-6 text-emerald-300 text-xl flex items-center gap-2">
            <span className="text-emerald-400">{">"}</span>
            <span>{status}</span>
            <span className="pixel-cursor text-emerald-300">▮</span>
          </div>
        )}

        {(answer || (loading && !status)) && (
          <article className="text-zinc-200 text-xl leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-emerald-300 uppercase tracking-wider mt-6 mb-3 text-2xl border-b border-zinc-800 pb-1">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-emerald-400 uppercase tracking-wider mt-6 mb-3 text-xl">
                    # {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-cyan-300 uppercase tracking-wide mt-4 mb-2 text-lg">
                    ## {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="my-3 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="my-3 space-y-1.5 ml-0">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-3 space-y-1.5 ml-0 list-decimal list-inside marker:text-emerald-400">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-400 shrink-0">{">"}</span>
                    <span className="flex-1">{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="text-emerald-200 font-normal bg-emerald-400/10 px-1">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="text-cyan-200 not-italic">{children}</em>
                ),
                code: ({ children }) => (
                  <code className="text-pink-300 bg-zinc-900 px-1.5 py-0.5 border border-zinc-800 text-base">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-zinc-900/80 border border-zinc-700 p-4 my-4 overflow-x-auto text-base text-pink-200">
                    {children}
                  </pre>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-300 underline decoration-cyan-700 underline-offset-4 hover:text-cyan-100 hover:decoration-cyan-300"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-emerald-400 pl-4 my-3 text-zinc-400">
                    {children}
                  </blockquote>
                ),
                hr: () => (
                  <hr className="my-6 border-zinc-800 border-dashed" />
                ),
              }}
            >
              {answer}
            </ReactMarkdown>
            {loading && !status && (
              <span className="pixel-cursor text-emerald-300 text-2xl">▮</span>
            )}
          </article>
        )}

        {sources.length > 0 && (
          <section className="mt-12 border-t-2 border-dashed border-zinc-800 pt-6">
            <h2 className="mb-4 text-emerald-300 text-base uppercase tracking-[0.4em]">
              // SOURCES
            </h2>
            <ol className="space-y-2">
              {sources.map((s, i) => (
                <li key={s.url} className="flex gap-3 text-lg items-baseline">
                  <span className="text-zinc-600 shrink-0">
                    [{String(i + 1).padStart(2, "0")}]
                  </span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-300 hover:text-cyan-100 underline decoration-cyan-800 hover:decoration-cyan-300 underline-offset-4 truncate"
                  >
                    {s.title || new URL(s.url).hostname}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}
