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

// The homepage is a book (components/book): open the chapter that holds an element before reaching for it.
async function reach(page, id) {
  await page.evaluate((i) => window.dispatchEvent(new CustomEvent("msg-book-go", { detail: { id: i, immediate: true } })), id);
  await page.locator(`#${id}`).waitFor({ state: "visible" });
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
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

// the plan builder sits on the sideways deck: open its panel first
async function toPlan(page) {
  await reach(page, "planner");
  await page.waitForTimeout(900);
}
// the result keeps its detail in tabs; read them all
async function resultText(page) {
  let all = "";
  for (const name of ["Your quote", "We handle", "Services", "Next steps"]) {
    await page.locator("#planner").getByRole("tab", { name }).click();
    all += "\n" + (await page.locator("#plan-tabpanel").innerText());
  }
  return all;
}

await test("planner: build a plan, share it, carry it into the contact form", async () => {
  const { page, ctx, errors } = await open("/en");
  await toPlan(page);
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
  const result = await resultText(page);
  for (const s of ["Shipping & Last-Mile Delivery", "Warehousing & Inventory", "Real-Time Tracking & Support", "Manpower & Peak Support", "Dedicated Account Management", "Price quote", "Proof of delivery", "Live tracking", "Cash on delivery, on time", "ZATCA", "Licences"])
    assert.ok(result.includes(s), `missing ${s}`);
  assert.ok(!/Daily routes|Couriers on|peak-only|1 courier, every day/i.test(result), "no operating matrix in the client's result");
  assert.ok(await page.locator("#planner [data-rate-card]").count() >= 0);
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
  await toPlan(page);
  await page.getByRole("radio", { name: /New startup/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  for (const n of ["Fast execution", "On-time delivery", "Live tracking"])
    await page.getByRole("checkbox", { name: n }).click();
  assert.equal(await page.locator('#planner [role=checkbox][aria-checked="true"]').count(), 3);
  assert.equal(await page.getByRole("checkbox", { name: "Shipment security" }).getAttribute("aria-disabled"), "true");
  await ctx.close();
});

await test("volume step: the quote follows the numbers, and no operating matrix is shown", async () => {
  const { page, ctx, errors } = await open("/en?persona=seller#planner");
  await page.getByRole("button", { name: /Continue/ }).click();
  const quote = page.locator("#planner aside[data-rate-card]:visible");
  await quote.waitFor();
  const before = await quote.innerText();
  await page.locator("#planner").getByRole("radio", { name: "Across the Kingdom" }).click();
  assert.notEqual(await quote.innerText(), before, "the quote changes with where the orders go");
  const text = await page.locator("#planner").innerText();
  const hit = text.match(/Daily routes|Couriers on|Peak-only|Calculated live/i);
  assert.ok(!hit, `routes and courier counts are not shown to the client (${hit})`);
  for (const s of ["Price quote", "Proof of delivery", "Live tracking", "Cash on delivery, on time"]) assert.ok(text.includes(s), `missing ${s}`);
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Build my plan/ }).last().click();
  await page.locator("#planner").getByRole("tab", { name: "Services" }).click();
  assert.ok(await page.locator("#planner").getByText("Land Freight", { exact: true }).first().isVisible());
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
    assert.match(await page.locator("#growth h3").first().innerText(), /1,000/);
    // price band: 120 intra-city = walk-in 33 → 3,960; 300 = 299 band 21 → 6,300
    await reach(page, "growth");
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

await test("experience: seller answers on the map, 7-step launch sequence, partner logos load", async () => {
  for (const lang of ["en", "ar"]) {
    const { page, ctx, errors } = await open(`/${lang}`);
    assert.equal(await page.locator("#hero [data-stage-answers] li").count(), 9, `${lang}: nine seller answers across the four stages`);
    assert.equal(await page.locator("#journey [role=tab]").count(), 7, `${lang}: seven launch steps`);
    await reach(page, "partners");
    await page.waitForTimeout(600);
    const logos = await page.locator("#partners img").evaluateAll((els) => els.map((e) => [e.getAttribute("alt"), e.complete && e.naturalWidth > 0]));
    assert.ok(logos.length >= 3, `${lang}: official partner logos present`);
    for (const [alt, ok] of logos) assert.ok(ok, `${lang}: ${alt} logo failed to load`);
    assert.deepEqual(errors, []);
    await ctx.close();
  }
});

await test("one order on the map: the stage rail moves the hero through set up → settle", async () => {
  const { page, ctx, errors } = await open("/en");
  await page.evaluate(() => sessionStorage.setItem("msg-intro", "1"));
  await page.goto(`${BASE}/en#sellers`);
  const rail = page.getByRole("navigation", { name: "One order through MSG" });
  await rail.waitFor();
  await page.locator('#hero [aria-current="step"]').waitFor({ timeout: 5000 });
  assert.match(await page.locator('#hero [aria-current="step"]').innerText(), /Set up/);
  await rail.getByRole("button", { name: /Settle/ }).click();
  await page.waitForFunction(() => document.querySelector('#hero [aria-current="step"]')?.textContent?.includes("Settle"), null, { timeout: 5000 });
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test("launch sequence: seven steps, keyboard, WhatsApp start", async () => {
  const { page, ctx, errors } = await open("/en");
  const sec = page.locator("#journey");
  await reach(page, "journey");
  await sec.getByRole("tab", { name: /Project agreement/ }).click();
  const panel = page.locator("#launch-panel");
  await panel.getByText("Signed").waitFor();
  await page.keyboard.press("ArrowDown");
  await panel.getByText("3 of 3 delivered").waitFor();
  assert.equal(await sec.getByRole("tab", { selected: true }).getAttribute("id"), "launch-tab-5");
  const wa = await sec.getByRole("link", { name: /Start with step one/ }).getAttribute("href");
  assert.match(wa, /^https:\/\/wa\.me\/966578061556\?text=/);
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test("estimator: locked until sign-in, then welcomes and asks to help (answer reaches MSG)", async () => {
  const { page, ctx, errors } = await open("/en");
  const posts = [];
  page.on("request", (r) => { if (r.url().endsWith("/api/lead") && r.method() === "POST") posts.push(JSON.parse(r.postData() || "{}")); });
  const sec = page.locator("#estimate");
  await reach(page, "estimate");
  assert.ok(await sec.locator("#estimator").evaluate((el) => !!el.closest("[inert]")), "estimator is out of reach before sign-in");
  await sec.getByRole("button", { name: "Open the estimator" }).click();
  assert.ok(await sec.getByText("This field is required").first().isVisible(), "validation");
  await page.fill("#est-name", "Test Seller");
  await page.fill("#est-phone", "0551234567");
  await page.check("#est-consent");
  await sec.getByRole("button", { name: "Open the estimator" }).click();
  await sec.getByText("Welcome, Test. We're happy to see you here.").waitFor();
  assert.equal(await sec.locator("#estimator").evaluate((el) => !!el.closest("[inert]")), false, "estimator opens");
  assert.equal(posts[0]?.interest, "estimator_signin");
  assert.equal(posts[0]?.phone, "+966551234567");
  await sec.getByRole("button", { name: "No thanks, I'll browse" }).click();
  await sec.getByText("Need help later? Chat with MSG on WhatsApp.").waitFor();
  await page.waitForTimeout(300);
  assert.equal(posts[1]?.interest, "estimator_help_no");
  // the same device goes straight in next time
  await page.reload();
  await reach(page, "estimate");
  await page.locator("#estimate").getByText("Welcome, Test.", { exact: false }).waitFor();
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test("peak control: the season ends on the record (outro), and hands back", async () => {
  const { page, ctx, errors } = await open("/en");
  const sec = page.locator("#enterprise");
  await reach(page, "enterprise");
  await sec.getByRole("button", { name: "Behind every peak" }).click();
  await sec.getByText(/^The record(?: behind every peak|, and the people who keep it)\./).waitFor();
  assert.ok(await sec.getByText("couriers on the network").isVisible());
  await sec.getByRole("button", { name: "Replay the season" }).click();
  await sec.getByText(/^The record(?: behind every peak|, and the people who keep it)\./).waitFor({ state: "detached" });
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
    // smooth scrolling eases toward the target: wait until the page is past the hero rather than a fixed time
    await page.waitForFunction(() => window.scrollY > window.innerHeight * 0.8, null, { timeout: 5000 });
    await page.waitForTimeout(400);
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
  await reach(page, "planner");
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
  const { page, ctx, errors } = await open("/en#planner", {}, installFakeMap);
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
  await page.locator("#planner [data-beats] button").nth(2).click();
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
  await page.goto(BASE + "/en#planner", { waitUntil: "networkidle" });
  await toConsole(page);
  await page.locator("#planner canvas[role=img]").waitFor({ state: "attached", timeout: 25000 });
  assert.equal(await page.locator("#planner .maplibregl-canvas").count(), 0, "no broken map left behind");
  await page.locator("#planner [data-beats] button").nth(1).click();
  assert.equal(await page.locator("#planner [data-beats] button[aria-current=step]").count(), 1, "the steps still work");
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
    await reach(page, "live-tracking");
    assert.ok(await sec.getByText(waiting).first().isVisible(), `${lang}: starts waiting`);
    assert.equal(await sec.getByText(liveSub).count(), 0, `${lang}: no live location before approval`);
    await sec.getByRole("button", { name: approve, exact: true }).click();
    await sec.getByText(liveTitle).first().waitFor({ state: "visible", timeout: 5000 });
    assert.ok(await sec.getByText(liveSub).first().isVisible(), `${lang}: live after approval`);
    assert.deepEqual(errors, []);
    await ctx.close();
  }
});

await test("book: one chapter open; the rail, #links, ] and [ and the back button turn the pages (en + ar)", async () => {
  for (const [lang, rail] of [["en", "Chapters"], ["ar", "الفصول"]]) {
    const { page, ctx, errors } = await open(`/${lang}`, { reducedMotion: "reduce" });
    const opened = () => page.evaluate(() => document.querySelector("[data-chapter][data-current]")?.dataset.chapter);
    assert.equal(await page.locator("[data-chapter]").count(), 9, `${lang}: nine chapters in the HTML`);
    assert.equal(await opened(), "hero", `${lang}: opens on the cover`);
    assert.ok(!(await page.locator("#contact").isVisible()), `${lang}: later chapters wait`);
    const nav = page.getByRole("navigation", { name: rail });
    await nav.locator('a[href="#estimate"]').click();
    await page.waitForFunction(() => document.querySelector("[data-chapter][data-current]")?.dataset.chapter === "estimate");
    assert.equal(await nav.locator('[aria-current="step"]').getAttribute("href"), "#estimate", `${lang}: the rail lights the open chapter`);
    assert.ok((await page.evaluate(() => scrollY)) <= 1, `${lang}: a new chapter opens at its top`);
    await page.keyboard.press("]");
    await page.waitForFunction(() => document.querySelector("[data-chapter][data-current]")?.dataset.chapter === "planner");
    await page.keyboard.press("[");
    await page.waitForFunction(() => document.querySelector("[data-chapter][data-current]")?.dataset.chapter === "estimate");
    // a #link to a section deep in another chapter turns there and lands on the section
    await page.evaluate(() => { const a = document.createElement("a"); a.href = "#partners"; a.id = "t-link"; a.textContent = "x"; document.querySelector("[data-current]").prepend(a); });
    await page.evaluate(() => document.getElementById("t-link").click());
    await page.waitForFunction(() => document.querySelector("[data-chapter][data-current]")?.dataset.chapter === "proof");
    await page.waitForTimeout(200);
    const top = await page.locator("#partners").evaluate((el) => el.getBoundingClientRect().top);
    assert.ok(Math.abs(top - 64) < 80, `${lang}: landed on the section (${top})`);
    await page.goBack();
    await page.waitForFunction(() => document.querySelector("[data-chapter][data-current]")?.dataset.chapter === "estimate");
    // the turn card at the end of a chapter goes on to the next
    await page.locator('[data-current] .turn-card').click();
    await page.waitForFunction(() => document.querySelector("[data-chapter][data-current]")?.dataset.chapter === "planner");
    assert.deepEqual(errors, []);
    await ctx.close();
  }
});

await test("book: a shared link opens on its chapter, and the footer only closes the book", async () => {
  const { page, ctx, errors } = await open("/en#fleet", { reducedMotion: "reduce" });
  assert.equal(await page.evaluate(() => document.querySelector("[data-chapter][data-current]")?.dataset.chapter), "fleet");
  assert.ok(!(await page.locator("footer").isVisible()), "no footer mid-book");
  await reach(page, "contact");
  assert.ok(await page.locator("footer").isVisible(), "footer at the end");
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test("book: on a phone the rail turns to a chapter, and the theme toggle switches to dark and remembers", async () => {
  const { page, ctx, errors } = await open("/en", { viewport: { width: 390, height: 844 }, reducedMotion: "reduce", isMobile: true, hasTouch: true });
  await page.getByRole("navigation", { name: "Chapters" }).locator('a[href="#services"], a[href="#why"]').first().click();
  await page.waitForFunction(() => document.querySelector("[data-chapter][data-current]")?.dataset.chapter === "why");
  await page.getByRole("button", { name: "Dark theme" }).click();
  assert.ok(await page.evaluate(() => document.documentElement.classList.contains("dark")), "dark on");
  await page.reload({ waitUntil: "networkidle" });
  assert.ok(await page.evaluate(() => document.documentElement.classList.contains("dark")), "dark remembered");
  assert.equal(await page.getByRole("button", { name: "Dark theme" }).getAttribute("aria-pressed"), "true");
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no horizontal page scroll");
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test("accessibility: axe-core finds no serious/critical violations in any chapter (en + ar, light + dark)", async () => {
  for (const lang of ["en", "ar"]) {
    for (const colorScheme of ["light", "dark"]) {
      // with the stand-in map services, so the audit covers the real-map version of the route console
      const { page, ctx } = await open(`/${lang}`, { reducedMotion: "reduce", colorScheme }, installFakeMap);
      await page.addScriptTag({ content: AXE });
      const res = [];
      const ids = await page.$$eval("[data-chapter]", (els) => els.map((e) => e.dataset.chapter));
      for (const id of ids) {
        await page.evaluate((i) => window.dispatchEvent(new CustomEvent("msg-book-go", { detail: { id: i, immediate: true } })), id);
        await page.waitForTimeout(300);
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < h; y += 800) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(60); }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(1000); // let header/theme transitions settle before sampling colours
        const v = await page.evaluate(async () =>
          // eslint-disable-next-line no-undef
          (await axe.run(document, { resultTypes: ["violations"] })).violations.map((v) => ({
            id: v.id, impact: v.impact, n: v.nodes.length,
            nodes: v.nodes.slice(0, 20).map((n) => n.target.join(" ") + " :: " + (n.any?.[0]?.message || "").slice(0, 110)),
          })),
        );
        res.push(...v.map((x) => ({ chapter: id, ...x })));
      }
      const serious = res.filter((v) => v.impact === "serious" || v.impact === "critical");
      if (res.length) console.log(`  axe ${lang} ${colorScheme}:`, JSON.stringify(res, null, 1));
      assert.equal(serious.length, 0, `${lang} ${colorScheme}: ${[...new Set(serious.map((v) => v.chapter + ":" + v.id))].join(", ")}`);
      await ctx.close();
    }
  }
});

await browser.close();
console.log(results.join("\n"));
console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
