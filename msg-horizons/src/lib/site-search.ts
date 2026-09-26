import type { Dictionary } from "@/content/i18n";
import type { NavId } from "@/content/nav";
import { facts } from "@/content/facts";

export type SearchHit = {
  id: string;
  href: `#${NavId}`;
  title: string;
  description: string;
  group: string;
};

export function buildSearchIndex(t: Dictionary): SearchHit[] {
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

  hits.push({
    id: "partners",
    href: "#proof",
    title: t.proof.partnersTitle,
    description: facts.partners.join(" · "),
    group: t.search.groups.company,
  });

  return hits;
}

export function searchSite(index: SearchHit[], query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return index
    .map((hit) => {
      const hay = `${hit.title} ${hit.description} ${hit.group}`.toLowerCase();
      let score = 0;
      if (hit.title.toLowerCase().startsWith(q)) score += 6;
      else if (hit.title.toLowerCase().includes(q)) score += 4;
      if (hay.includes(q)) score += 2;
      return { hit, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.hit);
}
