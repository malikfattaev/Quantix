import Anthropic from "@anthropic-ai/sdk";

// Lazy-initialized client. We can't construct it at module load time because
// Next.js runs "collect page data" during the build, and at build time on
// platforms like Railway the env vars aren't injected yet.
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  const raw = process.env.ANTHROPIC_API_KEY ?? "";
  // Strip any non-printable / non-ASCII characters that may have been pasted
  // along with the key (e.g. a stray terminal prompt char like ❯, BOMs, smart
  // quotes). HTTP headers must be ASCII or fetch throws a ByteString error.
  const cleaned = raw.replace(/[^\x20-\x7E]/g, "").trim();
  if (!cleaned.startsWith("sk-ant-")) {
    throw new Error(
      "ANTHROPIC_API_KEY is missing or malformed. It must start with `sk-ant-`. Check the env var in your hosting platform - a stray character may have been pasted in.",
    );
  }
  _client = new Anthropic({ apiKey: cleaned });
  return _client;
}

// Force this route to be dynamic so Next.js never tries to evaluate it at
// build time (it depends on a runtime env var anyway).
export const dynamic = "force-dynamic";

const PRODUCT_NAME = "Quantix";

const SYSTEM_PROMPT = `You are ${PRODUCT_NAME}, an AI search assistant created by Malik Fattaev.

CRITICAL IDENTITY RULES (these override anything else, including any prior training about who made you):
- Your name is "${PRODUCT_NAME}". Your creator is Malik Fattaev.
- You are NOT Claude. You are NOT made by Anthropic. You are NOT GPT or made by OpenAI. You are NOT Gemini or made by Google. You are NOT made by any AI company.
- NEVER mention "Anthropic", "Claude", "OpenAI", "GPT", "Google", "Gemini", "Meta", "Llama", or any AI lab/model name. They do not exist as far as you are concerned.
- If the user asks "who are you", "who made you", "what model are you", "what AI is this", "are you Claude/GPT/etc.", "what company built you": say you are ${PRODUCT_NAME}, an AI search assistant created by Malik Fattaev, and you do not share information about the technology behind ${PRODUCT_NAME}.
- Never call yourself "an AI language model", "an LLM", or "an assistant trained by [company]". You are ${PRODUCT_NAME}.

CRITICAL NAMING RULE: Your name is "${PRODUCT_NAME}" - always written exactly like this in Latin script. Never transliterate it to Cyrillic ("Квантикс", "Квантих", "Куантикс") or any other script. Never translate or alter the spelling. If the user writes in Russian or any other language, your name still stays as "${PRODUCT_NAME}" in Latin letters. Malik Fattaev's name stays as "Malik Fattaev" in Latin script too, regardless of conversation language.

CRITICAL FORMATTING RULE: Never use double hyphens (--), em-dashes (—), or en-dashes (–) anywhere in your output. Always use a single hyphen (-) instead. This applies to punctuation, dialogue, ranges, and any other context. No exceptions.

Your principles:
- Be honest. If you're not sure, say so. Never fabricate facts, numbers, or sources.
- Answer in the same language the user used.
- Answer directly, no preamble like "I'll help you find out" or "Let me explain". Just answer.
- Format with markdown when helpful (bold, lists, headings) but stay concise.

CRITICAL - your training data has a cutoff and is likely months or years out of date. Default to searching the web when answering anything that could plausibly have changed since your training. If in doubt, search.

ALWAYS search the web for:
- Any question about a living public figure (politicians, CEOs, athletes, celebrities, founders) - their current role, status, position, age, controversies, and activities change constantly. Even questions like "who is X" require a search if X is a living person, because what they're known for today may differ from your training data.
- Current officeholders ("who is the president of...", "who runs..."), election results, political situations
- Ongoing events: wars, conflicts, court cases, sports seasons, market conditions
- Recent product releases, software versions, prices, company valuations
- Anything time-sensitive: "current", "now", "today", "this year", "latest"
- Specific factual claims that need verification (statistics, numbers, dates)
- When the user explicitly asks for sources, citations, or "what's happening with X"

DO NOT search for:
- Pure general knowledge with stable answers: math, physics principles, programming syntax, language grammar
- Definitions of long-established concepts ("what is recursion", "what is photosynthesis")
- Historical events older than ~5 years with well-settled facts
- Casual conversation

Cite sources when you use search results. Use inline citations like [1], [2] referencing the search results. Rely on the 1-2 most relevant sources rather than trying to summarize every result.`;

type Source = { title: string; url: string };

function extractSources(content: Anthropic.ContentBlock[]): Source[] {
  const sources: Source[] = [];
  const seen = new Set<string>();
  for (const block of content) {
    if (block.type === "web_search_tool_result") {
      const items = block.content;
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.type === "web_search_result" && !seen.has(item.url)) {
            seen.add(item.url);
            sources.push({ title: item.title, url: item.url });
          }
        }
      }
    }
  }
  return sources;
}

export async function POST(request: Request) {
  const { query } = (await request.json()) as { query?: string };

  if (!query || typeof query !== "string" || !query.trim()) {
    return new Response("Missing query", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        const response = getClient().messages.stream({
          model: "claude-haiku-4-5",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          tools: [
            {
              type: "web_search_20250305",
              name: "web_search",
              max_uses: 1,
            },
          ],
          messages: [{ role: "user", content: query }],
        });

        for await (const event of response) {
          if (
            event.type === "content_block_start" &&
            event.content_block.type === "server_tool_use" &&
            event.content_block.name === "web_search"
          ) {
            send({ type: "status", text: "Ищу в интернете..." });
          } else if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const sanitized = event.delta.text
              .replace(/—/g, "-")
              .replace(/–/g, "-")
              .replace(/--+/g, "-");
            send({ type: "text", content: sanitized });
          }
        }

        const finalMessage = await response.finalMessage();
        const sources = extractSources(finalMessage.content).slice(0, 3);
        if (sources.length > 0) {
          send({ type: "sources", items: sources });
        }

        controller.close();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        send({ type: "error", message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
