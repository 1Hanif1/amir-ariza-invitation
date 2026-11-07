import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OPENED_KEY, hasOpenedBefore, rememberOpened, planOpening } from '../../src/lib/opening.ts';

test('no storage means a first visit', () => {
  assert.equal(hasOpenedBefore(null), false);
});

test('a stored flag means a return visit', () => {
  assert.equal(hasOpenedBefore({ getItem: (k) => (k === 'aa-envelope-opened' ? '1' : null) }), true);
});

test('an empty store means a first visit', () => {
  assert.equal(hasOpenedBefore({ getItem: () => null }), false);
});

test('storage that throws is treated as a first visit and never throws', () => {
  const denied = () => {
    throw new Error('denied');
  };
  assert.equal(hasOpenedBefore({ getItem: denied }), false);
  assert.doesNotThrow(() => rememberOpened({ setItem: denied }));
  assert.doesNotThrow(() => rememberOpened(null));
});

test('remembering stores the flag under the opening key', () => {
  const calls = [];
  rememberOpened({ setItem: (k, v) => calls.push([k, v]) });
  assert.equal(OPENED_KEY, 'aa-envelope-opened');
  assert.deepEqual(calls, [['aa-envelope-opened', '1']]);
});

test('planOpening covers every visit and motion combination', () => {
  assert.deepEqual(planOpening({ openedBefore: false, reducedMotion: false }), { mode: 'tap', motion: 'full' });
  assert.deepEqual(planOpening({ openedBefore: true, reducedMotion: false }), { mode: 'auto', motion: 'full' });
  assert.deepEqual(planOpening({ openedBefore: false, reducedMotion: true }), { mode: 'tap', motion: 'reduced' });
  assert.deepEqual(planOpening({ openedBefore: true, reducedMotion: true }), { mode: 'auto', motion: 'reduced' });
});
