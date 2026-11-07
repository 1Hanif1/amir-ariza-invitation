// Scratch: every .doorway at rest and hovered, 2x. node .superpowers/buttons.mjs <outdir>
import puppeteer from 'puppeteer-core';
import { startPreview } from '../tests/e2e/harness.mjs';
const [out] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const preview = await startPreview(4339);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
await page.setViewport({ width: 1366, height: 860, deviceScaleFactor: 2 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.evaluateOnNewDocument(() => localStorage.setItem('aa-envelope-opened', '1'));
await page.goto(preview.url, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => !document.getElementById('opening'), { timeout: 8000 });
await sleep(2500);
const buttons = await page.$$('.ruled');
for (const [i, b] of buttons.entries()) {
  await b.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.mouse.move(5, 5);
  await sleep(2500);
  const box = await b.boundingBox();
  const scrollY = await page.evaluate(() => window.scrollY);
  const clip = { x: box.x - 24, y: box.y + scrollY - 20, width: box.width + 48, height: box.height + 40 };
  await page.screenshot({ path: `${out}/b${i}-rest.png`, clip });
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(900);
  await page.screenshot({ path: `${out}/b${i}-hover.png`, clip });
}
console.log(buttons.length);
await browser.close();
await preview.stop();
