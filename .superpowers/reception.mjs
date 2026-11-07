// Scratch: the Reception at several scroll positions. node .superpowers/reception.mjs <outdir> <w> <h>
import puppeteer from 'puppeteer-core';
import { startPreview } from '../tests/e2e/harness.mjs';
const [out, w, h] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const preview = await startPreview(4340);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h) });
await page.evaluateOnNewDocument(() => localStorage.setItem('aa-envelope-opened', '1'));
await page.goto(preview.url, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => !document.getElementById('opening'), { timeout: 8000 });
await sleep(2500);
const { top, height } = await page.evaluate(() => {
  const r = document.querySelector('.reception').getBoundingClientRect();
  return { top: r.top + scrollY, height: r.height };
});
const stops = [-0.5, 0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(top + f * (height - Number(h))));
for (const [i, y] of stops.entries()) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await sleep(1800);
  await page.screenshot({ path: `${out}/r${i}.png` });
}
console.log(JSON.stringify({ top, height, stops }));
await browser.close();
await preview.stop();
