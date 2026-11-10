// Renders film/film.html to frames, then to MP4.
//   node serve.mjs &                      (the site must be running on :4318)
//   node film/record.cjs [seconds]        (default: the film's own length)
// The browser's clock is frozen and stepped 1/30 s at a time, and each step is photographed, so every animation
// (including the 3D room) lands on its frame however slow the machine is. Needs Playwright and ffmpeg.
const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const FPS = 30;
const OUT = process.env.FILM_FRAMES || path.join(require("node:os").tmpdir(), "liemex-film");
const DEST = path.join(__dirname, "..", "media");

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(DEST, { recursive: true });
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--hide-scrollbars",
    // draw the page on the CPU: on a machine with no graphics card this is some thirty times faster per frame
    "--disable-gpu-rasterization", "--disable-gpu-compositing"] });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("page error:", e.message));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setVirtualTimePolicy", { policy: "pause" });
  const step = (ms) => new Promise((res) => { cdp.once("Emulation.virtualTimeBudgetExpired", res); cdp.send("Emulation.setVirtualTimePolicy", { policy: "advance", budget: ms }); });
  const nav = page.goto("http://127.0.0.1:4318/film/film?rec=1", { waitUntil: "commit" });
  await step(300);
  await nav;
  for (let i = 0; i < 100 && !(await page.evaluate(() => window.__ready)); i++) await step(100);
  const seconds = Number(process.argv[2]) || 95;   // an upper limit: the film says when it has finished
  const total = Math.round(seconds * FPS);
  await page.evaluate(() => { window.__play(); });
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    await step(1000 / FPS);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 94 });
    fs.writeFileSync(path.join(OUT, `f${String(i).padStart(5, "0")}.jpg`), Buffer.from(data, "base64"));
    if (i % 150 === 0) console.log(`frame ${i} / ${total}  (${Math.round((Date.now() - t0) / 1000)} s)`);
    if (i % 15 === 0 && (await page.evaluate(() => window.__done))) { console.log("film finished at frame", i); break; }
  }
  fs.writeFileSync(path.join(OUT, "marks.json"), JSON.stringify(await page.evaluate(() => window.__marks)));
  await browser.close();
  const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(OUT, "f%05d.jpg"), ...args]);
  ff(["-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(DEST, "liemex-film-1080.mp4")]);
  ff(["-vf", "scale=1280:-2", "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(DEST, "liemex-film-720.mp4")]);
  console.log("done in", Math.round((Date.now() - t0) / 1000), "s");
})();
