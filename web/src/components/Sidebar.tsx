"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquarePlus,
  Sparkles,
  CreditCard,
  Info,
  User,
  type LucideIcon,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-14 shrink-0 flex-col border-r border-stone-200/70 bg-stone-100/40 py-3 dark:border-stone-800/70 dark:bg-stone-950/60">
      <Link
        href="/"
        aria-label="Quantix home"
        className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95 dark:bg-stone-100 dark:text-stone-900"
      >
        Q
      </Link>

      <nav className="flex flex-col items-center gap-1">
        <SideLink
          href="/"
          icon={MessageSquarePlus}
          label="New chat"
          active={pathname === "/"}
        />
        <SideLink
          href="/about"
          icon={Info}
          label="About"
          active={pathname.startsWith("/about")}
        />
        <SideLink
          href="/pricing"
          icon={CreditCard}
          label="Pricing"
          active={pathname.startsWith("/pricing")}
        />
      </nav>

      <div className="mt-auto flex flex-col items-center gap-1">
        <SideLink
          href="/login"
          icon={User}
          label="Sign in"
          active={pathname.startsWith("/login") || pathname.startsWith("/signup")}
        />
      </div>
    </aside>
  );
}

function SideLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`group relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
        active
          ? "bg-stone-900/10 text-stone-900 dark:bg-stone-100/15 dark:text-stone-100"
          : "text-stone-500 hover:bg-stone-900/5 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-100/10 dark:hover:text-stone-100"
      }`}
    >
      <Icon size={18} strokeWidth={2} aria-hidden />
      <span className="pointer-events-none absolute left-full z-50 ml-3 origin-left translate-x-1 whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 dark:bg-stone-100 dark:text-stone-900">
        {label}
      </span>
    </Link>
  );
}

export { Sparkles }; // reserved for future use
