import { ImageResponse } from "next/og";
import { KSA_DOTS, KSA_HEIGHT, KSA_WIDTH, RIYADH } from "@/lib/ksa-geo";

export const alt = "MSG Horizons — last-mile delivery and logistics across Saudi Arabia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ar" }];
}

export default async function Image() {
  const s = 520 / KSA_WIDTH;
  const dots = KSA_DOTS.slice(0, 1000)
    .map(([x, y]) => `<circle cx="${(x * s).toFixed(1)}" cy="${(y * s).toFixed(1)}" r="3.4" fill="#c4cee2" fill-opacity="0.7"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${520}" height="${(KSA_HEIGHT * s).toFixed(0)}">${dots}<circle cx="${RIYADH[0] * s}" cy="${RIYADH[1] * s}" r="9" fill="#f6a623"/><circle cx="${RIYADH[0] * s}" cy="${RIYADH[1] * s}" r="22" fill="none" stroke="#f6a623" stroke-opacity="0.5" stroke-width="2"/></svg>`;
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", background: "#05070d", color: "white",
          padding: 64, justifyContent: "space-between", alignItems: "center",
          backgroundImage: "radial-gradient(ellipse at 50% 120%, rgba(246,166,35,0.35), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 560 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#f6a623", letterSpacing: 3 }}>MSG HORIZONS</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1, marginTop: 24, letterSpacing: -2 }}>
            Every dot is a courier.
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#c9d0dc", marginTop: 28, lineHeight: 1.3 }}>
            Last-mile delivery & logistics across Saudi Arabia
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#4fe3c1", marginTop: 36 }}>1,000+ couriers · 100+ vehicles · 24/7</div>
        </div>
        <img src={src} width={520} height={Math.round(KSA_HEIGHT * s)} alt="" />
      </div>
    ),
    size,
  );
}
