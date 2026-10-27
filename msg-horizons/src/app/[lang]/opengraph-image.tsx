import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "MSG Horizons Logistics: last-mile delivery and logistics across Saudi Arabia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ar" }];
}

/** The share card, after the brand guidelines' closing slide: navy field, the blue shard, the white lockup. */
export default async function Image() {
  const lockup = await readFile(path.join(process.cwd(), "public/brand/msg-logo-white.svg"));
  const src = `data:image/svg+xml;base64,${lockup.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#1C2C51", fontFamily: "sans-serif" }}>
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", inset: 0 }}>
          <polygon points="660,0 990,0 1200,370 1200,420" fill="#009DF8" />
        </svg>
        <img src={src} width={560} height={108} alt="" style={{ position: "absolute", left: 72, top: 92 }} />
        <div style={{ position: "absolute", left: 72, right: 72, bottom: 72, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 700, color: "#ffffff", letterSpacing: -1.5, lineHeight: 1.05 }}>
            Last-mile delivery across Saudi Arabia
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#bcd3f0", marginTop: 18 }}>1,000+ couriers · 100+ vehicles · 24/7</div>
        </div>
      </div>
    ),
    size,
  );
}
