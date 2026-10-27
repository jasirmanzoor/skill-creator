/*
 * Renders the company profile (app/[lang]/company-profile) as a film, with Playwright, against a local build:
 *   npm run build && npx next start -p 3100 &
 *   node reel/profile-film.mjs preview [lang] [outdir]   two frames a second on a contact sheet, to check the timing
 *   node reel/profile-film.mjs full [lang] [outdir]      60 fps × 2 subframes blended (ffmpeg tmix) for motion blur,
 *                                                        with the soundtrack (profile-audio.js) rendered and muxed in
 * The page runs in film mode (?film): no smooth scroll and no clock of its own. Each frame the renderer scrolls the
 * page along a scripted camera path and calls window.__profileTick(time), so every frame is exactly reproducible.
 */
import { chromium } from "playwright";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [mode = "preview", lang = "en", outdir = path.join(here, "out", "profile")] = process.argv.slice(2);
const BASE = (process.env.BASE_URL || "http://localhost:3100").replace(/\/$/, "");
const FPS = 60, SUB = 2, W = 1920, H = 1080;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(`${BASE}/${lang}/company-profile?film`, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager"));
  await document.fonts.ready;
});
await page.waitForLoadState("networkidle");
await page.addScriptTag({ path: path.join(here, "profile-audio.js") });

// the end card: the lockup over the night, faded in by the camera path
await page.evaluate((ar) => {
  const card = document.createElement("div");
  card.id = "film-end";
  card.style.cssText = "position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:#05070c;opacity:0;pointer-events:none";
  card.innerHTML = `<div style="text-align:center"><img src="/brand/msg-logo-stacked-white.svg" style="height:150px;width:auto;margin:0 auto" alt="">
    <p style="margin-top:34px;font:500 20px var(--font-pf-mono),monospace;letter-spacing:${ar ? 0 : 0.2}em;text-transform:uppercase;color:rgba(255,255,255,.7)">${ar ? "الملف التعريفي · 2026" : "Company profile · 2026"}</p>
    <p style="margin-top:12px;font:500 20px var(--font-pf-mono),monospace;letter-spacing:.2em;color:#7fcbfb">www.msg-horizons.com</p></div>`;
  document.body.appendChild(card);
}, lang === "ar");

const m = await page.evaluate(() => {
  const r = (s) => { const el = document.querySelector(s); return { top: el.offsetTop, h: el.offsetHeight }; };
  return { vh: innerHeight, max: document.documentElement.scrollHeight - innerHeight, top: r("#top"), day: r("#day"), network: r("#network"), paths: r("#paths"), scale: r("#scale"), contact: r("#contact") };
});
const end = (s) => s.top + s.h - m.vh;

// the camera: a scroll position held or eased between, segment by segment
const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
const plan = [
  ["hold", 1.4, 0],
  ["move", 12.5, m.top.top + (end(m.top) - m.top.top) * 0.88],
  ["move", 1.8, m.day.top],
  ["move", 9.5, end(m.day)],
  ["hold", 0.5],
  ["move", 1.6, m.network.top],
  ["move", 9.5, end(m.network)],
  ["hold", 0.6],
  ["move", 2.0, m.paths.top - 40],
  ["move", 3.6, m.paths.top + m.paths.h - m.vh],
  ["move", 1.4, m.scale.top - 30],
  ["hold", 2.4],
  ["move", 1.6, m.contact.top],
  ["move", 2.4, m.max],
  ["hold", 1.2],
  ["fade", 2.2],
];
const segs = [];
let t = 0, y = 0;
for (const [kind, d, to] of plan) {
  const y1 = kind === "move" ? to : y;
  segs.push({ kind, t0: t, t1: t + d, y0: y, y1 });
  t += d; y = y1;
}
const LEN = t;
const at = (time) => {
  const s = segs.find((x) => time < x.t1) || segs[segs.length - 1];
  const k = Math.min(1, Math.max(0, (time - s.t0) / (s.t1 - s.t0)));
  return { y: s.y0 + (s.y1 - s.y0) * (s.kind === "move" ? ease(k) : 0), fade: s.kind === "fade" ? ease(Math.min(1, k * 1.6)) : 0 };
};
const when = (pred) => { for (let x = 0; x < LEN; x += 1 / FPS) if (pred(at(x).y)) return x; return LEN; };
const heroSpan = end(m.top) - m.top.top;
const cue = {
  len: LEN + 1.5,
  title: when((v) => v >= heroSpan * 0.16),
  hits: [m.day.top, m.network.top, m.paths.top - 40, m.scale.top - 30, m.contact.top].map((target) => when((v) => v >= target - 2)),
  counters: [when((v) => v >= m.scale.top - 30 - m.vh * 0.4), 0],
  end: segs[segs.length - 1].t0,
};
cue.counters[1] = cue.counters[0] + 1.8;
console.log(`film: ${LEN.toFixed(1)} s`, JSON.stringify({ ...cue, hits: cue.hits.map((x) => +x.toFixed(2)) }));

const frame = async (time, file) => {
  const { y: sy, fade } = at(time);
  await page.evaluate(([sy, ms, fade]) => {
    window.scrollTo({ top: sy, behavior: "instant" });
    window.__profileTick(ms);
    document.getElementById("film-end").style.opacity = String(fade);
  }, [Math.round(sy), time * 1000, fade]);
  if (file) await page.screenshot({ path: file, type: "jpeg", quality: 90 });
};

await mkdir(outdir, { recursive: true });
if (mode === "preview") {
  const dir = path.join(outdir, "preview");
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  let n = 0;
  // step the clock at film rate so the scroll-driven easing settles as it will in the film
  for (let i = 0; i < LEN * FPS; i++) {
    await frame(i / FPS, i % (FPS / 2) === 0 ? path.join(dir, `p${String(n++).padStart(3, "0")}.jpg`) : null);
  }
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(dir, "p%03d.jpg"), "-vf", "scale=384:-1,tile=10x12:padding=4:color=white", "-frames:v", "1", path.join(outdir, "preview.jpg")]);
  console.log("preview", path.join(outdir, "preview.jpg"), n, "frames", errors.slice(0, 3));
} else {
  const frames = path.join(outdir, "frames");
  await rm(frames, { recursive: true, force: true });
  await mkdir(frames, { recursive: true });
  const total = Math.round(LEN * FPS * SUB);
  const started = Date.now();
  for (let i = 0; i < total; i++) {
    await frame(i / (FPS * SUB), path.join(frames, `f${String(i).padStart(5, "0")}.jpg`));
    if (i % 600 === 0) console.log(`frame ${i}/${total} · ${((Date.now() - started) / 1000).toFixed(0)} s`);
  }
  const b64 = await page.evaluate((c) => window.renderProfileAudio(c), cue);
  await writeFile(path.join(outdir, "profile.wav"), Buffer.from(b64, "base64"));
  const film = path.join(outdir, `MSG-Horizons-Company-Profile-${lang.toUpperCase()}.mp4`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS * SUB), "-i", path.join(frames, "f%05d.jpg"), "-i", path.join(outdir, "profile.wav"),
    "-vf", `tmix=frames=${SUB}:weights='1 1',select='not(mod(n\\,${SUB}))',setpts=N/${FPS}/TB`, "-r", String(FPS),
    "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", film]);
  console.log("wrote", film, errors.slice(0, 3));
}
await browser.close();
