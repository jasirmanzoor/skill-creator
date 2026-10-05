import Link from "next/link";
import { getDictionary } from "@/content/i18n";

export default function NotFound() {
  const t = getDictionary("en");
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-5 bg-paper px-6 text-center">
      <p className="num text-sm font-semibold text-brand">404</p>
      <h1 className="font-display text-4xl font-semibold tracking-[-0.025em] text-ink">{t.notFound.title}</h1>
      <p className="text-muted">{t.notFound.body}</p>
      <Link href="/en" className="rounded-md bg-ink px-5 py-3 font-medium text-white">{t.notFound.home}</Link>
    </main>
  );
}
