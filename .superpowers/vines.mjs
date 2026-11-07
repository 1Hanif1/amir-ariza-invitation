// Scratch: the invitation vines at several scroll positions. node .superpowers/vines.mjs <outdir> <w> <h>
import puppeteer from 'puppeteer-core';
import { startPreview } from '../tests/e2e/harness.mjs';
const [out, w, h] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const preview = await startPreview(4342);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h) });
await page.evaluateOnNewDocument(() => localStorage.setItem('aa-envelope-opened', '1'));
await page.goto(preview.url, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => !document.getElementById('opening'), { timeout: 8000 });
await sleep(1500);
const { top, height } = await page.evaluate(() => {
  const r = document.getElementById('invitation').getBoundingClientRect();
  return { top: r.top + scrollY, height: r.height };
});
for (const [i, f] of [-0.35, 0, 0.3, 0.6].entries()) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + f * height));
  await sleep(1500);
  const info = await page.evaluate(() =>
    [...document.querySelectorAll('.invite__vine')].map((v) => {
      const r = v.getBoundingClientRect();
      const cs = getComputedStyle(v);
      return { d: cs.display, grow: cs.getPropertyValue('--vine-grow'), rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] };
    }),
  );
  const arch = await page.evaluate(() => { const r = document.querySelector('.invite__page').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; });
  console.log(i, JSON.stringify({ arch, info }));
  await page.screenshot({ path: `${out}/vines-${w}-${i}.png` });
}
await browser.close();
await preview.stop();
