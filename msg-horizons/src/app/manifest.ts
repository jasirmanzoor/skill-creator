import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MSG Horizons",
    short_name: "MSG Horizons",
    description: "Last-mile delivery and logistics across Saudi Arabia.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf7",
    theme_color: "#0c0e11",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
