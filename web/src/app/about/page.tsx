import Link from "next/link";
import { Shield, Search, Quote, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About - Quantix",
  description:
    "Quantix is AI search built around verified answers, smart search decisions, and real citations.",
};

export default function AboutPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <section className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
            AI search that doesn&apos;t lie.
          </h1>
          <p className="text-lg leading-relaxed text-stone-600 dark:text-stone-400">
            Most AI search engines hallucinate citations, pull from low-quality
            SEO pages, and answer with stale information from training data.
            Quantix is built to do the opposite: answer directly when it knows,
            check the live web when it doesn&apos;t, and show you the sources
            for every claim that matters.
          </p>
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              Try it now <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-10 sm:grid-cols-3">
          <Feature
            icon={Shield}
            title="No hallucinated sources"
            body="Sources shown under each answer come from the real web, not invented URLs. If we cite it, you can click through to it."
          />
          <Feature
            icon={Search}
            title="Smart search decisions"
            body="Quantix searches the web for things that change - current events, prices, public figures - and answers from knowledge for stable concepts like math or programming."
          />
          <Feature
            icon={Quote}
            title="Cited and current"
            body="When an answer depends on recent information, Quantix pulls it from live web pages and pins those sources right under the answer."
          />
        </section>

        <section className="mt-24 border-t border-stone-200 pt-12 dark:border-stone-800">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            Built for people who need the right answer.
          </h2>
          <p className="mt-4 leading-relaxed text-stone-600 dark:text-stone-400">
            Whether you&apos;re researching a market, fact-checking a claim, or
            just trying to learn something quickly, Quantix gives you a clear
            answer backed by real sources - not a stack of blue links and not a
            confident-sounding guess.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-900"
            >
              See pricing
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              Start a search <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Shield;
  title: string;
  body: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-900/5 text-stone-700 dark:bg-stone-100/10 dark:text-stone-300">
        <Icon size={20} />
      </div>
      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        {body}
      </p>
    </div>
  );
}
