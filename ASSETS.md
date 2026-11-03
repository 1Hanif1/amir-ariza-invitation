# Visual assets

Every illustration on the site is a named slot, listed in `src/data/assets.ts`.

**To replace one:** save your file at the path below with any of the extensions `.avif`, `.webp`, `.png` or `.svg`, then rebuild. No component needs editing. If a slot has no custom file, it shows its built-in artwork from `public/art/`, so a missing asset can never break the page.

If your file has different proportions from the listed size, update `width` and `height` for that slot in `src/data/assets.ts`, so the page reserves the right space while it loads.

## Where the built-in artwork comes from

| Artwork | Source |
| --- | --- |
| Lilies, lily crown | Line art from the family's invitation PDF, painted for this site |
| AA monogram, Bismillah tughra, divider, leaf branches | Lifted directly from the invitation PDF |
| Vines, marigolds, blossom, jali tile | Generated for this site, in the same gouache-and-fine-line style |

The lilies are cropped along one side and the bottom, as on the card. Layouts rely on this: the cropped edges sit against the screen edge and a ruled line, so the flower appears to grow from them.

## Floral: `public/assets/floral/`

Keep transparent backgrounds. Sizes are the minimum for a sharp result on phones; raster files should be WebP or AVIF, ideally under 150 KB each.

| Name | Size (px) | Where it appears | Art direction |
| --- | --- | --- | --- |
| `hero-lily-left` | 1470 × 980 | Hero, lower left. Largest flower on the page. Loads immediately | Rose and burgundy. Crop at left and bottom |
| `hero-lily-right` | 1470 × 980 | Hero, lower right, shown smaller | Saffron. Crop at right and bottom |
| `lily-haldi` | 1470 × 980 | 11 December chapter | Saffron. Crop at left and bottom |
| `lily-nikah` | 1470 × 980 | 17 December chapter | Lavender and teal. Crop at right and bottom |
| `lily-reception-left` | 1470 × 980 | 20 December, foot of the burgundy page | Rose, must stand out against burgundy. Crop at left and bottom |
| `lily-reception-right` | 1470 × 980 | 20 December, foot of the burgundy page | Mirror of the above. Crop at right and bottom |
| `marigold-spray` | 840 × 600 | Beside "The Celebrations" heading | Marigolds on a stem |
| `blossom` | 128 × 128 | Nikah programme: one per step, shown small | A simple flower that reads at 32 px |
| `vine-left` | 600 × 2400 | Margin beside the invitation, wide screens only. Stretched to section height | Tall, airy climbing vine |
| `vine-right` | 600 × 2400 | As above, right side | As above, not a mirror image |
| `lily-crown` | 1424 × 220 | Rising from the footer line | Symmetrical, cropped along the bottom |

## Ornaments: `public/assets/ornaments/`

| Name | Size (px) | Where it appears |
| --- | --- | --- |
| `divider` | 660 × 52 | Between parts of the invitation and in the footer |
| `branch-top` | 1328 × 148 | Above the blessing |
| `branch-bottom` | 1328 × 148 | Below the blessing |

## Patterns: `public/assets/patterns/`

| Name | Size (px) | Where it appears |
| --- | --- | --- |
| `jali` | 144 × 144 | Background behind the arch and the blessing. Must tile seamlessly. Shown at 22% opacity, so draw it as fine dark lines on transparent |

## Calligraphy: `public/assets/calligraphy/`

| Name | Size (px) | Where it appears |
| --- | --- | --- |
| `bismillah` | 680 × 448 | Crown of the hero arch |

Religious calligraphy should come from a trusted source and be checked by someone who reads Arabic before it goes live. Keep it clear of other ornament. Do not use it as a background or pattern.

## Monogram: `public/assets/monogram/`

| Name | Size (px) | Where it appears |
| --- | --- | --- |
| `aa-monogram` | 594 × 486 | Navigation (40 px tall), hero and footer. An SVG is best, as it must hold up at very small sizes |

## Arches: `public/assets/arches/`

The hero arch is generated in code (`src/components/decorative/ArchDecoration.astro`) so its legs can run the full height of the invitation at any screen width. The folder is reserved. A painted arch would need that component changed, because a fixed image cannot stretch this way without distorting.

## Share preview and icons: `public/`

These are placeholders made from the built-in artwork. Replace the files directly, keeping the names.

| File | Size (px) | Use |
| --- | --- | --- |
| `og-image.jpg` | 1200 × 630 | Image shown when the link is shared on WhatsApp. Keep it under 300 KB and keep the main content central, as some apps crop the edges |
| `favicon.svg` | Any | Browser tab icon |
| `favicon-32.png` | 32 × 32 | Browser tab icon fallback |
| `apple-touch-icon.png` | 180 × 180 | iPhone home screen icon |
