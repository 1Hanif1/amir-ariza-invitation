import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { artSlots, type ArtName } from '../data/assets';

const EXTENSIONS = ['avif', 'webp', 'png', 'svg'];

/** Resolves a slot at build time, so a missing file can never produce a broken image. */
export function resolveArt(name: ArtName) {
  const slot = artSlots[name];
  for (const extension of EXTENSIONS) {
    const path = `assets/${slot.folder}/${name}.${extension}`;
    if (existsSync(join(process.cwd(), 'public', path))) {
      return { ...slot, src: `/${path}`, custom: true };
    }
  }
  return { ...slot, src: `/art/${slot.fallback}`, custom: false };
}
