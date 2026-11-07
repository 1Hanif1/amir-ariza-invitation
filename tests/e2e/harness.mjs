// Drives the built site in the installed Chrome. Run `npm run build` first.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import puppeteer from 'puppeteer-core';

export const CHROME_PATH = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
};

/** Serves dist/ as a static site, the way the host will. */
export async function startPreview(port = 4329) {
  const root = join(process.cwd(), 'dist');
  if (!existsSync(join(root, 'index.html'))) throw new Error('dist/ is missing: run `npm run build` first');
  const server = createServer((request, response) => {
    const path = decodeURIComponent(new URL(request.url, 'http://x').pathname);
    let file = normalize(join(root, path));
    if (!file.startsWith(root)) return response.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) return response.writeHead(404).end();
    response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    response.end(readFileSync(file));
  });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${port}/`,
    stop: () => new Promise((resolve) => server.close(resolve)),
  };
}

export function launchBrowser() {
  return puppeteer.launch({ executablePath: CHROME_PATH });
}

/**
 * Opens `url` in a fresh browser context, so storage never leaks between tests.
 * `storage` seeds localStorage; 'blocked' makes every localStorage access throw.
 */
export async function openPage(browser, url, options = {}) {
  const { viewport = { width: 390, height: 844 }, js = true, reducedMotion = false, storage, blockImages = false } = options;
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (error) => page.errors.push(error));
  await page.setViewport(viewport);
  if (!js) await page.setJavaScriptEnabled(false);
  if (reducedMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  if (storage === 'blocked') {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('The operation is insecure.', 'SecurityError');
        },
      });
    });
  } else if (storage) {
    await page.evaluateOnNewDocument((items) => {
      for (const [key, value] of Object.entries(items)) localStorage.setItem(key, value);
    }, storage);
  }
  // Counts completed openings, so a test can tell one from two.
  await page.evaluateOnNewDocument(() => {
    window.__openings = 0;
    document.addEventListener('opening:done', () => window.__openings++);
  });
  if (blockImages) {
    await page.setRequestInterception(true);
    page.on('request', (request) => (request.resourceType() === 'image' ? request.abort() : request.continue()));
  }
  await page.goto(url, { waitUntil: 'load' });
  page.closeContext = () => context.close();
  return page;
}

/** Resolves when the opening has finished and the page is handed back to the guest. */
export function waitForOpened(page, timeout) {
  return page.waitForFunction(
    () =>
      !document.getElementById('opening') &&
      !document.documentElement.classList.contains('opening-pending') &&
      !document.documentElement.classList.contains('opening-running'),
    { timeout, polling: 50 },
  );
}
