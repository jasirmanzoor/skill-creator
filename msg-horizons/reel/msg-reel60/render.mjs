/*
 * Renders the MSG Horizons 60 s film (index.html) with Playwright.
 *   node reel/render.mjs beats <outdir>   one frame per beat (120) and a contact sheet, to check before the full render
 *   node reel/render.mjs full <outdir>    60 fps x 3 subframes, blended with ffmpeg tmix for motion blur, plus the
 *                                         soundtrack (audio.js, OfflineAudioContext) rendered to WAV and muxed in
 * Writes reel.mp4 (1920x1080, with sound) and, for the website, reel-1080.mp4 / reel-720.mp4 (silent) and a poster.
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [mode = "beats", outdir = path.join(here, "out")] = process.argv.slice(2);
const FPS = 60, SUB = 3, LEN = 60, WORKERS = Number(process.env.WORKERS || 3);

const types = { ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png" };
// the site's own photos are served from its public folder
const pub = path.join(here, "..", "..", "public");
const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const file = /^\/(media|leadership)\//.test(p) ? path.join(pub, p) : path.join(here, p);
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const errors = [];
const open = async () => {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await p.goto(`http://localhost:${port}/index.html`);
  await p.evaluate(() => window.ready);
  return p;
};
const page = await open();
await mkdir(outdir, { recursive: true });

const shotOn = async (pg, t, file) => {
  await pg.evaluate((t) => window.seekDecoded(t), t);
  await pg.screenshot({ path: file, type: "jpeg", quality: 92 });
};
const shot = (t, file) => shotOn(page, t, file);

if (mode === "audio") {
  // just the soundtrack, muxed onto an existing render
  const b64 = await page.evaluate(() => window.renderAudio());
  await writeFile(path.join(outdir, "reel.wav"), Buffer.from(b64, "base64"));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(outdir, "reel.mp4"), "-i", path.join(outdir, "reel.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", path.join(outdir, "reel-remux.mp4")]);
} else if (mode === "beats") {
  const only = process.env.ONLY ? process.env.ONLY.split(",").map(Number) : null;
  for (let b = 0; b < 120; b++) if (!only || only.includes(b)) await shot(b * 0.5 + 0.22, path.join(outdir, `beat${String(b + 1).padStart(3, "0")}.jpg`));
  for (const t of (process.env.AT || "").split(",").filter(Boolean)) await shot(Number(t), path.join(outdir, `at-${t}.jpg`));
  await shot(0, path.join(outdir, "first.jpg"));
  await shot(LEN - 1 / FPS, path.join(outdir, "last.jpg"));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(outdir, "beat%03d.jpg"), "-vf", "scale=384:-1,tile=10x12:padding=4:color=white", "-frames:v", "1", path.join(outdir, "beats.jpg")]);
} else {
  const frames = path.join(outdir, "frames");
  await rm(frames, { recursive: true, force: true });
  await mkdir(frames, { recursive: true });
  const total = FPS * SUB * LEN;
  // several pages render interleaved frames at once
  const pages = [page, ...(await Promise.all([...Array(WORKERS - 1)].map(open)))];
  let done = 0;
  await Promise.all(pages.map(async (pg, w) => {
    for (let n = w; n < total; n += WORKERS) {
      await shotOn(pg, n / (FPS * SUB), path.join(frames, `f${String(n).padStart(5, "0")}.jpg`));
      if (++done % 600 === 0) console.log(`frame ${done}/${total}`);
    }
  }));
  const b64 = await page.evaluate(() => window.renderAudio());
  await writeFile(path.join(outdir, "reel.wav"), Buffer.from(b64, "base64"));
  // 180 subframes a second, each output frame the average of its three: real motion blur
  const blend = `tmix=frames=${SUB}:weights='1 1 1',select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB)`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS * SUB), "-i", path.join(frames, "f%05d.jpg"), "-i", path.join(outdir, "reel.wav"),
    "-vf", blend, "-r", String(FPS), "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-profile:v", "high",
    "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", path.join(outdir, "reel.mp4")]);
  // the website copies: silent, smaller, and a poster that is the first frame (also the last: the reel loops)
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(outdir, "reel.mp4"), "-an", "-vf", "scale=1920:1080", "-r", "30", "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(outdir, "reel-1080.mp4")]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(outdir, "reel.mp4"), "-an", "-vf", "scale=1280:720", "-r", "30", "-c:v", "libx264", "-preset", "slow", "-crf", "25", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(outdir, "reel-720.mp4")]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(outdir, "reel.mp4"), "-frames:v", "1", "-q:v", "3", path.join(outdir, "reel-poster.jpg")]);
}
if (errors.length) console.log("page errors:", errors);
await browser.close();
server.close();
