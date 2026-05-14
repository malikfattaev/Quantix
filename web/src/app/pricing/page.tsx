import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Pricing - Quantix",
  description:
    "Pick a plan that fits how often you search. Upgrade anytime as you grow.",
};

type Tier = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Start",
    price: "$5",
    period: "/ month",
    description: "Get rolling with Quantix at a low price.",
    features: [
      "30 searches per day",
      "Verified sources on every answer",
      "Standard response speed",
    ],
    cta: { label: "Get started", href: "/signup" },
  },
  {
    name: "Pro",
    price: "$20",
    period: "/ month",
    description: "For everyday research and serious users.",
    features: [
      "Unlimited searches",
      "Search history and saved chats",
      "Priority response speed",
      "Deep research mode",
      "Email support",
    ],
    cta: { label: "Coming soon", href: "/signup" },
    featured: true,
  },
  {
    name: "Max",
    price: "$50",
    period: "/ month",
    description: "Power users who want everything, unlimited.",
    features: [
      "Everything in Pro",
      "Highest priority response speed",
      "Longer answers and bigger context",
      "Advanced research workflows",
      "Priority support",
    ],
    cta: { label: "Coming soon", href: "/signup" },
  },
];

export default function PricingPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
            Simple pricing.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-stone-600 dark:text-stone-400">
            Pick a plan and upgrade when you want unlimited searches and deeper
            answers.
          </p>
        </header>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <TierCard key={tier.name} tier={tier} />
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-stone-500 dark:text-stone-400">
          Prices in USD. Cancel anytime. Pro and Max plans launch soon.
        </p>
      </div>
    </div>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const featured = tier.featured;
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        featured
          ? "border-stone-900 bg-white shadow-md dark:border-stone-100 dark:bg-stone-900"
          : "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/50"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-stone-900 px-3 py-0.5 text-xs font-medium text-white dark:bg-stone-100 dark:text-stone-900">
          Most popular
        </span>
      )}
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
        {tier.name}
      </h2>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
        {tier.description}
      </p>
      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {tier.price}
        </span>
        {tier.period && (
          <span className="text-sm text-stone-500 dark:text-stone-400">
            {tier.period}
          </span>
        )}
      </div>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm">
        {tier.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-stone-700 dark:text-stone-300"
          >
            <Check
              size={16}
              className="mt-0.5 shrink-0 text-stone-900 dark:text-stone-100"
              strokeWidth={2.5}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={tier.cta.href}
        className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
          featured
            ? "bg-stone-900 text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
            : "border border-stone-300 text-stone-900 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800"
        }`}
      >
        {tier.cta.label} <ArrowRight size={14} />
      </Link>
    </div>
  );
}
