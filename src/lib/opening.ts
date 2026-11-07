/**
 * Decisions for the envelope opening. Pure, with no imports, so it runs in the
 * browser and in tests alike.
 */

export const OPENED_KEY = 'aa-envelope-opened';

export type OpeningPlan = { mode: 'tap' | 'auto'; motion: 'full' | 'reduced' };

/** Target durations in milliseconds. `autoDelay` is the pause before a return visit opens by itself. */
export const DURATION_MS = { tap: 4300, auto: 2600, reduced: 700, autoDelay: 400 } as const;

/** Storage may be missing or may throw (private browsing, blocked site data): both mean a first visit. */
export function hasOpenedBefore(storage: { getItem(key: string): string | null } | null): boolean {
  try {
    return storage?.getItem(OPENED_KEY) === '1';
  } catch {
    return false;
  }
}

export function rememberOpened(storage: { setItem(key: string, value: string): void } | null): void {
  try {
    storage?.setItem(OPENED_KEY, '1');
  } catch {
    // Nothing to do: the next visit is simply treated as a first visit.
  }
}

export function planOpening(input: { openedBefore: boolean; reducedMotion: boolean }): OpeningPlan {
  return {
    mode: input.openedBefore ? 'auto' : 'tap',
    motion: input.reducedMotion ? 'reduced' : 'full',
  };
}
