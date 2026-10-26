import type { Dictionary, Locale } from "@/content/i18n";
import { SERVICE_SLUGS, servicePages } from "@/content/servicePages";
import type { NavId } from "@/content/nav";
import { facts } from "@/content/facts";
import { ALIASES, STOP } from "@/content/searchTerms";

export type SearchHit = {
  id: string;
  href: `#${NavId}` | `/${string}`;
  title: string;
  description: string;
  group: string;
  /** other words that should bring this result up (content/searchTerms) */
  keywords?: string[];
};

/** lower case, Arabic letters unified (hamza, ya, ta marbuta) and marks removed, so spelling variants meet */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u0300-\u036f]/g, "");
}

const words = (text: string) => normalize(text).match(/[\p{L}\p{N}]+/gu) ?? [];

/** edit distance, enough to forgive a slip of the finger ("wharehouse", "freigth") */
function within(a: string, b: string, max: number): boolean {
  if (Math.abs(a.length - b.length) > max) return false;
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    let best = row[0];
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
      best = Math.min(best, row[j]);
    }
    if (best > max) return false;
  }
  return row[b.length] <= max;
}

export function buildSearchIndex(t: Dictionary, lang?: Locale): SearchHit[] {
  const hits: SearchHit[] = [
    { id: "planner", href: "#planner", title: t.nav.planFull, description: t.search.desc.planner, group: t.search.groups.tools },
    { id: "sellers", href: "#sellers", title: t.nav.sellers, description: t.search.desc.sellers, group: t.search.groups.who },
    { id: "services", href: "#services", title: t.nav.services, description: t.search.desc.services, group: t.search.groups.services },
    { id: "fleet", href: "#fleet", title: t.nav.fleet, description: t.search.desc.fleet, group: t.search.groups.operations },
    { id: "enterprise", href: "#enterprise", title: t.nav.enterprise, description: t.search.desc.enterprise, group: t.search.groups.operations },
    { id: "contact", href: "#contact", title: t.nav.contact, description: t.search.desc.contact, group: t.search.groups.company },
    { id: "proof", href: "#proof", title: t.nav.proof, description: t.search.desc.proof, group: t.search.groups.company },
  ];

  for (const id of facts.services) {
    const name = t.planner.services[id].name;
    const desc = t.planner.services[id].desc;
    hits.push({
      id: `service-${id}`,
      href: id === "fleet" || id === "manpower" ? (id === "fleet" ? "#fleet" : "#enterprise") : "#services",
      title: name,
      description: desc,
      group: t.search.groups.services,
    });
  }

  // Service landing pages carry the search terms buyers use (warehouse, drivers, freight…).
  if (lang) {
    for (const slug of SERVICE_SLUGS) {
      const pg = servicePages[lang][slug];
      hits.push({ id: `page-${slug}`, href: `/${lang}/services/${slug}`, title: pg.h1, description: `${pg.metaDescription} ${pg.keywords.join(" ")}`, group: t.search.groups.services });
    }
  }

  hits.push({
    id: "partners",
    href: "#proof",
    title: t.proof.partnersTitle,
    description: facts.partners.join(" · "),
    group: t.search.groups.company,
  });

  const alias = ALIASES[lang ?? "en"];
  for (const hit of hits) hit.keywords = alias[hit.id];
  return hits;
}

export function searchSite(index: SearchHit[], query: string, lang: Locale = "en"): SearchHit[] {
  const raw = query.trim();
  if (raw.length < 2) return [];
  const q = normalize(raw);
  const stop = new Set(STOP[lang].map(normalize));
  const all = words(raw);
  const tokens = all.filter((w) => !stop.has(w));
  const used = tokens.length ? tokens : all;

  return index
    .map((hit) => {
      const title = normalize(hit.title);
      const hay = normalize(`${hit.title} ${hit.description} ${hit.group}`);
      const phrases = (hit.keywords ?? []).map(normalize);
      const vocab = new Set([...words(hit.title), ...phrases.flatMap((p) => words(p))]);
      let score = 0;
      if (title.startsWith(q)) score += 6;
      else if (title.includes(q)) score += 4;
      if (hay.includes(q)) score += 2;
      // the whole phrase is one of this page's search terms, or sits inside one
      if (phrases.some((p) => p === q)) score += 8;
      else if (phrases.some((p) => p.includes(q) || (q.length > 4 && q.includes(p) && p.length > 3))) score += 5;
      // word by word: exact, as the start of a word, or a near miss
      for (const w of used) {
        if (vocab.has(w)) score += 3;
        else if (w.length >= 3 && [...vocab].some((v) => v.startsWith(w) || (w.length >= 5 && w.startsWith(v) && v.length >= 4))) score += 2;
        else if (w.length >= 5 && [...vocab].some((v) => within(w, v, w.length >= 8 ? 2 : 1))) score += 2;
        else if (hay.includes(w) && w.length >= 3) score += 1;
      }
      return { hit, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.hit);
}

/** when nothing matches, the next step is still MSG: the plan builder and the contact form */
export function fallbackHits(index: SearchHit[]): SearchHit[] {
  return ["planner", "contact"].map((id) => index.find((h) => h.id === id)).filter((h): h is SearchHit => !!h);
}
