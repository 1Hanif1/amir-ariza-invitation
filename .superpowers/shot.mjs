// Scratch tool (git-ignored): full-page screenshots of the preview server.
// node .superpowers/shot.mjs <url> <out.png> <width> <height> [reduce]
import puppeteer from 'puppeteer-core';
import { startPreview } from '../tests/e2e/harness.mjs';

const [, out, w, h, reduce] = process.argv.slice(2);
const preview = await startPreview(4333);
const url = preview.url;
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h) });
if (reduce) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.evaluateOnNewDocument(() => localStorage.setItem('aa-envelope-opened', '1'));
await page.goto(url, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => !document.getElementById('opening'), { timeout: 8000 });
await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-revealed')));
await new Promise((r) => setTimeout(r, 2500));
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: out, fullPage: true });
await browser.close();
await preview.stop();
