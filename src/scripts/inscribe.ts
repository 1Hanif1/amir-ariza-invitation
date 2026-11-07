/**
 * The page is illuminated as the guest reaches it, like a manuscript being written:
 *
 *   [data-write]  names and headings write themselves in, word by word, from a soft blur.
 *                 An optional --write-delay on the element holds it back (the hero uses this).
 *   [data-draw]   ornaments and rules draw themselves on. How is up to the element's own CSS,
 *                 keyed off .is-inscribed (see animations.css and the sections' styles).
 *
 * Each element plays once. Nothing starts while the envelope is up, so the hero writes itself in
 * the moment the opening hands the page over. Under reduced motion, or without JavaScript, the
 * html never gets .inscribe and everything simply stands in place.
 */

const root = document.documentElement;
const held = () => root.classList.contains('opening-pending') || root.classList.contains('opening-running');

/** Wraps each word of an element's text in a span, leaving its inner elements (<br>, spans) in place. */
function splitWords(element: HTMLElement): void {
  let index = 0;
  const walk = (node: Node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
        continue;
      }
      if (child.nodeType !== Node.TEXT_NODE || !child.textContent?.trim()) continue;
      const fragment = document.createDocumentFragment();
      for (const part of child.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          fragment.append(part);
        } else {
          const word = document.createElement('span');
          word.className = 'word';
          word.style.setProperty('--i', String(index++));
          word.textContent = part;
          fragment.append(word);
        }
      }
      child.replaceWith(fragment);
    }
  };
  walk(element);
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  document.querySelectorAll<HTMLElement>('[data-write]').forEach(splitWords);
  root.classList.add('inscribe');

  const begin = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-inscribed');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    document.querySelectorAll('[data-write], [data-draw]').forEach((element) => observer.observe(element));
  };

  if (held()) {
    const watcher = new MutationObserver(() => {
      if (held()) return;
      watcher.disconnect();
      begin();
    });
    watcher.observe(root, { attributes: true, attributeFilter: ['class'] });
  } else {
    begin();
  }
}
