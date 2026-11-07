/**
 * Runs the envelope opening. The look of each step lives in Envelope.astro; this script only
 * decides when each step starts, then hands the page back to the guest.
 *
 *   0      the seal lifts away and the flap swings open      (.is-open)
 *   600    petals and gold leaf burst out of the open mouth
 *   1000   the card rises while the envelope slides down     (.is-drawing)
 *   2600   the card fills the screen; the page is released and
 *          the card fades away over it                       (.is-revealing)
 *   3300   the envelope is removed
 *
 * A return visit runs the same sequence faster, by itself. Reduced motion is a plain fade.
 */
import { DURATION_MS, hasOpenedBefore, planOpening, rememberOpened, type OpeningPlan } from '../lib/opening';
import { burstPieces, preloadPieces, type PieceImage } from './petals';

const PETALS_AT = 600;
const PETAL_RELEASE = 650;
const DRAW_AT = 1000;
const DRAW_DURATION = 1600;
/** The fade from the navy card to the page fills the rest of the tapped opening. */
const REVEAL_AT = DRAW_AT + DRAW_DURATION;

const startCallbacks: ((plan: OpeningPlan) => void)[] = [];

/** Runs `callback` at the very start of the opening, inside the guest's tap where there is one. */
export function onOpeningStart(callback: (plan: OpeningPlan) => void): void {
  startCallbacks.push(callback);
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const root = document.documentElement;
const opening = document.getElementById('opening');
const trigger = opening?.querySelector<HTMLButtonElement>('[data-opening-trigger]');

if (opening && trigger && root.classList.contains('opening-pending')) {
  (window as Window & { __openingReady?: boolean }).__openingReady = true;

  const plan = planOpening({
    openedBefore: hasOpenedBefore(storage()),
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  });

  const images: PieceImage[] = JSON.parse(opening.dataset.pieces ?? '[]');
  const sprites = plan.motion === 'full' ? preloadPieces(images) : null;

  // Everything behind the envelope is out of reach until it opens.
  const behind = [...document.body.children].filter(
    (element): element is HTMLElement => element !== opening && !(element instanceof HTMLScriptElement),
  );
  behind.forEach((element) => (element.inert = true));

  // A link to a section (#celebrations) is honoured once the envelope has opened. Until then the page stays at the top.
  const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  if (target) window.scrollTo(0, 0);

  let started = false;

  /** Gives the page back: scrolling, the hero's entrance, the navigation, focus. The envelope may still be fading. */
  const release = () => {
    rememberOpened(storage());
    behind.forEach((element) => (element.inert = false));
    root.classList.remove('opening-pending', 'opening-running');
    if (target) target.scrollIntoView({ block: 'start' });
    const heading = target ? (target.querySelector<HTMLElement>('h1, h2, h3') ?? target) : document.getElementById('hero-names');
    if (heading) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  };

  const finish = () => {
    opening.remove();
    document.dispatchEvent(new CustomEvent('opening:done'));
  };

  const run = () => {
    if (started) return;
    started = true;
    startCallbacks.forEach((callback) => callback(plan));

    opening.dataset.openingMode = plan.mode;
    opening.dataset.openingMotion = plan.motion;
    root.classList.add('opening-running');
    opening.classList.add('is-open');

    if (plan.motion === 'reduced') {
      // The stylesheet fades the whole envelope out as soon as it is open.
      window.setTimeout(() => {
        release();
        finish();
      }, DURATION_MS.reduced);
      return;
    }

    const total = plan.mode === 'tap' ? DURATION_MS.tap : DURATION_MS.auto;
    const k = total / DURATION_MS.tap;
    const at = (ms: number, step: () => void) => window.setTimeout(step, ms * k);

    opening.style.setProperty('--k', String(k));
    opening.style.setProperty('--draw-duration', `${DRAW_DURATION * k}ms`);
    opening.style.setProperty('--reveal-duration', `${(DURATION_MS.tap - REVEAL_AT) * k}ms`);

    const portrait = window.innerHeight >= window.innerWidth;
    at(PETALS_AT, async () => {
      if (!sprites) return;
      burstPieces(await sprites, {
        count: portrait ? 55 : 75,
        releaseMs: PETAL_RELEASE * k,
        mouth: { tipX: 0.5, tipY: portrait ? 0.5 : 0.56 },
      });
    });
    at(DRAW_AT, () => opening.classList.add('is-drawing'));
    at(REVEAL_AT, () => {
      opening.classList.add('is-revealing');
      release();
    });
    at(DURATION_MS.tap, finish);
  };

  // A tap anywhere on the envelope opens it; the seal button's click bubbles here too, which covers keyboards.
  opening.addEventListener('click', run);

  // Return visits open by themselves, a little faster and without waiting for a tap.
  if (plan.mode === 'auto') window.setTimeout(run, DURATION_MS.autoDelay);
}
