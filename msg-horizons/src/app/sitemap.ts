import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/facts";
import { SERVICE_SLUGS } from "@/content/servicePages";

export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, priority: number): MetadataRoute.Sitemap =>
    (["en", "ar"] as const).map((l) => ({
      url: `${SITE_URL}/${l}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: l === "en" ? priority : priority - 0.05,
      alternates: { languages: { en: `${SITE_URL}/en${path}`, ar: `${SITE_URL}/ar${path}` } },
    }));
  return [
    ...entry("", 1),
    ...entry("/services", 0.9),
    ...SERVICE_SLUGS.flatMap((s) => entry(`/services/${s}`, 0.85)),
  ];
}
