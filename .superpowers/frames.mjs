// Scratch (git-ignored): frames of the opening. node .superpowers/frames.mjs <outdir> <w> <h>
import puppeteer from 'puppeteer-core';
import { startPreview } from '../tests/e2e/harness.mjs';
const [out, w, h] = process.argv.slice(2);
const preview = await startPreview(4334);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 });
await page.goto(preview.url, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 2600));
await page.screenshot({ path: `${out}/f0000.png` });
const t0 = Date.now();
await page.click('[data-opening-trigger]');
for (const t of (process.env.TIMES || "500,900,1400,2000,2600,2900,3200,4200,5500").split(",").map(Number)) {
  await new Promise((r) => setTimeout(r, Math.max(0, t - (Date.now() - t0))));
  await page.screenshot({ path: `${out}/f${String(t).padStart(4, '0')}.png` });
}
await browser.close();
await preview.stop();
