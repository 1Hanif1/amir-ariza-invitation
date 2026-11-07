import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { DURATION_MS } from '../../src/lib/opening.ts';
import { launchBrowser, openPage, startPreview, waitForOpened } from './harness.mjs';

const SLACK = 1500;
let preview;
let browser;

before(async () => {
  preview = await startPreview(4329);
  browser = await launchBrowser();
});

after(async () => {
  await browser?.close();
  await preview?.stop();
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function assertHandedBack(page, { storage = true } = {}) {
  const state = await page.evaluate(() => ({
    focus: document.activeElement?.id,
    mainInert: document.querySelector('main').inert,
    stored: (() => {
      try {
        return localStorage.getItem('aa-envelope-opened');
      } catch {
        return 'blocked';
      }
    })(),
  }));
  assert.equal(state.focus, 'hero-names');
  assert.equal(state.mainInert, false);
  if (storage) assert.equal(state.stored, '1');
}

test('first visit waits for a tap', async () => {
  const page = await openPage(browser, preview.url);
  await sleep(3000);
  const state = await page.evaluate(() => {
    window.scrollTo(0, 500);
    const opening = document.getElementById('opening');
    return {
      present: !!opening,
      visible: !!opening && getComputedStyle(opening).display !== 'none',
      pending: document.documentElement.classList.contains('opening-pending'),
      mainInert: document.querySelector('main').inert,
      scrollTop: document.scrollingElement.scrollTop,
    };
  });
  assert.deepEqual(state, { present: true, visible: true, pending: true, mainInert: true, scrollTop: 0 });
  assert.deepEqual(page.errors, []);
  await page.closeContext();
});

test('hero holds its entrance until the letter arrives', async () => {
  const page = await openPage(browser, preview.url);
  await sleep(2000);
  const waiting = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__name')).opacity);
  assert.equal(waiting, '0');
  await page.click('[data-opening-trigger]');
  await waitForOpened(page, DURATION_MS.tap + SLACK);
  await sleep(2500);
  const settled = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__name')).opacity);
  assert.equal(settled, '1');
  await page.closeContext();
});

test('tap opens into the hero', async () => {
  const page = await openPage(browser, preview.url);
  await page.click('[data-opening-trigger]');
  await waitForOpened(page, DURATION_MS.tap + SLACK);
  await assertHandedBack(page);
  assert.deepEqual(page.errors, []);
  await page.closeContext();
});

test('keyboard opens it', async () => {
  const page = await openPage(browser, preview.url);
  await page.focus('[data-opening-trigger]');
  await page.keyboard.press('Enter');
  await waitForOpened(page, DURATION_MS.tap + SLACK);
  await assertHandedBack(page);
  await page.closeContext();
});

test('double tap runs once', async () => {
  const page = await openPage(browser, preview.url);
  const box = await (await page.$('[data-opening-trigger]')).boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.click(x, y);
  await sleep(150);
  await page.mouse.click(x, y);
  await waitForOpened(page, DURATION_MS.tap + SLACK);
  await sleep(600);
  assert.equal(await page.evaluate(() => window.__openings), 1);
  assert.deepEqual(page.errors, []);
  await page.closeContext();
});

test('storage blocked still opens', async () => {
  const page = await openPage(browser, preview.url, { storage: 'blocked' });
  await page.click('[data-opening-trigger]');
  await waitForOpened(page, DURATION_MS.tap + SLACK);
  await assertHandedBack(page, { storage: false });
  assert.deepEqual(page.errors, []);
  await page.closeContext();
});

test('petals burst out on a tap', async () => {
  const page = await openPage(browser, preview.url);
  await page.click('[data-opening-trigger]');
  await sleep(1200);
  assert.equal(await page.evaluate(() => document.querySelectorAll('canvas').length), 1);
  await page.closeContext();
});

test('envelope paints without images', async () => {
  const page = await openPage(browser, preview.url, { blockImages: true });
  const colours = await page.evaluate(() => ({
    paper: getComputedStyle(document.querySelector('#opening .inside')).backgroundColor,
    wax: getComputedStyle(document.querySelector('#opening .wax')).backgroundColor,
  }));
  assert.equal(colours.paper, 'rgb(244, 234, 216)');
  assert.equal(colours.wax, 'rgb(11, 16, 48)');
  await page.closeContext();
});

test('laptop: the envelope fills the screen with the seal centred', async () => {
  const page = await openPage(browser, preview.url, { viewport: { width: 1366, height: 900 } });
  const envelope = await (await page.$('#opening')).boundingBox();
  assert.deepEqual([envelope.width, envelope.height], [1366, 900]);
  const seal = await (await page.$('[data-opening-trigger]')).boundingBox();
  assert.ok(Math.abs(seal.x + seal.width / 2 - 683) <= 4, 'seal is not centred');
  await page.click('[data-opening-trigger]');
  await waitForOpened(page, DURATION_MS.tap + SLACK);
  const heroWidth = await page.evaluate(() => document.getElementById('home').getBoundingClientRect().width);
  assert.equal(Math.round(heroWidth), 1366);
  await page.closeContext();
});

test('no JavaScript shows the page', async () => {
  const page = await openPage(browser, preview.url, { js: false });
  const state = await page.evaluate(() => ({
    opening: getComputedStyle(document.getElementById('opening')).display,
    heroVisible: document.getElementById('hero-names').getBoundingClientRect().height > 0,
  }));
  assert.deepEqual(state, { opening: 'none', heroVisible: true });
  await page.closeContext();
});

test('return visit opens by itself', async () => {
  const page = await openPage(browser, preview.url, { storage: { 'aa-envelope-opened': '1' } });
  await waitForOpened(page, DURATION_MS.autoDelay + DURATION_MS.auto + SLACK);
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'hero-names');
  assert.deepEqual(page.errors, []);
  await page.closeContext();
});

test('reduced motion fades', async () => {
  const page = await openPage(browser, preview.url, { reducedMotion: true });
  await page.click('[data-opening-trigger]');
  await sleep(300);
  const mid = await page.evaluate(() => ({
    flap: getComputedStyle(document.querySelector('#opening .flap')).transform,
    petals: document.querySelectorAll('canvas').length,
  }));
  assert.ok(['none', 'matrix(1, 0, 0, 1, 0, 0)', 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'].includes(mid.flap), `flap moved: ${mid.flap}`);
  assert.equal(mid.petals, 0);
  await waitForOpened(page, DURATION_MS.reduced + SLACK);
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'hero-names');
  await page.closeContext();
});

test('reduced motion return visit', async () => {
  const page = await openPage(browser, preview.url, { reducedMotion: true, storage: { 'aa-envelope-opened': '1' } });
  await waitForOpened(page, DURATION_MS.autoDelay + DURATION_MS.reduced + SLACK);
  await page.closeContext();
});

test('hash link lands on its section', async () => {
  const page = await openPage(browser, `${preview.url}#celebrations`);
  await page.click('[data-opening-trigger]');
  await waitForOpened(page, DURATION_MS.tap + SLACK);
  await sleep(400);
  const state = await page.evaluate(() => ({
    top: document.getElementById('celebrations').getBoundingClientRect().top,
    nav: document.querySelector('.nav').getBoundingClientRect().height,
    focus: document.activeElement?.id,
  }));
  assert.ok(Math.abs(state.top - state.nav) <= 80, `section top at ${state.top}px, nav ${state.nav}px`);
  assert.equal(state.focus, 'celebrations-title');
  await page.closeContext();
});
