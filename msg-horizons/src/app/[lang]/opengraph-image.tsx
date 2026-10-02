import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "MSG Horizons: last-mile delivery and logistics across Saudi Arabia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ar" }];
}

export default async function Image() {
  const photo = await readFile(path.join(process.cwd(), "public/media/brand/horizon-1280.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "sans-serif" }}>
        <img src={src} width={1200} height={630} alt="" style={{ position: "absolute", inset: 0, objectFit: "cover", objectPosition: "50% 50.8%" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center", fontSize: 170, fontWeight: 700, letterSpacing: 10, color: "#eadcbc" }}>
          MSG
        </div>
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 56, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 54, fontWeight: 700, color: "#0c0e11", letterSpacing: -1.5, lineHeight: 1.05 }}>
            Last-mile delivery across Saudi Arabia
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#2a2e35", marginTop: 16 }}>MSG Horizons · 1,000+ couriers · 100+ vehicles · 24/7</div>
        </div>
      </div>
    ),
    size,
  );
}
