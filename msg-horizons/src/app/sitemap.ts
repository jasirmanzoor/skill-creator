import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/facts";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: `${SITE_URL}/en`, ar: `${SITE_URL}/ar` };
  return (["en", "ar"] as const).map((l) => ({
    url: `${SITE_URL}/${l}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: l === "en" ? 1 : 0.9,
    alternates: { languages },
  }));
}
