import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Sign in - Quantix",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Sign in
        </h1>
        <p className="leading-relaxed text-stone-600 dark:text-stone-400">
          Accounts are coming soon. For now you can use Quantix without signing
          in - your searches stay in this browser tab.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-900"
          >
            I want an account
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            <ArrowLeft size={16} />
            Back to Quantix
          </Link>
        </div>
      </div>
    </div>
  );
}
