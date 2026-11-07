// Scratch: frames of the scroll animations. node .superpowers/anim.mjs <outdir> <w> <h>
import puppeteer from 'puppeteer-core';
import { startPreview } from '../tests/e2e/harness.mjs';
const [out, w, h] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const preview = await startPreview(4336);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.setViewport({ width: Number(w), height: Number(h) });
await page.evaluateOnNewDocument(() => localStorage.setItem('aa-envelope-opened', '1'));
await page.goto(preview.url, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => !document.documentElement.classList.contains('opening-running') && !document.documentElement.classList.contains('opening-pending'), { timeout: 8000, polling: 20 });
let n = 0;
const shot = async (label) => page.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-${label}.png` });
for (const t of [300, 900, 1600, 3000]) { await sleep(t - (n ? [300, 900, 1600, 3000][n - 1] : 0)); await shot(`hero${t}`); }
const go = async (sel, label, times) => {
  await page.evaluate((s) => window.scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY - 60), sel);
  let last = 0;
  for (const t of times) { await sleep(t - last); last = t; await shot(`${label}${t}`); }
};
await go('#invitation .invite__request', 'invite', [100, 700, 2500]);
await go('#celebrations', 'celeb', [150, 800, 2500]);
await go('#nikah', 'nikah', [150, 900, 3000]);
await go('#blessing', 'blessing', [150, 900, 3000]);
console.log(JSON.stringify({ errors, cls: await page.evaluate(() => document.documentElement.className) }));
await browser.close();
await preview.stop();
