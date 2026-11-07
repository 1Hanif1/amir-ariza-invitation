// Scratch: screenshot around a selector after scrolling to it. node .superpowers/scrollshot.mjs <out> <w> <h> <selector> <offset>
import puppeteer from 'puppeteer-core';
import { startPreview } from '../tests/e2e/harness.mjs';
const [out, w, h, sel, off] = process.argv.slice(2);
const preview = await startPreview(4338);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h) });
await page.evaluateOnNewDocument(() => localStorage.setItem('aa-envelope-opened', '1'));
await page.goto(preview.url, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => !document.getElementById('opening'), { timeout: 8000 });
await page.evaluate((s, o) => window.scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY - Number(o)), sel, off);
await new Promise((r) => setTimeout(r, 3500));
await page.screenshot({ path: out });
await browser.close();
await preview.stop();
