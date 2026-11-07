// Scratch: which scroll-linked animations Chrome actually applies.
import puppeteer from 'puppeteer-core';
import { startPreview } from '../tests/e2e/harness.mjs';
const preview = await startPreview(4341);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
await page.setViewport({ width: 1366, height: 860 });
await page.evaluateOnNewDocument(() => localStorage.setItem('aa-envelope-opened', '1'));
await page.goto(preview.url, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => !document.getElementById('opening'), { timeout: 8000 });
const result = await page.evaluate(() =>
  ['.chapter__lily', '.celebrations__spray', '.reception-garden__lily', '.hero__ground', '.invite__vine'].map((s) => {
    const el = document.querySelector(s);
    const cs = el && getComputedStyle(el);
    return { s, name: cs?.animationName, timeline: cs?.animationTimeline, range: cs?.animationRangeStart };
  }),
);
console.log(JSON.stringify(result, null, 1));
await browser.close();
await preview.stop();
