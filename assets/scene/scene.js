/* ===========================================================================
   THE CAMERA
   ---------------------------------------------------------------------------
   Scroll drives one camera across one drawing. Three decisions matter:

   1. The camera is a CSS transform on a group, not an animated `viewBox`.
      Animating viewBox repaints the whole scene every frame; a transform is
      composited, and SVG re-rasterises as vectors so a 3x zoom stays sharp.

   2. Zoom is interpolated in LOG space. Lerping width linearly races through
      the wide end of a move and crawls through the tight end, which reads as
      the camera losing its nerve. Log space gives a constant rate of change.

   3. Layers slide against each other by a fraction of the pan. That is the
      parallax, and it costs nothing — they are transforms the camera is already
      applying.

   Culling uses the footprints desk.mjs already writes onto each group as
   `data-foot`, so an object off camera stops being drawn without anyone having
   to maintain a second list of where things are.
   =========================================================================== */

import { buildScene, GRID_DEFS, P, VIEWBOX } from './desk.mjs';
import { SHOTS, SHOTS_MOBILE, MORPHS, LAYERS, SHEET_W, ASPECT } from './shots.js';

/* Numeric interpolation between two `d` strings. Valid only when both have
   identical command structure — which desk.mjs guarantees by generating both
   states from one function, and tools/check-morphs.mjs enforces at build time.
   That guarantee is the entire reason this is ten lines and not a dependency. */
const NUM = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
export function lerpPath(d0, d1, t) {
  const b = d1.match(NUM);
  let i = 0;
  return d0.replace(NUM, a => {
    const v = +a + (+b[i++] - +a) * t;
    return Math.round(v * 100) / 100;
  });
}

const SHEET_H = SHEET_W / ASPECT;
const PARALLAX = 0.055;
const reduceMo = matchMedia('(prefers-reduced-motion:reduce)').matches;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = t => (t < 0 ? 0 : t > 1 ? 1 : t);
const smooth = t => t * t * (3 - 2 * t);

export function mountScene(svg, { sheet = '', overlay = '', copy = null,
                                  sections = '#copy section', hold = 0.62 } = {}) {
  svg.setAttribute('viewBox', VIEWBOX);
  svg.innerHTML = `${GRID_DEFS}
    <rect class="gridbg" x="0" y="0" width="${SHEET_W}" height="${SHEET_H}" fill="url(#bp50)"/>
    <g id="camg"><g class="art" id="scene">${buildScene({ copy })}</g>${overlay}</g>
    <g class="sheet" id="furniture">${sheet}</g>`;

  const camg = svg.querySelector('#camg');
  const layers = LAYERS
    .map(([id, w]) => ({ el: svg.querySelector('#' + id), w }))
    .filter(l => l.el);

  /* Each object's screen bounding box is fixed — the drawing does not move, the
     camera does — so it is worth computing exactly once. */
  const objs = [...svg.querySelectorAll('.obj')].map(el => {
    const f = (el.dataset.foot || '').split(' ').map(Number);
    let box = null;
    if (f.length === 5 && f.every(n => Number.isFinite(n))) {
      const [x0, z0, x1, z1, y1] = f;
      let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
      for (const wx of [x0, x1]) for (const wz of [z0, z1]) for (const wy of [0, y1]) {
        const [px, py] = P(wx, wy, wz);
        if (px < a) a = px;
        if (px > c) c = px;
        if (py < b) b = py;
        if (py > d) d = py;
      }
      box = [a, b, c, d];

      /* A transparent hit rect, because this drawing is almost all unfilled
         strokes — hovering a 1.3px line is a game of skill, not an interaction.
         Appended last so it sits on top WITHIN its own object; objects nearer the
         camera come later in the document, so their hit areas correctly win over
         the ones behind them. */
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hit.setAttribute('class', 'hit');
      hit.setAttribute('x', a.toFixed(1));
      hit.setAttribute('y', b.toFixed(1));
      hit.setAttribute('width', Math.max(1, c - a).toFixed(1));
      hit.setAttribute('height', Math.max(1, d - b).toFixed(1));
      el.appendChild(hit);
    }
    return { el, id: el.id.replace(/^p-/, ''), box, shown: true, lit: false };
  });

  /* morph targets, resolved once */
  const morphs = MORPHS.map(m => ({
    ...m,
    paths: [...svg.querySelectorAll(`${m.sel} [data-d0]`)]
      .map(el => ({ el, d0: el.dataset.d0, d1: el.dataset.d1 })),
    last: -1
  })).filter(m => m.paths.length);

  let list = pickList();
  let lastLit = -1;

  /** Morph progress: ramps in over the last three-quarters of the approach so the
   *  change lands exactly as the camera settles, then holds until `out`. */
  function morphT(m, p) {
    const up = smooth(clamp01((p - (m.in - 0.75)) / 0.75));
    if (m.out === undefined) return up;
    return up * (1 - smooth(clamp01((p - (m.out - 0.75)) / 0.75)));
  }

  /* 900, not 760. A 768px portrait tablet has exactly the phone's problem — too narrow
     for the copy and the drawing side by side, and too narrow for a deep zoom to land
     its subject anywhere useful. The device harness caught it sitting in the desktop
     branch with the card straight over the drawing. One breakpoint, so the stacked
     layout, the portrait shot list and the glow all switch together. */
  function pickList() {
    return matchMedia('(max-width: 900px)').matches ? SHOTS_MOBILE : SHOTS;
  }

  /** Camera rect at fractional shot position p. */
  function camAt(p) {
    const i = Math.max(0, Math.min(Math.floor(p), list.length - 2));
    const t = smooth(clamp01(p - i));
    const a = list[i].r, b = list[i + 1].r;
    const w = Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), t));
    const cx = lerp(a[0] + a[2] / 2, b[0] + b[2] / 2, t);
    const cy = lerp(a[1] + a[2] / ASPECT / 2, b[1] + b[2] / ASPECT / 2, t);
    return [cx - w / 2, cy - w / ASPECT / 2, w];
  }

  function render(p) {
    const [x, y, w] = camAt(p);
    const k = SHEET_W / w;
    camg.style.transform = `scale(${k}) translate(${-x}px, ${-y}px)`;

    const dx = (x + w / 2 - SHEET_W / 2) * PARALLAX;
    const dy = (y + w / ASPECT / 2 - SHEET_H / 2) * PARALLAX * 0.5;
    for (const L of layers) L.el.style.transform = `translate(${dx * L.w}px, ${dy * L.w}px)`;

    /* colour belongs to the nearest shot; the CSS transition does the crossfade */
    const near = Math.round(p);
    if (near !== lastLit) {
      lastLit = near;
      const set = new Set(list[near]?.lit || []);
      for (const o of objs) {
        const want = set.has(o.id);
        if (want !== o.lit) { o.lit = want; o.el.classList.toggle('lit', want); }
      }
      svg.dataset.shot = list[near]?.id || '';
    }

    /* morphs. The endpoints are set from the stored strings rather than
       interpolated, so a held state is exact and costs one attribute write. */
    for (const m of morphs) {
      const t = morphT(m, p);
      if (Math.abs(t - m.last) < 0.004) continue;
      m.last = t;
      if (t <= 0.001) { for (const q of m.paths) q.el.setAttribute('d', q.d0); continue; }
      if (t >= 0.999) { for (const q of m.paths) q.el.setAttribute('d', q.d1); continue; }
      for (const q of m.paths) q.el.setAttribute('d', lerpPath(q.d0, q.d1, t));
    }

    /* cull: a generous margin, because a half-visible object popping is worse
       than drawing a few you cannot see */
    const h = w / ASPECT, m = w * 0.15;
    for (const o of objs) {
      if (!o.box) continue;
      const out = o.box[2] < x - m || o.box[0] > x + w + m
               || o.box[3] < y - m || o.box[1] > y + h + m;
      if (out === o.shown) { o.shown = !out; o.el.style.display = out ? 'none' : ''; }
    }
    return near;
  }

  /* --- scroll driver ------------------------------------------------------
     Progress is measured from where the SECTIONS actually are, not from a fixed
     viewport-per-shot. That is what lets a section be as tall as its content needs:
     a chapter with six sub-items simply occupies more page than a one-line
     statement, and no copy has to be trimmed or hidden behind a button to fit.

     Within a section the camera HOLDS for the first `hold` of it and moves to the
     next shot over the remainder. So the camera is still while you are reading and
     travels while you are between things, which is both calmer and the right way
     round — it used to drift continuously, which is restless and makes long text
     unreadable. */
  let raf = 0, target = 0, onShot = null, marks = [];

  function measure() {
    const y = window.scrollY;
    marks = [...document.querySelectorAll(sections)]
      .map(s => Math.round(s.getBoundingClientRect().top + y));
  }

  function progressAt(scrollTop) {
    if (marks.length < 2) return 0;
    const last = Math.min(marks.length, list.length) - 1;
    /* the reading line sits a third down the viewport — a section counts as being
       read once its copy has risen to about there, not when it first peeks in */
    const probe = scrollTop + window.innerHeight * 0.34;
    let i = 0;
    while (i < last && marks[i + 1] <= probe) i++;
    if (i >= last) return last;
    const span = Math.max(1, marks[i + 1] - marks[i]);
    const local = (probe - marks[i]) / span;
    const t = local <= hold ? 0 : (local - hold) / (1 - hold);
    return i + clamp01(t);
  }

  function tick() {
    raf = 0;
    let p = progressAt(target);
    if (reduceMo) p = Math.round(p);        // snap between shots, no scrubbing
    const near = render(p);
    if (onShot) onShot(near, p, marks.length);
  }

  function schedule() {
    target = window.scrollY;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  /* A backgrounded tab stops servicing requestAnimationFrame. If a frame was in
     flight when that happened, `raf` stays truthy for ever and every later scroll
     is swallowed by the guard — the camera silently stops following the page.
     Clearing the flag on the way back is the whole fix. */
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      schedule();
    }
  });

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => {
    const next = pickList();
    if (next !== list) { list = next; lastLit = -1; }
    measure();
    schedule();
  }, { passive: true });

  /* Section heights depend on text reflow, which depends on fonts. Re-measure once
     they land, or every mark is computed against the fallback metrics. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measure(); schedule(); });
  }
  addEventListener('load', () => { measure(); schedule(); });

  measure();
  schedule();

  return {
    /* Force a synchronous render from the current scroll position. Needed after a
       layout change that moves the sections, and it is the only way to drive the
       camera when requestAnimationFrame is not being serviced. */
    update() { measure(); target = window.scrollY; tick(); },
    shots: () => list,
    /* land on the section itself, wherever measurement put it */
    goTo(n) {
      measure();
      const y = marks[n - 1] ?? 0;
      scrollTo({ top: y, behavior: reduceMo ? 'auto' : 'smooth' });
    },
    onShot(fn) { onShot = fn; schedule(); },
    stats: () => ({
      objects: objs.length,
      paths: svg.querySelectorAll('path').length,
      drawn: objs.filter(o => o.shown).length
    })
  };
}
