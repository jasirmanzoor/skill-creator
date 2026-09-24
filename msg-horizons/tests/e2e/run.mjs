// End-to-end + accessibility suite. Run against a production server:
//   npm run build && npx next start -p 3100 &  BASE_URL=http://localhost:3100 npm run test:e2e
// Against production:  BASE_URL=https://<your-domain> npm run test:e2e
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = (process.env.BASE_URL || "http://localhost:3100").replace(/\/$/, "");
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
let failed = 0;
const results = [];

async function test(name, fn) {
  const t0 = Date.now();
  try {
    await fn();
    results.push(`✔ ${name} (${Date.now() - t0}ms)`);
  } catch (e) {
    failed++;
    results.push(`✘ ${name}\n    ${String(e?.message || e).split("\n").slice(0, 6).join("\n    ")}`);
  }
}

async function open(path, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
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
    assert.equal(json["@graph"][0].telephone, "+966558951422");
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
    const text = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, "").replace(/<[^>]+>/g, " ");
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
  await page.getByRole("radio", { name: /Scaling fast/ }).click();
  await page.getByRole("checkbox", { name: /Live tracking/ }).click();
  await page.getByRole("checkbox", { name: /Handling peaks/ }).click();
  await page.getByRole("button", { name: /Build my plan/ }).last().click();
  await page.getByRole("heading", { name: "Growth Engine" }).waitFor();
  const result = await page.locator("#planner").innerText();
  for (const s of ["Shipping & Last-Mile Delivery", "Warehousing & Inventory", "Real-Time Tracking & Support", "Manpower & Peak Support", "Dedicated Account Management"])
    assert.ok(result.includes(s), `missing ${s}`);
  assert.ok(!/SAR|﷼|price:/i.test(result.replace(/no prices here/i, "")), "no pricing in result");
  assert.match(decodeURIComponent(page.url()), /[?&]plan=ecommerce~parcels\.storage~scaling~visibility\.peaks/);
  const wa = await page.getByRole("link", { name: /Send on WhatsApp/ }).getAttribute("href");
  assert.match(wa, /^https:\/\/wa\.me\/966558951422\?text=/);
  assert.match(decodeURIComponent(wa), /Growth Engine/);

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
  await page.getByRole("radio", { name: /Just starting/ }).click();
  for (const n of ["Fast execution", "On-time delivery", "Live tracking"])
    await page.getByRole("checkbox", { name: n }).click();
  assert.equal(await page.locator('#planner [role=checkbox][aria-checked="true"]').count(), 3);
  assert.equal(await page.getByRole("checkbox", { name: "Shipment security" }).getAttribute("aria-disabled"), "true");
  await ctx.close();
});

await test("shared plan link opens directly on the result", async () => {
  const { page, ctx } = await open("/ar?plan=platform~people~high~peaks#planner");
  await page.getByRole("heading", { name: "شريك الطاقة الاستيعابية" }).waitFor({ timeout: 5000 });
  await ctx.close();
});

await test("contact form: validation, then graceful WhatsApp/email hand-off", async () => {
  const { page, ctx } = await open("/en#contact");
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

await test("accessibility: axe-core finds no serious/critical violations (en + ar)", async () => {
  for (const lang of ["en", "ar"]) {
    const { page, ctx } = await open(`/${lang}`, { reducedMotion: "reduce" });
    for (let y = 0; y < 16000; y += 800) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(60); }
    await page.addScriptTag({ content: AXE });
    const res = await page.evaluate(async () =>
      // eslint-disable-next-line no-undef
      (await axe.run(document, { resultTypes: ["violations"] })).violations.map((v) => ({
        id: v.id, impact: v.impact, n: v.nodes.length,
        nodes: v.nodes.slice(0, 20).map((n) => n.target.join(" ") + " :: " + (n.any?.[0]?.message || "").slice(0, 110)),
      })),
    );
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
