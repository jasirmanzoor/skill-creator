import Link from "next/link";
import { getDictionary } from "@/content/i18n";

export default function NotFound() {
  const t = getDictionary("en");
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-6 bg-ink px-6 text-center">
      <p className="num font-mono text-sun">404</p>
      <h1 className="font-display text-4xl font-semibold">{t.notFound.title}</h1>
      <p className="text-fog">{t.notFound.body}</p>
      <Link href="/en" className="rounded-full bg-sun px-6 py-3 font-semibold text-ink">{t.notFound.home}</Link>
    </main>
  );
}
