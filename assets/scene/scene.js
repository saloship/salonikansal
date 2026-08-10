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
import { SHOTS, SHOTS_MOBILE, MORPHS, LAYERS, MOBILE_VIEW, SHEET_W, ASPECT } from './shots.js';

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

/* `hold` is the fraction of a section the camera spends parked on that section's framing
   before it starts travelling to the next one. It was 0.62, which meant every move had to be
   crammed into the remaining 38% — so the camera sat dead still, then lurched. That reads as
   "not smooth" no matter how clean the interpolation is, because the problem is not the easing,
   it is that the same distance is being covered in a third of the scroll.
   Measured on a 300-sample sweep of the whole page, as the fraction of scroll that moves the
   camera not at all, and the largest single step between samples:

     hold 0.62 (before)   ~62% dead scroll,  step up to ~9%
     hold 0.32             38% dead scroll,  step up to 5.0%
     hold 0.15             ~15% dead scroll, step up to ~4%

   0.15 keeps a short landing pause and spends the other 85% travelling. The smoothstep still
   eases both ends, so arriving and leaving are gentle without needing a dead zone to sell it —
   which is the point: the stillness was being bought with a lurch, and a scroll that changes
   nothing is the specific thing she has now reported three times. */
export function mountScene(svg, { sheet = '', overlay = '', copy = null,
                                  sections = '#copy section', hold = 0.15,
                                  markers = [], details = [], onObject = null } = {}) {
  /* If the drawing was inlined at build time, DO NOT rebuild it. Reusing the served markup
     is the whole point: one request instead of a module round-trip, no flash of an empty
     stage on first paint, and — most importantly — the drawing is still there if the module
     never loads at all. Rebuilding would throw away the copy the browser already has. */
  if (!svg.querySelector('.obj')) {
    svg.innerHTML = `${GRID_DEFS}
      <rect class="gridbg" x="-800" y="-800" width="4400" height="4000" fill="url(#bp50)"/>
      <g id="camg"><g class="art" id="scene">${buildScene({ copy })}</g>${overlay}</g>
      <g class="sheet" id="furniture">${sheet}</g>`;
  }

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

      /* A transparent hit rect, because this drawing is almost all unfilled strokes —
         hovering a 1.3px line is a game of skill, not an interaction.

         Padded to a minimum size, because a phone renders the whole desk at roughly a
         quarter of a pixel per millimetre: a mug comes out 30px across and the phone prop
         25px, well under a finger. The pad applies to the TARGET only — `box` keeps the
         true bounds, so culling still uses real geometry.

         Appended last so it sits on top within its own object; objects nearer the camera
         come later in the document, so their hit areas correctly win over those behind. */
      const MIN = 190;
      let hx = a, hy = b, hw = c - a, hh = d - b;
      if (hw < MIN) { hx -= (MIN - hw) / 2; hw = MIN; }
      if (hh < MIN) { hy -= (MIN - hh) / 2; hh = MIN; }
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hit.setAttribute('class', 'hit');
      hit.setAttribute('x', hx.toFixed(1));
      hit.setAttribute('y', hy.toFixed(1));
      hit.setAttribute('width', hw.toFixed(1));
      hit.setAttribute('height', hh.toFixed(1));
      el.appendChild(hit);
    }
    return { el, id: el.id.replace(/^p-/, ''), box, shown: true, lit: false };
  });

  /* ONE MARKER PER SECTION, not one per object.
     Twenty-five markers at 17 units is about four pixels each on a phone — invisible,
     untappable, and competing with each other. Each section now gets a single marker, big
     enough for a finger, sitting over its anchor object: the one that owns the detail view,
     or the largest in the group if none does.

     Every object in the group stays tappable through its own padded hit rect, so tapping
     ANY travel object still takes you to travel. The marker says where the group is; the
     whole group is the target. */
  const detailSet = new Set(details);
  /* Markers live inside the camera group so they travel with the object they belong to —
     which also means the camera SCALES them. At a 2x shot a 62-unit cue rendered as a
     180px disc with lettering to match, sitting over the drawing like a sticker. They are
     interface, not drawing, so they get counter-scaled every frame to a fixed pixel size
     (see MARK_PX): the cue stays the same size to the hand whatever the zoom is doing. */
  const cues = [];                    // not `marks` — that name already holds section offsets
  const MARK_PX = 23;                 // on-screen radius of the plus disc
  const groups = new Map();
  for (const o of objs) {
    const sec = markers[o.id];
    if (!sec || !o.box) continue;
    o.el.classList.add('tappable');
    if (!groups.has(sec)) groups.set(sec, []);
    groups.get(sec).push(o);
  }

  const area = b => Math.max(1, b[2] - b[0]) * Math.max(1, b[3] - b[1]);
  for (const [, members] of groups) {
    const owner = members.find(m => detailSet.has(m.id));
    const anchor = owner || members.reduce((a, b) => (area(a.box) >= area(b.box) ? a : b));
    if (owner) anchor.el.classList.add('has-detail');
    for (const m of members) m.el.classList.add('in-' + (owner ? 'detail' : 'plain'));

    const [x0, y0, x1] = anchor.box;
    const mx = x1 - 30, my = y0 - 26;
    /* TWO nested groups, and the nesting is load-bearing. The pulse in the stylesheet animates
       `transform` on .mark, and an animated property REPLACES the transform attribute rather
       than composing with it — so the counter-scale below was being thrown away for exactly the
       cue that matters most, the lit one with a detail view behind it, which throbbed between
       46px and 170px. The animation stays on .mark; the fit lives on the inner group, where
       nothing competes for the property. */
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'mark');
    const fit = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    fit.setAttribute('class', 'markfit');
    fit.innerHTML =
      `<circle class="mark-r" cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="62"/>` +
      `<path class="mark-p" d="M${(mx - 30).toFixed(1)} ${my.toFixed(1)}h60` +
      `M${mx.toFixed(1)} ${(my - 30).toFixed(1)}v60"/>` +
      /* A word as well as a glyph: a plus alone says something happens, the label says
         what. MORE where a detail view sits behind the group, GO where the tap travels. */
      `<text class="mark-t" x="${(mx - 78).toFixed(1)}" y="${(my + 24).toFixed(1)}" ` +
      `text-anchor="end">${owner ? 'MORE' : 'GO'}</text>`;
    g.appendChild(fit);
    anchor.el.appendChild(g);
    cues.push({ el: fit, mx, my });
  }

  if (onObject) {
    svg.addEventListener('click', e => {
      const g = e.target.closest && e.target.closest('.obj.tappable');
      if (g) onObject(g.id.replace(/^p-/, ''));
    });
  }

  /* morph targets, resolved once */
  const morphs = MORPHS.map(m => ({
    ...m,
    paths: [...svg.querySelectorAll(`${m.sel} [data-d0]`)]
      .map(el => ({ el, d0: el.dataset.d0, d1: el.dataset.d1 })),
    last: -1
  })).filter(m => m.paths.length);

  let list = pickList();
  let lastLit = -1;
  let lastK = 0, moveTimer = 0;    // camera scale last frame, and the settle timer for LOD

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
    return isPortrait() ? SHOTS_MOBILE : SHOTS;
  }

  function isPortrait() { return matchMedia('(max-width: 900px)').matches; }

  /* Portrait frames the whole room from its own viewBox and never transforms the camera;
     landscape keeps the 16:10 sheet and flies across it. */
  function applyViewport() {
    const p = isPortrait();
    svg.setAttribute('viewBox', p ? MOBILE_VIEW.join(' ') : VIEWBOX);
    if (p) {
      camg.style.transform = '';
      for (const L of layers) L.el.style.transform = '';
      /* Portrait never scales the camera, so the authored 62-unit cue is already the
         ~29px target on a phone. Any counter-scale left over from a landscape render
         has to go, or a rotated phone keeps a desktop-sized correction. */
      for (const c of cues) c.el.removeAttribute('transform');
    }
    return p;
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
    const fixed = isPortrait();

    if (!fixed) {
      const k = SHEET_W / w;
      camg.style.transform = `scale(${k}) translate(${-x}px, ${-y}px)`;
      const dx = (x + w / 2 - SHEET_W / 2) * PARALLAX;
      const dy = (y + w / ASPECT / 2 - SHEET_H / 2) * PARALLAX * 0.5;
      for (const L of layers) L.el.style.transform = `translate(${dx * L.w}px, ${dy * L.w}px)`;

      /* Hold the cues at MARK_PX on screen. Derived from the SVG's real rendered width
         rather than a guessed constant, so the cue is the same physical size on a 1280
         laptop as on a 2560 display — the authored radius is 62 units, and one unit is
         (k * clientWidth / SHEET_W) pixels once the camera has had its say. */
      /* LEVEL OF DETAIL, KEYED TO MOTION RATHER THAN TO ZOOM.
         Changing the camera scale forces the browser to re-rasterise the whole drawing, and
         measured over a full-page traverse that is the ENTIRE jank tail: with the scale frozen
         the 90th-percentile frame is 17ms and nothing exceeds 50ms; live it is 50ms with
         thirteen frames over 50. Removing transitions, the drafting sheet and the grid
         background each changed nothing, so this is where the cost is.

         The obvious fix — drop detail at wide framings — is wrong here, because the mesh is
         plainly visible on the figure and the chair in the opening shot. So detail is dropped
         while the camera is MOVING and restored the moment it settles. That spends the saving
         exactly where the cost is, and costs nothing where the reader actually looks: the
         camera deliberately holds still for the first 62% of every section, which is where
         they stop and read. */
      if (Math.abs(k - lastK) > k * 0.0015) {
        if (!svg.dataset.moving) svg.dataset.moving = '1';
        clearTimeout(moveTimer);
        moveTimer = setTimeout(() => { delete svg.dataset.moving; }, 110);
      }
      lastK = k;

      const px = k * (svg.clientWidth || SHEET_W) / SHEET_W;
      const s = px > 0 ? (MARK_PX / px) / 62 : 1;
      for (const c of cues) {
        c.el.setAttribute('transform',
          `translate(${c.mx.toFixed(1)} ${c.my.toFixed(1)}) scale(${s.toFixed(4)}) ` +
          `translate(${(-c.mx).toFixed(1)} ${(-c.my).toFixed(1)})`);
      }
    }

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
       than drawing a few you cannot see. Portrait shows the whole room at once, so
       there is nothing off camera to cull and everything stays drawn. */
    if (fixed) {
      for (const o of objs) if (!o.shown) { o.shown = true; o.el.style.display = ''; }
    } else {
      const h = w / ASPECT, m = w * 0.15;
      for (const o of objs) {
        if (!o.box) continue;
        const out = o.box[2] < x - m || o.box[0] > x + w + m
                 || o.box[3] < y - m || o.box[1] > y + h + m;
        if (out === o.shown) { o.shown = !out; o.el.style.display = out ? 'none' : ''; }
      }
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
  /* Raw position within the current section, BEFORE the camera's hold is applied. The
     camera deliberately sits still for the first `hold` of a section, so its progress is
     zero for most of the scroll — useful for the camera, useless for anything that should
     respond as you move. Anything scroll-coupled wants this instead. */
  let rawI = 0, rawT = 0;

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
    /* Past the final section, raw progress is 1 — not 0. Reporting 0 meant anything
       scroll-coupled read "nothing has happened yet" at the very end, so the closing text
       typed itself back down to nothing exactly when the reader arrived at it. */
    if (i >= last) { rawI = last; rawT = 1; return last; }
    const span = Math.max(1, marks[i + 1] - marks[i]);
    const local = clamp01((probe - marks[i]) / span);
    rawI = i; rawT = local;
    const t = local <= hold ? 0 : (local - hold) / (1 - hold);
    return i + clamp01(t);
  }

  function tick() {
    raf = 0;
    let p = progressAt(target);
    if (reduceMo) p = Math.round(p);        // snap between shots, no scrubbing
    const near = render(p);
    if (onShot) onShot(near, p, { i: rawI, t: rawT });
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
    applyViewport();
    measure();
    schedule();
  }, { passive: true });

  /* Section heights depend on text reflow, which depends on fonts. Re-measure once
     they land, or every mark is computed against the fallback metrics. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measure(); schedule(); });
  }
  addEventListener('load', () => { measure(); schedule(); });

  applyViewport();
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
