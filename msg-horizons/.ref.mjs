import { chromium } from "playwright";
const OUT = process.argv[2];
const sites = process.argv.slice(3);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", proxy: { server: process.env.HTTPS_PROXY }, args: ["--ignore-certificate-errors-spki-list=KnP1OnzHv/y42eRQmbGwoYTHcSJF448m6CU5mdngwKk="] });
for (const url of sites) {
  const name = new URL(url).hostname.replace(/^www\./, "");
  try {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await p.waitForTimeout(5000);
    await p.screenshot({ path: `${OUT}/${name}-1.png` });
    await p.evaluate(() => window.scrollTo(0, 1500)); await p.waitForTimeout(2000);
    await p.screenshot({ path: `${OUT}/${name}-2.png` });
    console.log("ok", name);
    await p.close();
  } catch (e) { console.log("fail", name, e.message.split("\n")[0]); }
}
await b.close();
