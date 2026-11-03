# Amir & Ariza: wedding website

A single-page static site built with Astro, TypeScript and Tailwind CSS.

## Commands

Requires Node 22 or newer.

| Command | What it does |
| --- | --- |
| `npm install` | Installs dependencies |
| `npm run dev` | Starts a local site at http://localhost:4321 |
| `npm run build` | Type-checks, then builds the site into `dist/` |
| `npm run preview` | Serves the built site locally |

To publish, upload the `dist/` folder to any static host.

## Before sharing the link

1. Set `site.url` in `src/data/wedding.ts` to the live address. The WhatsApp preview image will not appear until this is correct.
2. Have the family check every item marked `CONFIRM` in `src/data/wedding.ts`.
3. Open each **Get directions** link on a phone and check it lands on the right venue.

## Where things live

- **Wording, dates, venues:** `src/data/wedding.ts`. Components read everything from this file.
- **Illustrations:** see [ASSETS.md](ASSETS.md). Drop a file in `public/assets/` under its slot name and rebuild.
- **Colours and fonts:** `@theme` block in `src/styles/global.css`.
- **Motion:** `src/styles/animations.css`. Nothing there runs for visitors who ask for reduced motion.
