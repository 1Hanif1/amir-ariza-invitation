/**
 * Every illustration on the site is a named slot. See ASSETS.md for sizes and usage.
 *
 * To replace one, save a file at public/assets/<folder>/<name>.(avif|webp|png|svg)
 * and rebuild. No component needs editing. Until then, the slot shows its built-in
 * artwork from public/art/.
 */

export interface ArtSlot {
  folder: 'floral' | 'ornaments' | 'patterns' | 'arches' | 'calligraphy' | 'monogram';
  /** Built-in artwork in public/art/, used until a custom file exists. */
  fallback: string;
  width: number;
  height: number;
  /** Empty for purely decorative artwork, which screen readers should skip. */
  alt: string;
}

export const artSlots = {
  // Hero
  'hero-lily-left': { folder: 'floral', fallback: 'lily-rose.svg', width: 735, height: 490, alt: '' },
  'hero-lily-right': { folder: 'floral', fallback: 'lily-saffron-flipped.svg', width: 735, height: 490, alt: '' },

  // Celebrations: one lily per chapter
  'lily-haldi': { folder: 'floral', fallback: 'lily-saffron.svg', width: 735, height: 490, alt: '' },
  'lily-nikah': { folder: 'floral', fallback: 'lily-iris-flipped.svg', width: 735, height: 490, alt: '' },
  'lily-reception-left': { folder: 'floral', fallback: 'lily-rose.svg', width: 735, height: 490, alt: '' },
  'lily-reception-right': { folder: 'floral', fallback: 'lily-rose-flipped.svg', width: 735, height: 490, alt: '' },
  'marigold-spray': { folder: 'floral', fallback: 'marigold-spray.svg', width: 420, height: 300, alt: '' },
  'blossom': { folder: 'floral', fallback: 'blossom.svg', width: 64, height: 64, alt: '' },

  // Margins and closing
  'vine-left': { folder: 'floral', fallback: 'vine-left.svg', width: 300, height: 1200, alt: '' },
  'vine-right': { folder: 'floral', fallback: 'vine-right.svg', width: 300, height: 1200, alt: '' },
  'lily-crown': { folder: 'floral', fallback: 'lily-crown.svg', width: 712, height: 110, alt: '' },

  // Ornaments
  'divider': { folder: 'ornaments', fallback: 'divider.svg', width: 330, height: 26, alt: '' },
  'branch-top': { folder: 'ornaments', fallback: 'branch-top.svg', width: 664, height: 74, alt: '' },
  'branch-bottom': { folder: 'ornaments', fallback: 'branch-bottom.svg', width: 664, height: 74, alt: '' },

  // Patterns (a repeating tile, used as a CSS background)
  'jali': { folder: 'patterns', fallback: 'jali.svg', width: 72, height: 72, alt: '' },

  // Religious calligraphy and identity
  'bismillah': {
    folder: 'calligraphy',
    fallback: 'bismillah-tughra.svg',
    width: 340,
    height: 224,
    alt: 'Bismillahir Rahmanir Raheem in Arabic calligraphy',
  },
  'aa-monogram': {
    folder: 'monogram',
    fallback: 'aa-monogram.svg',
    width: 297,
    height: 243,
    alt: 'Amir and Ariza monogram',
  },
} satisfies Record<string, ArtSlot>;

export type ArtName = keyof typeof artSlots;
