/**
 * A burst of rose petals and gold leaf, drawn on a full-screen canvas laid over the page.
 * Petals shoot up out of a region, slow against the air, then tumble and sway down and fade.
 *
 * Uses the generated images when they are there; otherwise draws simple petals and flakes itself.
 */

export type PieceKind = 'petal' | 'gold';

export interface PieceImage {
  src: string;
  kind: PieceKind;
}

type Sprite = CanvasImageSource & { width: number; height: number };

interface Piece {
  sprite: Sprite;
  kind: PieceKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  flipPhase: number;
  flipSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmount: number;
  bornAt: number;
  diesAt: number;
}

export interface BurstOptions {
  /** How many pieces in all. About a fifth are gold leaf. */
  count: number;
  /** The pieces are released over this long, rather than all at once. */
  releaseMs: number;
  /** Where pieces start: a triangle pointing down from the top edge to this point, as fractions of the screen. */
  mouth: { tipX: number; tipY: number };
}

const AIR_DRAG = 2.2; // per second
const GRAVITY = 0.55; // screen heights per second squared; with the drag, petals settle to about a quarter screen per second
const FADE_MS = 1200;
const GOLD_SHARE = 0.18;

const random = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

/** Starts loading the images now, so they are ready by the time the guest taps. */
export function preloadPieces(images: PieceImage[]): Promise<Map<PieceKind, Sprite[]>> {
  const loaded = images.map(
    (image) =>
      new Promise<{ kind: PieceKind; img: HTMLImageElement } | null>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve({ kind: image.kind, img });
        img.onerror = () => resolve(null);
        img.src = image.src;
      }),
  );

  return Promise.all(loaded).then((results) => {
    const sprites = new Map<PieceKind, Sprite[]>([
      ['petal', []],
      ['gold', []],
    ]);
    for (const result of results) if (result) sprites.get(result.kind)!.push(result.img);
    if (sprites.get('petal')!.length === 0) sprites.set('petal', drawnPetals());
    if (sprites.get('gold')!.length === 0) sprites.set('gold', drawnGoldLeaf());
    for (const [kind, list] of sprites) sprites.set(kind, list.map(withShadow));
    return sprites;
  });
}

/** Plays one burst and resolves when the last piece has faded. */
export function burstPieces(sprites: Map<PieceKind, Sprite[]>, options: BurstOptions): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    // Above the envelope (z-index 100), and drifting on over the page once it has gone.
    zIndex: '110',
    pointerEvents: 'none',
  });
  document.body.append(canvas);
  const context = canvas.getContext('2d');
  if (!context) {
    canvas.remove();
    return Promise.resolve();
  }

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
  };
  resize();
  window.addEventListener('resize', resize);

  const start = performance.now();
  const pieces: Piece[] = Array.from({ length: options.count }, (_, index) => {
    const kind: PieceKind = Math.random() < GOLD_SHARE ? 'gold' : 'petal';
    const shortSide = Math.min(width, height);
    const tipX = width * options.mouth.tipX;
    const tipY = height * options.mouth.tipY;

    // Somewhere inside the envelope's open mouth, nearer the top where it is wide.
    const depth = random(0.2, 0.85);
    const y = tipY * depth;
    const halfWidth = (width / 2) * (1 - depth) * 0.85;
    const x = tipX + random(-1, 1) * halfWidth;
    const outward = (x - tipX) / (width / 2);

    return {
      sprite: pick(sprites.get(kind)!),
      kind,
      x,
      y,
      vx: (outward * random(0.8, 1.6) + random(-0.6, 0.6)) * width,
      vy: -random(0.3, 0.85) * height,
      // Never smaller than about 22px, so petals still read on a phone.
      size: Math.max(shortSide * 0.05, 26) * (kind === 'petal' ? random(0.85, 1.45) : random(0.4, 0.65)),
      rotation: random(0, Math.PI * 2),
      spin: random(-3.2, 3.2),
      flipPhase: random(0, Math.PI * 2),
      flipSpeed: random(2, 5.5),
      swayPhase: random(0, Math.PI * 2),
      swaySpeed: random(1.2, 2.4),
      swayAmount: random(0.012, 0.03) * width,
      bornAt: start + (index / options.count) * options.releaseMs,
      diesAt: start + options.releaseMs + random(4200, 6000),
    };
  });

  return new Promise((resolve) => {
    let last = start;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      let alive = 0;
      for (const piece of pieces) {
        if (now < piece.bornAt) {
          alive++;
          continue;
        }
        if (now > piece.diesAt || piece.y > height + piece.size * 2) continue;
        alive++;

        const age = (now - piece.bornAt) / 1000;
        piece.vx += -AIR_DRAG * piece.vx * dt;
        piece.vy += (GRAVITY * height - AIR_DRAG * piece.vy) * dt;
        piece.x += piece.vx * dt;
        piece.y += piece.vy * dt;
        piece.rotation += piece.spin * dt;
        piece.spin *= 1 - 0.25 * dt;

        // Sway grows as the piece loses its upward rush.
        const sway = Math.sin(age * piece.swaySpeed + piece.swayPhase) * piece.swayAmount * Math.min(age, 1);
        // Tumbling: squashing one axis reads as the piece turning over in the air.
        const flip = Math.cos(age * piece.flipSpeed + piece.flipPhase);
        const fade = Math.min(1, (piece.diesAt - now) / FADE_MS, age / 0.15);

        context.save();
        context.translate(piece.x + sway, piece.y);
        context.rotate(piece.rotation);
        context.scale(1, Math.max(Math.abs(flip), 0.12) * Math.sign(flip || 1));
        // Gold leaf catches the light as it turns.
        context.globalAlpha = piece.kind === 'gold' ? fade * (0.65 + 0.35 * Math.abs(flip)) : fade;
        const aspect = piece.sprite.height / piece.sprite.width;
        context.drawImage(piece.sprite, -piece.size / 2, (-piece.size * aspect) / 2, piece.size, piece.size * aspect);
        context.restore();
      }

      if (alive > 0) {
        requestAnimationFrame(frame);
      } else {
        window.removeEventListener('resize', resize);
        canvas.remove();
        resolve();
      }
    };

    requestAnimationFrame(frame);
  });
}

/**
 * Bakes a soft shadow into a sprite once, so ivory petals still read against the ivory envelope
 * without the cost of drawing a shadow on every frame.
 */
function withShadow(source: Sprite): Sprite {
  const longest = 160;
  const scale = Math.min(1, longest / Math.max(source.width, source.height));
  const w = Math.round(source.width * scale);
  const h = Math.round(source.height * scale);
  const pad = Math.round(Math.max(w, h) * 0.12);
  const canvas = document.createElement('canvas');
  canvas.width = w + pad * 2;
  canvas.height = h + pad * 2;
  const c = canvas.getContext('2d');
  if (!c) return source;
  c.shadowColor = 'rgb(74 58 34 / 0.38)';
  c.shadowBlur = pad * 0.6;
  c.shadowOffsetY = pad * 0.25;
  c.drawImage(source, pad, pad, w, h);
  return canvas;
}

/**
 * Petal colours from the main site's palette: each is [tip, body, base], so a petal is pale at its
 * tip and deepens towards where it met the flower. Rose and saffron appear twice, as the site's
 * own lilies are mostly those two.
 */
const PETAL_COLOURS: [string, string, string][] = [
  ['#f8ebe4', '#e6c7b8', '#c9988a'], // rose
  ['#f8ebe4', '#e2bcab', '#bf8c7c'], // deeper rose
  ['#fbf2d6', '#ead08c', '#cfae5c'], // saffron
  ['#fcf5df', '#efdba0', '#d5b76a'], // pale saffron
  ['#f2eaf5', '#d6c4de', '#ad93bc'], // lavender
  ['#f8e1d2', '#e2ad8c', '#c98d67'], // terracotta
  ['#fffdf8', '#f4ead8', '#e3c98a'], // ivory
];

/** Stand-in petals in the site's colours, each colour in three shapes, from slender to round. */
function drawnPetals(): Sprite[] {
  return PETAL_COLOURS.flatMap(([tip, body, base]) =>
    [0.62, 0.72, 0.82].map((roundness) => {
      const w = 96;
      const h = 120;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const c = canvas.getContext('2d')!;
      const fill = c.createLinearGradient(0, 0, 0, h);
      fill.addColorStop(0, tip);
      fill.addColorStop(0.55, body);
      fill.addColorStop(1, base);
      c.fillStyle = fill;
      c.beginPath();
      c.moveTo(w / 2, h * 0.97);
      c.bezierCurveTo(w * (0.5 - roundness), h * 0.6, w * 0.02, h * 0.05, w * 0.42, h * 0.06);
      c.quadraticCurveTo(w / 2, h * 0.075, w * 0.58, h * 0.06);
      c.bezierCurveTo(w * 0.98, h * 0.05, w * (0.5 + roundness), h * 0.6, w / 2, h * 0.97);
      c.fill();
      // A faint central vein, as on a real petal.
      c.strokeStyle = base;
      c.globalAlpha = 0.35;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(w / 2, h * 0.92);
      c.quadraticCurveTo(w * 0.53, h * 0.5, w / 2, h * 0.18);
      c.stroke();
      return canvas;
    }),
  );
}

/** Stand-in gold leaf: small irregular flakes. */
function drawnGoldLeaf(): Sprite[] {
  return [0, 1, 2].map(() => {
    const size = 48;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const c = canvas.getContext('2d')!;
    const fill = c.createLinearGradient(0, 0, size, size);
    fill.addColorStop(0, '#e3c98a');
    fill.addColorStop(0.5, '#b68f2e');
    fill.addColorStop(1, '#936b29');
    c.fillStyle = fill;
    c.beginPath();
    const corners = 7;
    for (let i = 0; i < corners; i++) {
      const angle = (i / corners) * Math.PI * 2;
      const radius = (size / 2) * random(0.55, 0.95);
      const px = size / 2 + Math.cos(angle) * radius;
      const py = size / 2 + Math.sin(angle) * radius;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    c.fill();
    return canvas;
  });
}
