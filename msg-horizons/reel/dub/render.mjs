/*
 * Renders the Dub film (index.html) with Playwright.
 *   node reel/render.mjs beats <outdir>   one frame per beat (30) and a contact sheet, to check before the full render
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
const FPS = 60, SUB = 3, LEN = 15;

const types = { ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  try {
    const file = path.join(here, decodeURIComponent(new URL(req.url, "http://x").pathname));
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(`http://localhost:${port}/index.html`);
await page.evaluate(() => window.ready);
await mkdir(outdir, { recursive: true });

const shot = async (t, file) => {
  await page.evaluate((t) => window.seek(t), t);
  await page.screenshot({ path: file, type: "jpeg", quality: 92 });
};

if (mode === "audio") {
  // just the soundtrack, muxed onto an existing render
  const b64 = await page.evaluate(() => window.renderAudio());
  await writeFile(path.join(outdir, "reel.wav"), Buffer.from(b64, "base64"));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(outdir, "reel.mp4"), "-i", path.join(outdir, "reel.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", path.join(outdir, "reel-remux.mp4")]);
} else if (mode === "beats") {
  for (let b = 0; b < 30; b++) await shot(b * 0.5 + 0.22, path.join(outdir, `beat${String(b + 1).padStart(2, "0")}.jpg`));
  await shot(0, path.join(outdir, "first.jpg"));
  await shot(LEN - 1 / FPS, path.join(outdir, "last.jpg"));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(outdir, "beat%02d.jpg"), "-vf", "scale=480:-1,tile=6x5:padding=6:color=white", "-frames:v", "1", path.join(outdir, "beats.jpg")]);
} else {
  const frames = path.join(outdir, "frames");
  await rm(frames, { recursive: true, force: true });
  await mkdir(frames, { recursive: true });
  const total = FPS * SUB * LEN;
  for (let n = 0; n < total; n++) {
    await shot(n / (FPS * SUB), path.join(frames, `f${String(n).padStart(5, "0")}.jpg`));
    if (n % 300 === 0) console.log(`frame ${n}/${total}`);
  }
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
