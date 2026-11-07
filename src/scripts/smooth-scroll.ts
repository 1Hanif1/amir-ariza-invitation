/**
 * Smooth, slightly weighted scrolling for mouse wheels and trackpads, and smooth jumps to
 * sections from links. Phones keep their own touch scrolling, which already glides.
 *
 * Off for guests who have asked their device for less motion. Paused while the envelope is up,
 * and started the moment the opening hands the page back (or its fail-safe releases it).
 */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const root = document.documentElement;
const held = () => root.classList.contains('opening-pending') || root.classList.contains('opening-running');

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const lenis = new Lenis({
    autoRaf: true,
    lerp: 0.085,
    // Links land where the browser would: Lenis honours the page's scroll-padding-top (global.css),
    // which leaves room above the section for the floating navigation.
    anchors: true,
  });

  if (held()) {
    lenis.stop();
    const watcher = new MutationObserver(() => {
      if (held()) return;
      watcher.disconnect();
      lenis.start();
    });
    watcher.observe(root, { attributes: true, attributeFilter: ['class'] });
  }
}
