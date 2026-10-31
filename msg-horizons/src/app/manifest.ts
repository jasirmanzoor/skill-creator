import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MSG Horizons Logistics",
    short_name: "MSG Horizons Logistics",
    description: "Last-mile delivery and logistics across Saudi Arabia.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f9fb",
    theme_color: "#111a33",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
