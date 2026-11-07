// Scratch: the settled hero. node .superpowers/hero.mjs <out.png> <w> <h>
import puppeteer from 'puppeteer-core';
import { startPreview } from '../tests/e2e/harness.mjs';
const [out, w, h] = process.argv.slice(2);
const preview = await startPreview(4337);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h) });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.evaluateOnNewDocument(() => localStorage.setItem('aa-envelope-opened', '1'));
await page.goto(preview.url, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => !document.getElementById('opening'), { timeout: 8000 });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 500));
const m = await page.evaluate(() => {
  const page = document.querySelector('.hero__page').getBoundingClientRect();
  return [...document.querySelectorAll('.hero__name')].map((n) => { const r = n.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(n); const t = range.getBoundingClientRect(); return { left: Math.round(t.left - page.left), right: Math.round(page.right - t.right), size: getComputedStyle(n).fontSize }; });
});
console.log(w, JSON.stringify(m));
await page.screenshot({ path: out });
await browser.close();
await preview.stop();
