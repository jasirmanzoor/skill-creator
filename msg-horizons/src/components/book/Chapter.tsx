import type { Locale } from "@/content/i18n";
import { CHAPTERS } from "@/content/chapters";
import Opener from "./Opener";

/**
 * One chapter of the page. The chapters run one after another down a single page; each opens on its plate (Opener),
 * which is the only divider a chapter needs: the next one simply follows as you scroll.
 */
export default function Chapter({ n, lang, children }: { n: number; lang: Locale; children: React.ReactNode }) {
  const ch = CHAPTERS[n];
  return (
    <div data-chapter={ch.id} data-current={n === 0 ? "" : undefined} tabIndex={-1} aria-label={ch.title[lang]} className="chapter">
      <Opener n={n} lang={lang} />
      {children}
    </div>
  );
}
