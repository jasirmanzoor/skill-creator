// Visual QA: screenshots every section. Usage: node tests/e2e/screens.mjs <outDir> [lang] [width] [baseUrl]
import { chromium } from "playwright";
const [out = "screens", lang = "en", width = "1440", base = process.env.BASE_URL || "http://localhost:3100"] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const p = await b.newPage({ viewport: { width: +width, height: 900 } });
await p.goto(`${base}/${lang}`, { waitUntil: "networkidle" });
for (let y = 0; y < 20000; y += 600) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(100); }
for (const sel of ["#planner", "#sellers", "#services", "#fleet", "#enterprise", "section[aria-labelledby=proof-title]", "#contact", "footer"]) {
  const el = await p.$(sel);
  if (!el) { console.warn("missing", sel); continue; }
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(800);
  await el.screenshot({ path: `${out}/${lang}-${width}-${sel.replace(/[^a-z]/g, "")}.png` });
}
await b.close();
