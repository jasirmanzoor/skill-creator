// End-to-end + accessibility suite. Run against a production server:
//   npm run build && npx next start -p 3100 &  BASE_URL=http://localhost:3100 npm run test:e2e
// Against production:  BASE_URL=https://<your-domain> npm run test:e2e
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { installFakeMap } from "./fake-map.mjs";

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = (process.env.BASE_URL || "http://localhost:3100").replace(/\/$/, "");
const isLocal = /localhost|127\.0\.0\.1/.test(BASE);
const proxy = !isLocal && process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined; // honour egress proxies
// TRUST_SPKI: base64 SPKI hash of a proxy CA to trust (sandboxes that re-sign TLS). Verification stays on.
const args = process.env.TRUST_SPKI ? [`--ignore-certificate-errors-spki-list=${process.env.TRUST_SPKI}`] : [];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, proxy, args });
let failed = 0;
const results = [];

async function test(name, fn) {
  if (process.env.E2E_VERBOSE) console.log("… " + name);
  const t0 = Date.now();
  try {
    await fn();
    results.push(`✔ ${name} (${Date.now() - t0}ms)`);
  } catch (e) {
    failed++;
    results.push(`✘ ${name}\n    ${String(e?.message || e).split("\n").slice(0, 6).join("\n    ")}`);
  }
}

async function open(path, opts = {}, setup) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  if (setup) await setup(ctx); // e.g. stand-in map services, installed before the page asks for them
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/_vercel|Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  return { page, ctx, errors };
}

await test("root redirects by Accept-Language", async () => {
  const en = await fetch(BASE + "/", { redirect: "manual", headers: { "accept-language": "en-US,en;q=0.9" } });
  assert.equal(en.status, 307);
  assert.match(en.headers.get("location"), /\/en$/);
  const ar = await fetch(BASE + "/", { redirect: "manual", headers: { "accept-language": "ar-SA,ar;q=0.9,en;q=0.5" } });
  assert.match(ar.headers.get("location"), /\/ar$/);
});

await test("SEO: metadata, hreflang, JSON-LD, sitemap, robots, OG image", async () => {
  for (const lang of ["en", "ar"]) {
    const html = await (await fetch(`${BASE}/${lang}`)).text();
    assert.match(html, new RegExp(`<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}"`));
    assert.match(html, /<meta name="description" content="[^"]{80,}/);
    assert.match(html, /<link rel="canonical" href="[^"]+\/(en|ar)"/);
    assert.match(html, /hrefLang="ar"/i);
    assert.match(html, /hrefLang="x-default"/i);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, "exactly one h1");
    const ld = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
    const json = JSON.parse(ld);
    assert.equal(json["@graph"][0]["@type"], "Organization");
    assert.equal(json["@graph"][0].telephone, "+966578061556");
    assert.ok(!/customs/i.test(ld), "customs clearance must not be promoted");
    const og = await fetch(`${BASE}/${lang}/opengraph-image`);
    assert.equal(og.status, 200);
    assert.match(og.headers.get("content-type"), /image\/png/);
  }
  const sm = await (await fetch(BASE + "/sitemap.xml")).text();
  assert.match(sm, /\/en<\/loc>/);
  assert.match(sm, /\/ar<\/loc>/);
  const robots = await (await fetch(BASE + "/robots.txt")).text();
  assert.match(robots, /Sitemap:/);
});

await test("no forbidden claims in rendered copy", async () => {
  for (const lang of ["en", "ar"]) {
    const html = await (await fetch(`${BASE}/${lang}`)).text();
    // <output> holds the visitor's own slider values (e.g. "30%" cash share), not site claims
    // <aside data-rate-card> blocks hold MSG's own supplied rate card, the only places prices are stated
    const text = html
      .replace(/<aside[^>]*data-rate-card[\s\S]*?<\/aside>/g, "")
      .replace(/<(script|style|output)[\s\S]*?<\/\1>/g, "").replace(/<[^>]+>/g, " ");
    assert.ok(!/customs|تخليص جمركي/i.test(text), `${lang}: customs clearance must not be promoted`);
    assert.ok(!/amazon/i.test(text), `${lang}: no Amazon comparison`);
    assert.ok(!/\bSAR\s?\d+(?![\d,.]*M\+)/.test(text), `${lang}: no pricing in SAR`);
    assert.ok(!/\d{2,3}(\.\d)?\s?%/.test(text), `${lang}: no invented percentages`);
  }
});

await test("planner: build a plan, share it, carry it into the contact form", async () => {
  const { page, ctx, errors } = await open("/en");
  await page.locator("#planner").scrollIntoViewIfNeeded();
  await page.getByRole("radio", { name: /Growing e-commerce brand/ }).click();
  await page.getByRole("checkbox", { name: /Orders to customers/ }).click();
  await page.getByRole("checkbox", { name: /Stock that needs a home/ }).click();
  // live preview reacts before the plan is finished
  assert.ok(await page.locator("aside[aria-label='Your configuration, live']").getByText("Warehousing & Inventory").isVisible());
  await page.getByRole("button", { name: /Continue/ }).click();
  // step 3: the network sizer — ~730 orders a day lands in the "scaling" band
  await page.locator("#planner input[type=range]").first().fill("600");
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("checkbox", { name: /Live tracking/ }).click();
  await page.getByRole("checkbox", { name: /Handling peaks/ }).click();
  await page.getByRole("button", { name: /Build my plan/ }).last().click();
  await page.getByRole("heading", { name: "Growth Engine" }).waitFor();
  const result = await page.locator("#planner").innerText();
  for (const s of ["Shipping & Last-Mile Delivery", "Warehousing & Inventory", "Real-Time Tracking & Support", "Manpower & Peak Support", "Dedicated Account Management", "Why this structure", "Daily routes", "Couriers on your peak day"])
    assert.ok(result.includes(s), `missing ${s}`);
  assert.ok(!/SAR|﷼|price:/i.test(result.replace(/no prices here/i, "")), "no pricing in result");
  assert.match(decodeURIComponent(page.url()), /[?&]plan=ecommerce~parcels\.storage~scaling~visibility\.peaks/);
  const wa = await page.getByRole("link", { name: /Send on WhatsApp/ }).getAttribute("href");
  assert.match(wa, /^https:\/\/wa\.me\/966578061556\?text=/);
  assert.match(decodeURIComponent(wa), /Growth Engine/);
  assert.match(decodeURIComponent(wa), /Orders a day: [\d,]{3,}/);

  await page.getByRole("button", { name: /Send this plan to MSG/ }).click();
  await page.getByText("Your logistics plan is attached").waitFor();
  assert.equal(await page.locator("#lead-interest").inputValue(), "ecommerce");
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test("planner: priorities are capped at three", async () => {
  const { page, ctx } = await open("/en?plan=");
  await page.getByRole("radio", { name: /New startup/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  for (const n of ["Fast execution", "On-time delivery", "Live tracking"])
    await page.getByRole("checkbox", { name: n }).click();
  assert.equal(await page.locator('#planner [role=checkbox][aria-checked="true"]').count(), 3);
  assert.equal(await page.getByRole("checkbox", { name: "Shipment security" }).getAttribute("aria-disabled"), "true");
  await ctx.close();
});

await test("network sizer recalculates live as inputs change", async () => {
  const { page, ctx, errors } = await open("/en?persona=seller#planner");
  await page.getByRole("button", { name: /Continue/ }).click();
  const live = page.locator("#planner aside[aria-label='Calculated live']");
  await live.waitFor();
  const peak = () => live.locator("dd").nth(2).getAttribute("data-value");
  const before = await peak();
  await page.locator("#planner input[type=range]").first().fill("900");
  await page.waitForTimeout(900);
  assert.notEqual(await peak(), before, "peak couriers should change with orders");
  await page.locator("#planner").getByRole("radio", { name: "Across the Kingdom" }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Build my plan/ }).last().click();
  await page.getByText("Scheduled land freight between cities").waitFor();
  assert.ok(await page.locator("#planner").getByText("Land Freight", { exact: true }).isVisible());
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test("service landing pages: indexable, one h1, FAQ + Service schema, in sitemap", async () => {
  const sm = await (await fetch(BASE + "/sitemap.xml")).text();
  for (const [lang, slug] of [["en", "last-mile-delivery-saudi-arabia"], ["ar", "warehousing-storage-riyadh"], ["en", "delivery-drivers-manpower-saudi-arabia"]]) {
    const res = await fetch(`${BASE}/${lang}/services/${slug}`);
    assert.equal(res.status, 200, slug);
    const html = await res.text();
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${slug}: exactly one h1`);
    assert.match(html, new RegExp(`<link rel="canonical" href="[^"]+/${lang}/services/${slug}"`));
    const types = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].flatMap((m) => JSON.parse(m[1])["@graph"].map((g) => g["@type"]));
    for (const t of ["Service", "FAQPage", "BreadcrumbList"]) assert.ok(types.includes(t), `${slug}: ${t}`);
    const text = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, "").replace(/<[^>]+>/g, " ");
    assert.ok(!/customs|تخليص جمركي|cash on delivery|الدفع عند الاستلام/i.test(text), `${slug}: excluded claims`);
    assert.match(sm, new RegExp(`/${lang}/services/${slug}</loc>`));
  }
  assert.equal((await fetch(`${BASE}/en/services/not-a-service`)).status, 404);
});

await test("red sea bands: no walk-in table, live approx cost per order, Sabya slot", async () => {
  for (const lang of ["en", "ar"]) {
    const { page, ctx, errors } = await open(`/${lang}`, { viewport: { width: 440, height: 900 } });
    assert.equal(await page.locator("#network [data-rate-card]").count(), 0, `${lang}: no rate table in the network band`);
    const sabya = await page.locator("#growth aside[data-rate-card]").last().locator("dd").allTextContents();
    assert.deepEqual(sabya.map((t) => t.replace(/\D/g, "")), ["17", "28"], `${lang}: Sabya approx per order`);
    assert.match(await page.locator("#growth h3").innerText(), /800/);
    // price band: 120 intra-city = walk-in 33 → 3,960; 300 = 299 band 21 → 6,300
    const panel = page.locator("#growth aside[data-rate-card]").first();
    const slider = page.locator("#growth input[type=range]");
    await slider.fill("120");
    await page.waitForTimeout(900);
    assert.equal(await panel.locator("[data-monthly]").getAttribute("data-monthly"), "3960", `${lang}: 120 × 33`);
    await slider.fill("300");
    await page.waitForTimeout(900);
    assert.equal(await panel.locator("[data-monthly]").getAttribute("data-monthly"), "6300", `${lang}: 300 × 21`);
    assert.match(await panel.getByRole("link").getAttribute("href"), /wa\.me\/966578061556/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${lang}: no horizontal page scroll`);
    assert.deepEqual(errors, []);
    await ctx.close();
  }
});

await test("experience: seller questions, 6-step roadmap, partner logos load", async () => {
  for (const lang of ["en", "ar"]) {
    const { page, ctx, errors } = await open(`/${lang}`);
    assert.equal(await page.locator("#sellers .need-card").count(), 9, `${lang}: nine seller questions`);
    assert.ok(await page.locator("#journey [role=tab]").count() >= 6, `${lang}: roadmap steps`);
    await page.locator("#partners").scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const logos = await page.locator("#partners img").evaluateAll((els) => els.map((e) => [e.getAttribute("alt"), e.complete && e.naturalWidth > 0]));
    assert.ok(logos.length >= 3, `${lang}: official partner logos present`);
    for (const [alt, ok] of logos) assert.ok(ok, `${lang}: ${alt} logo failed to load`);
    assert.deepEqual(errors, []);
    await ctx.close();
  }
});

await test("roadmap: segment → steps → estimator → curated plan with approx cost per order", async () => {
  const { page, ctx, errors } = await open("/en");
  const sec = page.locator("#journey");
  await sec.scrollIntoViewIfNeeded();
  await sec.getByRole("radio", { name: /Scaling SMEs/ }).first().click();
  const stage = page.locator("#roadmap-stage");
  await page.locator("#journey").getByRole("button", { name: "Next step" }).click();
  await stage.getByText("We map your requirements").waitFor();
  for (let k = 0; k < 4; k++) await page.locator("#journey").getByRole("button", { name: "Next step" }).click();
  await stage.getByText("Testing & go-live").waitFor();
  const est = page.locator("#estimator");
  await est.locator("input[type=range]").nth(1).fill("40");
  await est.getByRole("button", { name: "Generate my plan" }).click();
  await est.getByText("Curated recommendation plan").waitFor();
  const txt = await est.innerText();
  // SME opens at 400 a day in Riyadh = 12,000 a month → intra-city card rate 21
  assert.match(txt, /≈\s*SAR\s*21\b/, "approx cost per order from MSG's rate card");
  assert.match(txt, /252,000 a month for 12,000 orders/);
  const wa = await est.getByRole("link", { name: /Get my quote on WhatsApp/ }).getAttribute("href");
  assert.match(wa, /^https:\/\/wa\.me\/966578061556\?text=/);
  await est.getByRole("button", { name: "Send plan to MSG" }).click();
  await page.getByText("Your logistics plan is attached").waitFor();
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test("shared plan link opens directly on the result", async () => {
  const { page, ctx } = await open("/ar?plan=platform~people~high~peaks#planner");
  await page.getByRole("heading", { name: "شريك الطاقة الاستيعابية" }).waitFor({ timeout: 5000 });
  await ctx.close();
});

await test("contact form: validation, then graceful WhatsApp/email hand-off", async () => {
  const { page, ctx } = await open("/en#contact");
  await page.locator("form[data-ready]").waitFor(); // hydrated (before this, the form posts natively)
  await page.getByRole("button", { name: "Send to MSG" }).click();
  assert.ok(await page.getByText("This field is required").first().isVisible());
  assert.equal(await page.locator("#lead-name").evaluate((el) => el === document.activeElement), true, "focus moves to first error");
  await page.fill("#lead-name", "Test Seller");
  await page.fill("#lead-phone", "123");
  await page.getByRole("button", { name: "Send to MSG" }).click();
  assert.ok(await page.getByText("Please enter a valid mobile number").isVisible());
  await page.fill("#lead-phone", "0551234567");
  await page.getByRole("button", { name: "Send to MSG" }).click();
  // With no delivery channel configured locally we expect the hand-off; in production, success.
  await page.getByText(/One more tap to reach MSG|Thank you\. Your request is with MSG\./).waitFor();
  if (await page.getByText("One more tap to reach MSG").isVisible()) {
    const href = await page.getByRole("link", { name: "Send via WhatsApp" }).getAttribute("href");
    assert.match(decodeURIComponent(href), /Test Seller/);
    assert.match(decodeURIComponent(href), /0551234567/);
  }
  await ctx.close();
});

await test("contact form works without JavaScript (native POST, no PII in URL)", async () => {
  // reduced motion turns off smooth scrolling (globals.css); otherwise every Playwright
  // scroll-into-view restarts the smooth scroll and the button never reads as "stable"
  const { page, ctx } = await open("/en#contact", { javaScriptEnabled: false, reducedMotion: "reduce" });
  await page.fill("#lead-name", "No JS (ignore)");
  await page.fill("#lead-phone", "0550000000");
  await page.fill("input[name=website]", "hp", { force: true }); // honeypot: never delivered
  await Promise.all([page.waitForURL(/lead=/), page.getByRole("button", { name: "Send to MSG" }).click()]);
  assert.match(page.url(), /\/en\?lead=sent#contact$/);
  assert.ok(!/0550000000|No%20JS/.test(page.url()), "no personal data in the URL");
  await ctx.close();
});

await test("lead API: rejects invalid, accepts valid", async () => {
  const bad = await fetch(BASE + "/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "" }) });
  assert.equal(bad.status, 422);
  const junk = await fetch(BASE + "/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: "{nope" });
  assert.equal(junk.status, 400);
  if (!process.env.SKIP_LEAD_POST) {
    const ok = await fetch(BASE + "/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "E2E Test (ignore)", phone: "0550000000", interest: "other", lang: "en", website: "hp" }), // honeypot: never delivered
    });
    assert.equal(ok.status, 200);
  }
});

await test("mobile: no horizontal overflow, CTA bar appears after the hero", async () => {
  for (const lang of ["en", "ar"]) {
    const { page, ctx } = await open(`/${lang}`, { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(over <= 0, `${lang}: horizontal overflow ${over}px`);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(700);
    assert.ok(await page.getByRole("link", { name: lang === "en" ? "Build my plan" : "ابنِ خطتك" }).last().isVisible());
    await ctx.close();
  }
});

await test("reduced motion: hero renders final state immediately", async () => {
  const { page, ctx, errors } = await open("/en", { reducedMotion: "reduce" });
  await page.waitForTimeout(300);
  const txt = await page.locator("section[aria-labelledby=hero-title]").innerText();
  assert.match(txt, /1,000\+/);
  assert.deepEqual(errors, []);
  await ctx.close();
});

// Scroll until the route console is close enough for its lazy-loaded map to start.
async function toConsole(page) {
  await page.locator("#planner").scrollIntoViewIfNeeded();
  for (let k = 0; k < 12; k++) {
    if (await page.locator("#planner .maplibregl-canvas, #planner canvas[role=img]").count()) break;
    await page.evaluate(() => window.scrollBy(0, 450));
    await page.waitForTimeout(400);
  }
  // the map only animates while it is on screen, so bring it fully into view
  await page.locator("#planner .maplibregl-canvas, #planner canvas[role=img]").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
}

await test("route console: the camera flies the route on a real map (stand-in map services)", async () => {
  const { page, ctx, errors } = await open("/en", {}, installFakeMap);
  await toConsole(page);
  const host = page.locator("#planner [data-cam]");
  await host.waitFor({ state: "attached", timeout: 20000 });
  const read = async () => {
    const [lng, lat, zoom, bearing, pitch, beat] = (await host.getAttribute("data-cam")).split(",").map(Number);
    return { lng, lat, zoom, bearing, pitch, beat };
  };
  const a = await read();
  await page.waitForTimeout(3000);
  const b = await read();
  assert.ok(Math.hypot(b.lng - a.lng, b.lat - a.lat) > 0.002, "the camera travels along the route");
  assert.ok(b.pitch >= 45, `tilted like a chase camera (pitch ${b.pitch})`);
  assert.ok(b.zoom > 13 && b.zoom < 17.5, `street-level zoom (${b.zoom})`);
  const h = await page.locator("#planner .maplibregl-canvas").evaluate((c) => c.clientHeight);
  assert.ok(h > 330, `the map fills its box (${h}px tall)`);
  // choosing a step in the strip flies to it
  await page.locator("#planner ol button").nth(2).click();
  await page.waitForTimeout(1200);
  assert.equal((await read()).beat, 2);
  assert.ok(errors.filter((e) => !/GPU stall/.test(e)).length === 0, errors.join("\n"));
  await ctx.close();
});

await test("route console: falls back to the flat map when the map services cannot be reached", async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route("https://tiles.openfreemap.org/**", (r) => r.abort());
  const page = await ctx.newPage();
  const crashed = [];
  page.on("pageerror", (e) => crashed.push(e.message));
  await page.goto(BASE + "/en", { waitUntil: "networkidle" });
  await toConsole(page);
  await page.locator("#planner canvas[role=img]").waitFor({ state: "attached", timeout: 25000 });
  assert.equal(await page.locator("#planner .maplibregl-canvas").count(), 0, "no broken map left behind");
  await page.locator("#planner ol button").nth(1).click();
  assert.equal(await page.locator("#planner ol button[aria-current=step]").count(), 1, "the steps still work");
  assert.deepEqual(crashed, []);
  await ctx.close();
});

await test("live tracking: nothing is live until the driver approves, then the tracking page goes live (en + ar)", async () => {
  const cases = [
    ["en", "Approve", "Waiting for driver", "Live location is on", "Live location from the driver's phone"],
    ["ar", "موافق", "بانتظار المندوب", "الموقع المباشر يعمل", "الموقع المباشر من جوال المندوب"],
  ];
  for (const [lang, approve, waiting, liveTitle, liveSub] of cases) {
    const { page, ctx, errors } = await open(`/${lang}`);
    const sec = page.locator("#live-tracking");
    await sec.scrollIntoViewIfNeeded();
    assert.ok(await sec.getByText(waiting).first().isVisible(), `${lang}: starts waiting`);
    assert.equal(await sec.getByText(liveSub).count(), 0, `${lang}: no live location before approval`);
    await sec.getByRole("button", { name: approve, exact: true }).click();
    await sec.getByText(liveTitle).first().waitFor({ state: "visible", timeout: 5000 });
    assert.ok(await sec.getByText(liveSub).first().isVisible(), `${lang}: live after approval`);
    assert.deepEqual(errors, []);
    await ctx.close();
  }
});

await test("route: the rail follows the scroll, stops jump, ] and [ hop, the map opens and lands on a stop (en + ar)", async () => {
  for (const [lang, mapName, closeName] of [["en", "Open the route map", "Close the route map"], ["ar", "افتح خريطة المسار", "أغلق خريطة المسار"]]) {
    const { page, ctx, errors } = await open(`/${lang}`, { viewport: { width: 1920, height: 1000 }, reducedMotion: "reduce" });
    const rail = page.getByRole("navigation").filter({ has: page.getByRole("button", { name: mapName }) });
    await rail.waitFor({ state: "visible" });
    const topOf = (id) => page.evaluate((i) => { let t = 0, e = document.getElementById(i); while (e) { t += e.offsetTop; e = e.offsetParent; } return t; }, id);
    const here = () => rail.locator('[aria-current="location"]').getAttribute("aria-label");
    const first = await here();
    await page.evaluate((y) => window.scrollTo(0, y), (await topOf("planner")) - 64);
    await page.waitForTimeout(300);
    assert.notEqual(await here(), first, `${lang}: the rail moves with the scroll`);
    await rail.getByRole("button").nth(1).click(); // first stop after the map button
    await page.waitForTimeout(300);
    assert.ok((await page.evaluate(() => scrollY)) <= 1, `${lang}: first stop is the top`);
    await page.keyboard.press("]");
    await page.waitForTimeout(300);
    const live = await topOf("live-tracking");
    assert.ok(Math.abs((await page.evaluate(() => scrollY)) - (live - 64)) < 80, `${lang}: ] hops to the next stop`);
    await page.keyboard.press("[");
    await page.waitForTimeout(300);
    assert.ok((await page.evaluate(() => scrollY)) <= 1, `${lang}: [ hops back`);
    await page.keyboard.press("m");
    const dlg = page.getByRole("dialog");
    await dlg.waitFor({ state: "visible" });
    assert.ok(await dlg.getByRole("button", { name: closeName }).isVisible(), `${lang}: map open`);
    const lens = dlg.getByRole("radio").nth(3);
    await lens.click();
    assert.equal(await lens.getAttribute("aria-checked"), "true", `${lang}: lens chosen`);
    await dlg.getByRole("button", { name: /fleet|الأسطول/i }).first().click();
    await dlg.waitFor({ state: "detached" });
    const fleet = await topOf("fleet");
    assert.ok(Math.abs((await page.evaluate(() => scrollY)) - (fleet - 64)) < 80, `${lang}: landed on the chosen stop`);
    assert.deepEqual(errors, []);
    await ctx.close();
  }
});

await test("route: on a phone the progress button opens the route map and a stop lands", async () => {
  const { page, ctx, errors } = await open("/en", { viewport: { width: 390, height: 844 }, reducedMotion: "reduce", isMobile: true, hasTouch: true });
  await page.getByRole("button", { name: /^Open the route map/ }).click();
  const dlg = page.getByRole("dialog");
  await dlg.waitFor({ state: "visible" });
  await dlg.getByRole("button", { name: /Go to Services/ }).click();
  await dlg.waitFor({ state: "detached" });
  const y = await page.evaluate(() => scrollY);
  assert.ok(y > 1000, "moved down the page");
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test("accessibility: axe-core finds no serious/critical violations (en + ar)", async () => {
  for (const lang of ["en", "ar"]) {
    // with the stand-in map services, so the audit covers the real-map version of the route console
    const { page, ctx } = await open(`/${lang}`, { reducedMotion: "reduce" }, installFakeMap);
    for (let y = 0; y < 16000; y += 800) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(60); }
    await page.waitForTimeout(800); // let header/theme transitions settle before sampling colours
    await page.addScriptTag({ content: AXE });
    const res = await page.evaluate(async () =>
      // eslint-disable-next-line no-undef
      (await axe.run(document, { resultTypes: ["violations"] })).violations.map((v) => ({
        id: v.id, impact: v.impact, n: v.nodes.length,
        nodes: v.nodes.slice(0, 20).map((n) => n.target.join(" ") + " :: " + (n.any?.[0]?.message || "").slice(0, 110)),
      })),
    );
    // and once more with the route map open
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.keyboard.press("m");
    await page.getByRole("dialog").waitFor({ state: "visible" });
    await page.waitForTimeout(500);
    const withMap = await page.evaluate(async () =>
      // eslint-disable-next-line no-undef
      (await axe.run(document.querySelector('[role="dialog"]'), { resultTypes: ["violations"] })).violations.map((v) => ({
        id: v.id, impact: v.impact, n: v.nodes.length, nodes: v.nodes.slice(0, 10).map((n) => n.target.join(" ")),
      })),
    );
    res.push(...withMap);
    const serious = res.filter((v) => v.impact === "serious" || v.impact === "critical");
    if (res.length) console.log(`  axe ${lang}:`, JSON.stringify(res, null, 1));
    assert.equal(serious.length, 0, `${lang}: ${serious.map((v) => v.id).join(", ")}`);
    await ctx.close();
  }
});

await browser.close();
console.log(results.join("\n"));
console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
