// Exports the company profile deck as PDFs, one page per slide at 1920 × 1080, from the deck's print layout
// (app/[lang]/company-profile/deck?print). Run against a local build:
//   npm run build && npx next start -p 3100 &  node reel/profile-pdf.mjs
// Writes public/media/profile/MSG-Horizons-Company-Profile-{EN,AR}.pdf, which the deck's "Download PDF" serves.
import { chromium } from "playwright";

const BASE = (process.env.BASE_URL || "http://localhost:3100").replace(/\/$/, "");
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
for (const lang of ["en", "ar"]) {
  await page.goto(`${BASE}/${lang}/company-profile/deck?print`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const out = `public/media/profile/MSG-Horizons-Company-Profile-${lang.toUpperCase()}.pdf`;
  await page.pdf({ path: out, width: "1920px", height: "1080px", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  console.log("wrote", out);
}
await browser.close();
