/* ===========================================================================
   THE DESK — master scene
   ---------------------------------------------------------------------------
   Everything is authored in real 3D world coordinates and projected once, so
   thirty objects share a single measured space instead of each being nudged
   into place by eye. That is what makes the blueprint read as a drawing of a
   real desk rather than a pile of shapes.

     x  right along the desk       0 .. 2050
     y  up from the desk surface   0 = desktop
     z  away from the viewer       0 = front edge, 720 = wall

   Units are millimetres. A 2050 x 720 desk, monitor 500 tall, mug 96 — the
   proportions are real, which is why the drawing holds together.

   Runs unchanged in Node (build) and the browser (preview).
   =========================================================================== */

/* --- projection: 3/4 view from a little above a seated eyeline ------------- */
export const KZX = 0.35, KZY = 0.65;
/* SC pulls the drawing in so the bottom-right of the sheet stays clear for the
   title block and parts list, the way a real sheet is laid out. */
export const SC = 0.72, OX = 40, OY = 1150;
export const VIEWBOX = '0 0 2400 1500';

/* The desk top in world mm — one source of truth, used by ROOM() to draw it and
   by check-layout.mjs to prove nothing has wandered off the edge. */
export const DESK = { x0: 0, z0: 0, x1: 2050, z1: 720 };

/* --- geometry probe --------------------------------------------------------
   Every prop needs a known footprint: check-layout.mjs uses it to catch objects
   sitting on top of each other, and the camera will use it to cull and to work
   out on-screen scale. Declaring bounds next to the art would drift the moment
   the art changed — and silently, which is worse than having no check at all.
   So nothing is declared: P() records what it is actually asked to project, and
   the footprint falls out of the geometry that really got drawn. */
let probe = null;
export const FOOTPRINTS = {};

export function probeStart(id) {
  probe = { id, x0: Infinity, x1: -Infinity, z0: Infinity, z1: -Infinity, y0: Infinity, y1: -Infinity };
}
export function probeEnd() {
  const b = probe;
  probe = null;
  if (b && b.x0 < Infinity) FOOTPRINTS[b.id] = b;
  return b;
}

export const P = (x, y, z) => {
  if (probe) {
    if (x < probe.x0) probe.x0 = x;
    if (x > probe.x1) probe.x1 = x;
    if (z < probe.z0) probe.z0 = z;
    if (z > probe.z1) probe.z1 = z;
    if (y < probe.y0) probe.y0 = y;
    if (y > probe.y1) probe.y1 = y;
  }
  return [OX + (x + z * KZX) * SC, OY - (y + z * KZY) * SC];
};

/* Annotation and cables are kept out of the footprint. A centre line runs well
   past the object it describes and a cable drapes over whatever is in its way;
   neither is part of the space the object occupies, and counting them would have
   the layout checker reporting collisions that do not exist. */
const noProbe = fn => { const saved = probe; probe = null; const out = fn(); probe = saved; return out; };

const f = n => Math.round(n * 100) / 100;
const d_ = pts => 'M' + pts.map(p => `${f(p[0])} ${f(p[1])}`).join(' L');
const poly = (pts, close = true) => d_(pts) + (close ? ' Z' : '');
const line2 = (a, b) => `M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])}`;

/* circle lying flat in the xz plane — rims, bases, plant pots */
const ringXZ = (cx, cy, cz, r, n = 72) =>
  Array.from({ length: n }, (_, i) => { const t = i / n * Math.PI * 2; return P(cx + r * Math.cos(t), cy, cz + r * Math.sin(t)); });
const arcXZ = (cx, cy, cz, r, a0, a1, n = 48) =>
  Array.from({ length: n + 1 }, (_, i) => { const t = a0 + (a1 - a0) * i / n; return P(cx + r * Math.cos(t), cy, cz + r * Math.sin(t)); });
/* circle standing up facing the viewer — projects 1:1, stays a circle */
const circle2 = (c, r, n = 64) =>
  Array.from({ length: n }, (_, i) => { const t = i / n * Math.PI * 2; return [c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]; });

/* silhouette angles of an upright cylinder under this projection */
const TH_R = Math.atan(KZX), TH_L = TH_R + Math.PI;

/* --- drafted primitives --------------------------------------------------- */

function boxPts(x, y, z, w, h, dp) {
  return {
    f: [P(x, y, z), P(x + w, y, z), P(x + w, y + h, z), P(x, y + h, z)],
    b: [P(x, y, z + dp), P(x + w, y, z + dp), P(x + w, y + h, z + dp), P(x, y + h, z + dp)]
  };
}

/** A drafted rectangular solid: ground-filled for occlusion, outline heaviest,
 *  the three edges hidden behind it dashed. */
export function box(x, y, z, w, h, dp, o = {}) {
  const p = boxPts(x, y, z, w, h, dp);
  const sil = [p.f[0], p.f[1], p.b[1], p.b[2], p.b[3], p.f[3]];
  return `
    <path class="solid" d="${poly(sil)}"/>
    <path class="ol"  d="${poly([p.f[0], p.f[1], p.f[2], p.f[3]])}"/>
    <path class="vis" d="${poly([p.f[3], p.b[3], p.b[2], p.b[1], p.f[1]], false)}"/>
    <path class="vis" d="${line2(p.f[2], p.b[2])}"/>
    ${o.nohidden ? '' : `<path class="hid" d="${line2(p.f[0], p.b[0])}"/>
    <path class="hid" d="${line2(p.b[0], p.b[1])}"/>
    <path class="hid" d="${line2(p.b[0], p.b[3])}"/>`}`;
}

/** Thin flat sheet lying on the desk — paper, map, sketchpad, mat. */
export function sheet(x, y, z, w, dp, t = 3, o = {}) {
  const top = [P(x, y + t, z), P(x + w, y + t, z), P(x + w, y + t, z + dp), P(x, y + t, z + dp)];
  return `
    <path class="solid" d="${poly(top)}"/>
    <path class="${o.light ? 'vis' : 'ol'} ${o.col ? 'col' : ''}" ${o.col ? `style="--c:${o.col}"` : ''} d="${poly(top)}"/>
    <path class="vis" d="${poly([P(x, y, z), P(x, y + t, z), P(x + w, y + t, z), P(x + w, y, z)], false)}"/>`;
}

/** Upright cylinder — mug, bottle, pen cup, pot. Silhouette follows the real
 *  tangent angles, and the hidden half of the base is dashed. */
export function cyl(cx, cz, r, h, y0 = 0, o = {}) {
  const at = (a, y) => [cx + r * Math.cos(a), y, cz + r * Math.sin(a)];
  const sil = [P(...at(TH_L, y0 + h)), P(...at(TH_L, y0))]
    .concat(arcXZ(cx, y0, cz, r, TH_L, TH_R + Math.PI * 2).slice(1, -1))
    .concat([P(...at(TH_R, y0)), P(...at(TH_R, y0 + h))])
    .concat(arcXZ(cx, y0 + h, cz, r, TH_R, TH_L).slice(1, -1));
  return `
    <path class="solid" d="${poly(sil)}"/>
    <path class="ol"  d="${poly(sil)}"/>
    <path class="vis" d="${poly(ringXZ(cx, y0 + h, cz, r))}"/>
    ${o.nohidden ? '' : `<path class="hid" d="${poly(arcXZ(cx, y0, cz, r, TH_R, TH_L), false)}"/>`}
    ${o.inner ? `<path class="vis" d="${poly(ringXZ(cx, y0 + h - 4, cz, r - o.inner))}"/>` : ''}
    ${o.fill ? `<path class="col vis" style="--c:${o.fill}" d="${poly(ringXZ(cx, y0 + h - 14, cz, r - (o.inner || 6) - 2))}"/>` : ''}`;
}

/** Screen device — panel plus an inset display that carries the colour. */
export function panel(x, y, z, w, h, dp, o = {}) {
  const m = Math.min(w, h) * 0.055;
  const scr = [P(x + m, y + m, z), P(x + w - m, y + m, z), P(x + w - m, y + h - m, z), P(x + m, y + h - m, z)];
  return `
    ${box(x, y, z, w, h, dp, { nohidden: o.nohidden })}
    <path class="col vis" style="--c:${o.col || '#3d6f92'}" d="${poly(scr)}"/>
    ${o.content ? o.content(x + m, y + m, z, w - 2 * m, h - 2 * m) : ''}`;
}

/** Centre line on a vertical axis of symmetry. */
export const centre = (x, z, y0, y1) =>
  noProbe(() => `<path class="cen" d="${line2(P(x, y0, z), P(x, y1, z))}"/>`);

/* --- feature detail ------------------------------------------------------- */

/** Fastener: circle with the crossed centre marks a drawing always carries. */
export const screw = (x, y, z, r = 7) => {
  const c = P(x, y, z);
  return `<path class="vis" d="${poly(circle2(c, r))}"/>
    <path class="cen" d="${line2([c[0] - r * 1.9, c[1]], [c[0] + r * 1.9, c[1]])}"/>
    <path class="cen" d="${line2([c[0], c[1] - r * 1.9], [c[0], c[1] + r * 1.9])}"/>`;
};

/** Speaker grille — concentric rings of perforations on a vertical face. */
export function grille(cx, cy, cz, R, rings = 3) {
  const out = [];
  for (let k = 1; k <= rings; k++) {
    const rr = R * k / (rings + 0.4), n = 6 + k * 6;
    for (let i = 0; i < n; i++) {
      const t = i / n * Math.PI * 2 + k * 0.3;
      out.push(`<path d="${poly(circle2(P(cx + rr * Math.cos(t), cy + rr * Math.sin(t), cz), R * 0.045), 12)}"/>`);
    }
  }
  return `<g class="con">${out.join('')}</g>`;
}

/** Vent slots cut into a horizontal face. */
export function vents(x, y, z, w, dp, n = 7) {
  const s = [];
  for (let i = 0; i < n; i++) {
    const zz = z + dp * (i + 0.5) / n;
    s.push(`<path d="${line2(P(x, y, zz), P(x + w, y, zz))}"/>`);
  }
  return `<g class="con">${s.join('')}</g>`;
}

/** Knurled band around a cylinder — cap grips, focus wheels. */
export function knurl(cx, cz, r, y0, h, n = 26) {
  const t = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    if (Math.sin(a) > 0.15) continue;                 // only the near face reads
    const px = cx + r * Math.cos(a), pz = cz + r * Math.sin(a);
    t.push(`<path d="${line2(P(px, y0, pz), P(px, y0 + h, pz))}"/>`);
  }
  return `<g class="con">${t.join('')}</g>`;
}

/** Rounded rectangle lying in the xy plane (screens, keys, panels). */
export function rrectXY(x, y, z, w, h, r) {
  const p = (a, b) => P(a, b, z);
  const A = p(x + r, y), B = p(x + w - r, y), C = p(x + w, y + r), D = p(x + w, y + h - r);
  const E = p(x + w - r, y + h), F = p(x + r, y + h), G = p(x, y + h - r), H = p(x, y + r);
  const q = (a, c, b) => `Q${f(c[0])} ${f(c[1])} ${f(b[0])} ${f(b[1])}`;
  return `M${f(A[0])} ${f(A[1])} L${f(B[0])} ${f(B[1])} ${q(B, p(x + w, y), C)} L${f(D[0])} ${f(D[1])} ${q(D, p(x + w, y + h), E)} L${f(F[0])} ${f(F[1])} ${q(F, p(x, y + h), G)} L${f(H[0])} ${f(H[1])} ${q(H, p(x, y), A)} Z`;
}

/** Rounded rectangle lying flat in the xz plane — keycaps, trackpads, mats. */
export function rrectXZ(x, y, z, w, dp, r) {
  const p = (a, b) => P(a, y, b);
  const A = p(x + r, z), B = p(x + w - r, z), C = p(x + w, z + r), D = p(x + w, z + dp - r);
  const E = p(x + w - r, z + dp), F = p(x + r, z + dp), G = p(x, z + dp - r), H = p(x, z + r);
  const q = (c, b) => `Q${f(c[0])} ${f(c[1])} ${f(b[0])} ${f(b[1])}`;
  return `M${f(A[0])} ${f(A[1])} L${f(B[0])} ${f(B[1])} ${q(p(x + w, z), C)} ` +
         `L${f(D[0])} ${f(D[1])} ${q(p(x + w, z + dp), E)} L${f(F[0])} ${f(F[1])} ` +
         `${q(p(x, z + dp), G)} L${f(H[0])} ${f(H[1])} ${q(p(x, z), A)} Z`;
}

/** A real keyboard rather than a grid of identical squares.
 *
 *  Rows are given as key widths in units — 1u is one letter key, so Tab is 1.5,
 *  Caps 1.75, the right Shift 2.75, the spacebar 6.25. A negative number is a
 *  gap, and that single convention is what produces the function-row breaks, the
 *  offset navigation block and the inverted-T arrow cluster. Those three things
 *  are most of what makes a board read as a board. */
export function keyMap(x, y, z, rows, u = 19, pitch = 19, bevel = 1.6) {
  const out = [];
  rows.forEach((row, r) => {
    const rz = z + r * pitch;
    let cx = x;
    for (const w of row) {
      if (w < 0) { cx += -w * u; continue; }
      out.push(rrectXZ(cx + bevel, y, rz + bevel, w * u - bevel * 2, pitch - bevel * 2, 2.2));
      cx += w * u;
    }
  });
  return out;
}

/** A cable run. Bows perpendicular to its own direction across the desk plane,
 *  because a cable never takes the straight line between two points. */
export function cable(a, b, bow = 0.3, cls = 'vis') {
  return noProbe(() => cablePath(a, b, bow, cls));
}
function cablePath(a, b, bow, cls) {
  const A = P(...a), B = P(...b);
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const px = -dz * bow, pz = dx * bow;
  const C1 = P(a[0] + dx * 0.3 + px, a[1] + dy * 0.3, a[2] + dz * 0.3 + pz);
  const C2 = P(a[0] + dx * 0.7 + px, a[1] + dy * 0.7, a[2] + dz * 0.7 + pz);
  return `<path class="${cls}" fill="none" d="M${f(A[0])} ${f(A[1])} ` +
         `C${f(C1[0])} ${f(C1[1])} ${f(C2[0])} ${f(C2[1])} ${f(B[0])} ${f(B[1])}"/>`;
}

/* --- parametric surfaces -------------------------------------------------- */

let clipN = 0;

/** Quad wireframe over a parametric surface.
 *
 *  `fn(u, v)` returns a world [x, y, z] for u and v in 0..1; the result is that
 *  surface's u- and v-isolines. This is the single largest difference between a
 *  drawing that reads as a solid object and one that reads as an outline — a
 *  head, a chair back or a mouse shell described only by its silhouette looks
 *  flat no matter how many other details it carries.
 *
 *  Cost is nu + nv paths rather than nu x nv, because each isoline is one
 *  polyline. Pass `clip` (a path `d`) to hold the mesh inside a silhouette,
 *  which is what lets a solid occluding fill sit underneath it. */
export function mesh(fn, nu = 10, nv = 8, o = {}) {
  const res = o.res || 30;
  const lines = [];
  for (let i = 0; i <= nu; i++) {
    const u = i / nu;
    lines.push(poly(Array.from({ length: res + 1 }, (_, j) => P(...fn(u, j / res))), false));
  }
  for (let j = 0; j <= nv; j++) {
    const v = j / nv;
    lines.push(poly(Array.from({ length: res + 1 }, (_, i) => P(...fn(i / res, v))), false));
  }
  const paths = lines.map(d => `<path d="${d}"/>`).join('');
  if (!o.clip) return `<g class="${o.cls || 'con'}">${paths}</g>`;
  const id = `mclip${++clipN}`;
  return `<defs><clipPath id="${id}"><path d="${o.clip}"/></clipPath></defs>
    <g class="${o.cls || 'con'}" clip-path="url(#${id})">${paths}</g>`;
}

/** A lofted body of revolution-ish surface from an explicit profile of
 *  [t, halfWidth, halfDepth] rows. A profile is far easier to reason about — and
 *  to adjust by eye — than any formula that happens to fit a torso. */
export function loft(cx, cz, y0, y1, prof, e = 2) {
  return (u, v) => {
    let i = 0;
    while (i < prof.length - 2 && prof[i + 1][0] < v) i++;
    const [t0, w0, d0] = prof[i], [t1, w1, d1] = prof[i + 1];
    const k = t1 === t0 ? 0 : (v - t0) / (t1 - t0);
    const hw = w0 + (w1 - w0) * k, hd = d0 + (d1 - d0) * k;
    const a = u * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    /* e = 2 is an ellipse; higher exponents square the section off, which is how
       a torso reads flatter across the back than a body of revolution can. */
    const sx = Math.sign(ca) * Math.pow(Math.abs(ca), 2 / e);
    const sz = Math.sign(sa) * Math.pow(Math.abs(sa), 2 / e);
    return [cx + hw * sx, y0 + (y1 - y0) * v, cz + hd * sz];
  };
}

/** Every projected point of a surface — the raw material for a silhouette. */
export const surfacePts = (fn, nu = 44, nv = 26) => {
  const out = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j <= nv; j++) out.push(P(...fn(i / nu, j / nv)));
  return out;
};

/** Convex hull of projected points, which for a convex body IS its silhouette.
 *  Solving it numerically beats deriving the outline of each surface by hand,
 *  and it is what the occluding fill and the heavy outline are drawn from. */
export function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const chain = src => {
    const h = [];
    for (const q of src) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop();
      h.push(q);
    }
    return h;
  };
  const lower = chain(p), upper = chain(p.slice().reverse());
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** Outline of an open panel surface — round its four parametric edges. */
export function panelSil(fn, n = 30) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(P(...fn(i / n, 0)));
  for (let i = 1; i <= n; i++) pts.push(P(...fn(1, i / n)));
  for (let i = 1; i <= n; i++) pts.push(P(...fn(1 - i / n, 1)));
  for (let i = 1; i < n; i++) pts.push(P(...fn(0, 1 - i / n)));
  return poly(pts);
}

/* --- screen content ------------------------------------------------------- */

/* Rows in the control table. The paper pile carries the same count, because in
   shot 4 the loose workpapers resolve into this table and a path morph needs
   both variants built on matching geometry. */
export const CTRL_ROWS = 6;

/* The controls dashboard: KPI cards, a coverage trend, and the control table
   itself — ID / control / owner / tick. This is what she actually does, and it
   is the thing the workpapers become. An earlier version was an abstract 7x5
   grid, which read as a spreadsheet-shaped nothing. */
const dashboard = (x, y, z, w, h) => {
  const R = (a, b, ww, hh) => poly([P(x + a, y + b, z), P(x + a + ww, y + b, z),
                                    P(x + a + ww, y + b + hh, z), P(x + a, y + b + hh, z)]);
  const L = (a, b, a2, b2) => line2(P(x + a, y + b, z), P(x + a2, y + b2, z));
  const vis = [], con = [], col = [];

  /* window chrome: app title left, view tabs right */
  const hy = h - 24;
  vis.push(L(0, hy, w, hy));
  con.push(L(9, hy + 11, w * 0.26, hy + 11));
  for (let i = 0; i < 3; i++) con.push(R(w - 150 + i * 48, hy + 6, 36, 12));

  /* three KPI cards — a figure over a label */
  const uy = h * 0.58, uh = h * 0.28, cw = (w * 0.50 - 16) / 3;
  for (let i = 0; i < 3; i++) {
    const a = i * (cw + 8);
    vis.push(R(a, uy, cw, uh));
    con.push(L(a + 8, uy + uh - 14, a + cw * 0.46, uy + uh - 14));
    vis.push(L(a + 8, uy + uh * 0.34, a + cw * 0.66, uy + uh * 0.34));
  }

  /* coverage trend, right of the cards: axes, bars, and a mean line */
  const bx = w * 0.54, bw = w - bx, BARS = [0.40, 0.63, 0.52, 0.81, 0.69, 0.93, 0.60];
  con.push(L(bx, uy, bx + bw, uy));
  con.push(L(bx, uy, bx, uy + uh));
  const step = (bw - 8) / BARS.length;
  BARS.forEach((v, i) => {
    const a = bx + 5 + i * step, bar = R(a, uy + 1, step * 0.58, (uh - 8) * v);
    col.push(bar); vis.push(bar);
  });
  con.push(L(bx, uy + (uh - 8) * 0.66, bx + bw, uy + (uh - 8) * 0.66));

  /* the control table */
  const ty = h * 0.05, th = h * 0.46, rh = th / CTRL_ROWS;
  const cols = [w * 0.13, w * 0.63, w * 0.85];
  vis.push(L(0, ty + th, w, ty + th));                       // header rule
  for (let r = 1; r < CTRL_ROWS; r++) con.push(L(0, ty + r * rh, w, ty + r * rh));
  for (const c of cols) con.push(L(c, ty, c, ty + th));
  /* one finding highlighted, and a tick or a cross against each control */
  col.push(R(0, ty + rh * 2, w, rh));
  for (let r = 0; r < CTRL_ROWS; r++) {
    const b = ty + r * rh + rh * 0.3;
    con.push(L(8, b, w * 0.11, b));                          // the id
    con.push(L(w * 0.15, b, w * 0.15 + w * 0.40, b));        // the control name
    con.push(L(w * 0.65, b, w * 0.65 + w * 0.12, b));        // the owner
    if (r === 2) {                                            // the exception
      con.push(L(w * 0.88, b - rh * 0.14, w * 0.94, b + rh * 0.16));
      con.push(L(w * 0.94, b - rh * 0.14, w * 0.88, b + rh * 0.16));
    } else {
      con.push(L(w * 0.88, b, w * 0.90, b - rh * 0.16));
      con.push(L(w * 0.90, b - rh * 0.16, w * 0.95, b + rh * 0.2));
    }
  }

  return `${col.map(d => `<path class="col" style="--c:#3d6f92" d="${d}"/>`).join('')}
    ${vis.map(d => `<path class="vis" d="${d}"/>`).join('')}
    <g class="con">${con.map(d => `<path d="${d}"/>`).join('')}</g>`;
};

/* stacked cards — the projects on the laptop in shot 5 */
const cards = (x, y, z, w, h) => {
  const out = [];
  for (let i = 0; i < 3; i++) {
    const cy = y + h - (i + 1) * (h / 3.4) + h * 0.04;
    out.push(`<path class="vis" d="${poly([P(x + w * .08, cy, z), P(x + w * .92, cy, z), P(x + w * .92, cy + h * .21, z), P(x + w * .08, cy + h * .21, z)])}"/>`);
    out.push(`<path class="con" d="${line2(P(x + w * .14, cy + h * .12, z), P(x + w * .55, cy + h * .12, z))}"/>`);
  }
  return out.join('');
};

/* =========================================================================
   PROPS — each returns SVG, positioned in world space
   ========================================================================= */

const PENS = ['#c0563f', '#2f6f8f', '#4f7d4a', '#141c22'];
const PAN_COLS = ['#b8452f', '#d9822a', '#e0c341', '#4f7d4a', '#2f6f8f', '#5b4a8a',
                  '#8a3f5a', '#c25a33', '#6f8f3f', '#356f74', '#3b4f8a', '#6a5140'];

export const PROPS = [

  /* ---- wall (furthest back, drawn first) --------------------------------- */
  { id: 'whiteboard', cl: 'risk', z: 739, art: () => {
      const x = 900, y = 372, w = 880, h = 340, Z = 739;
      const bd = [P(x, y, Z), P(x + w, y, Z), P(x + w, y + h, Z), P(x, y + h, Z)];
      /* what it's actually used for: a client digital-landscape map, and loose
         idea scribbles. The map's connectors are what become the ridgeline. */
      const nodes = [[40, 232], [200, 232], [360, 232], [120, 120], [280, 120], [440, 120]];
      const nb = nodes.map(([nx, ny]) =>
        `<path class="colstroke vis" d="${poly([P(x + nx, y + ny, Z), P(x + nx + 108, y + ny, Z), P(x + nx + 108, y + ny + 56, Z), P(x + nx, y + ny + 56, Z)])}"/>`).join('');
      const link = [[148, 260, 200, 260], [308, 260, 360, 260], [94, 232, 174, 176], [254, 232, 334, 176], [414, 232, 494, 176], [228, 148, 280, 148], [388, 148, 440, 148]]
        .map(([ax, ay, bx, by]) => `<path class="colstroke con" d="${line2(P(x + ax, y + ay, Z), P(x + bx, y + by, Z))}"/>`).join('');
      const scrib = [`M${f(P(x + 600, y + 250, Z)[0])} ${f(P(x + 600, y + 250, Z)[1])} c 40 -26 78 22 118 4 s 74 -30 108 -8`,
                     `M${f(P(x + 604, y + 190, Z)[0])} ${f(P(x + 604, y + 190, Z)[1])} c 52 34 104 -22 158 6`,
                     `M${f(P(x + 610, y + 120, Z)[0])} ${f(P(x + 610, y + 120, Z)[1])} c 44 -24 92 14 132 -4`]
        .map(p => `<path class="colstroke con" d="${p}"/>`).join('');
      return `<path class="solid" d="${poly(bd)}"/><path class="ol" d="${poly(bd)}"/>
              <g style="--c:#2f6f8f">${nb}${link}${scrib}</g>
              <path class="con" d="${line2(P(x + 40, y + 40, Z), P(x + w - 40, y + 40, Z))}"/>`;
    } },

  { id: 'photo', cl: 'travel', z: 738, art: () => {
      const x = 250, y = 452, w = 250, h = 200, Z = 738;
      const b = [P(x, y, Z), P(x + w, y, Z), P(x + w, y + h, Z), P(x, y + h, Z)];
      const ridge = [P(x + 16, y + 62, Z), P(x + 74, y + 132, Z), P(x + 116, y + 92, Z), P(x + 168, y + 154, Z), P(x + 234, y + 74, Z)];
      return `<path class="solid" d="${poly(b)}"/><path class="ol" d="${poly(b)}"/>
              <path class="col" style="--c:#8fa9b8" d="${poly(b)}"/>
              <path class="vis" d="${poly(ridge, false)}"/>`;
    } },

  { id: 'stickies-wall', cl: 'risk', z: 737, art: () => {
      const S = [[560, 620, '#e8c24a'], [676, 556, '#d98f6a'], [548, 500, '#7fa8b8']];
      return S.map(([x, y, c]) => {
        const b = [P(x, y, 737), P(x + 66, y, 737), P(x + 66, y + 66, 737), P(x, y + 66, 737)];
        return `<path class="solid" d="${poly(b)}"/><path class="col vis" style="--c:${c}" d="${poly(b)}"/>`;
      }).join('');
    } },

  /* ---- back of the desk -------------------------------------------------- */
  { id: 'plant', cl: 'general', z: 600, art: () => {
      const cx = 1900, cz = 620;
      /* a leaf drawn as a closed blade with a midrib, not a single stroke —
         one curve reads as a wire, two plus a rib reads as a leaf */
      const leaf = (a, len, sp, w) => {
        const base = [cx, 96, cz], tip = [cx + Math.cos(a) * len, 96 + Math.sin(a) * len, cz];
        const mx = (base[0] + tip[0]) / 2, my = (base[1] + tip[1]) / 2;
        const A = P(...base), T = P(...tip);
        const C1 = P(mx - w + sp, my + 10, cz), C2 = P(mx + w + sp, my - 10, cz);
        return `<path class="solid" d="M${f(A[0])} ${f(A[1])} Q${f(C1[0])} ${f(C1[1])} ${f(T[0])} ${f(T[1])} Q${f(C2[0])} ${f(C2[1])} ${f(A[0])} ${f(A[1])} Z"/>
          <path class="vis" d="M${f(A[0])} ${f(A[1])} Q${f(C1[0])} ${f(C1[1])} ${f(T[0])} ${f(T[1])} Q${f(C2[0])} ${f(C2[1])} ${f(A[0])} ${f(A[1])} Z"/>
          <path class="con" d="M${f(A[0])} ${f(A[1])} Q${f((C1[0] + C2[0]) / 2)} ${f((C1[1] + C2[1]) / 2)} ${f(T[0])} ${f(T[1])}"/>`;
      };
      return `${cyl(cx, cz, 84, 30, 0, { nohidden: true })}
        ${cyl(cx, cz, 74, 76, 30, { inner: 9 })}
        ${centre(cx, cz, -30, 340)}
        <path class="con" d="${poly(ringXZ(cx, 96, cz, 74))}"/>
        <path class="col" style="--c:#5a4632" d="${poly(ringXZ(cx, 92, cz, 63))}"/>
        <g style="--c:#6f9160">${leaf(1.92, 210, 24, 34)}${leaf(1.46, 250, -8, 40)}${leaf(1.08, 195, -30, 32)}${leaf(2.36, 168, 28, 30)}${leaf(1.70, 140, 6, 26)}</g>`;
    } },

  { id: 'lamp', cl: 'general', z: 560, art: () => {
      const cx = 100, cz = 600;
      /* articulated arm: two links, three pivots, a tension spring on the
         lower link — the things that make a task lamp read as a mechanism */
      /* the arm reaches forward as well as up, so the shade ends up over the
         sketchpad — which is what a task lamp is actually pointed at */
      const SZ = cz - 120;
      const j0 = [cx, 34, cz], j1 = [cx + 26, 300, cz], j2 = [cx + 190, 404, SZ];
      const link = (a, b, w) => {
        const A = P(...a), B = P(...b), dx = B[0] - A[0], dy = B[1] - A[1], m = Math.hypot(dx, dy);
        const nx = -dy / m * w, ny = dx / m * w;
        return poly([[A[0] + nx, A[1] + ny], [B[0] + nx, B[1] + ny], [B[0] - nx, B[1] - ny], [A[0] - nx, A[1] - ny]]);
      };
      const spring = () => {
        const A = P(cx + 4, 70, cz), B = P(cx + 22, 268, cz), n = 11, out = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n, px = A[0] + (B[0] - A[0]) * t + (i % 2 ? 11 : -11);
          out.push([px, A[1] + (B[1] - A[1]) * t]);
        }
        return poly(out, false);
      };
      const shade = [P(cx + 178, 420, SZ), P(cx + 300, 420, SZ), P(cx + 272, 336, SZ), P(cx + 214, 336, SZ)];
      return `${cyl(cx, cz, 78, 22, 0, { nohidden: true })}
        ${centre(cx, cz, -30, 60)}
        ${vents(cx - 60, 22, cz - 40, 120, 80, 3)}
        <path class="solid" d="${link(j0, j1, 9)}"/><path class="ol" d="${link(j0, j1, 9)}"/>
        <path class="solid" d="${link(j1, j2, 8)}"/><path class="ol" d="${link(j1, j2, 8)}"/>
        <path class="con" d="${spring()}"/>
        ${screw(...j0, 11)}${screw(...j1, 10)}${screw(...j2, 9)}
        <path class="solid" d="${poly(shade)}"/><path class="ol" d="${poly(shade)}"/>
        <path class="vis" d="${line2(P(cx + 186, 404, SZ), P(cx + 292, 404, SZ))}"/>
        <path class="col" style="--c:#e8c24a" d="${poly([shade[3], shade[2], P(cx + 272, 332, SZ), P(cx + 214, 332, SZ)])}"/>
        ${cable([cx, 12, cz], [cx + 80, 4, cz + 100], 0.35, 'hid')}`;
    } },

  { id: 'speaker', cl: 'general', z: 600, art: () => {
      const x = 420, Z = 600, cx = x + 65;
      return `
      ${box(x, 0, Z, 130, 150, 110)}
      <path class="vis" d="${poly(circle2(P(cx, 92, Z), 44))}"/>
      <path class="vis" d="${poly(circle2(P(cx, 92, Z), 36))}"/>
      <path class="con" d="${poly(circle2(P(cx, 92, Z), 15))}"/>
      ${grille(cx, 92, Z, 40, 2)}
      ${screw(x + 12, 140, Z, 5)}${screw(x + 118, 140, Z, 5)}${screw(x + 12, 14, Z, 5)}${screw(x + 118, 14, Z, 5)}
      <path class="vis" d="${poly(circle2(P(cx, 26, Z), 13))}"/>
      <path class="cen" d="${line2(P(cx, 26, Z), P(cx, 40, Z))}"/>
      <path class="con" d="${poly(circle2(P(cx, 92, Z), 44), false)}"/>`;
    } },

  { id: 'monitor', cl: 'risk', z: 560, art: () => {
      const X = 600, Y = 146, Z = 560, W = 560, H = 340, D = 26;
      return `
      ${centre(880, 560, -40, 640)}
      <!-- base: cable channel, rubber feet, tilt scale. Sits at z 560 so the
           whole mid band in front of it is free for the paper pile. -->
      ${box(760, 0, 560, 240, 16, 150)}
      ${vents(770, 16, 568, 220, 130, 4)}
      ${screw(790, 8, 560)}${screw(970, 8, 560)}
      <!-- stand column with the hinge slot and height scale -->
      ${box(846, 16, 620, 68, 130, 40)}
      <path class="con" d="${line2(P(852, 60, 620), P(908, 60, 620))}"/>
      <path class="con" d="${line2(P(852, 90, 620), P(908, 90, 620))}"/>
      <path class="hid" d="${poly([P(864, 118, 620), P(896, 118, 620), P(896, 146, 620), P(864, 146, 620)])}"/>
      <!-- panel: bezel, chin, screen -->
      ${box(X, Y, Z, W, H, D)}
      <path class="vis" d="${rrectXY(X + 22, Y + 46, Z, W - 44, H - 76, 6)}"/>
      <path class="col vis" style="--c:#3d6f92" d="${rrectXY(X + 26, Y + 50, Z, W - 52, H - 84, 4)}"/>
      ${dashboard(X + 26, Y + 50, Z, W - 52, H - 84)}
      <!-- chin: power LED and its centre mark, brand rule -->
      <path class="con" d="${line2(P(X + 240, Y + 22, Z), P(X + 320, Y + 22, Z))}"/>
      ${screw(X + W - 40, Y + 22, Z, 5)}
      <!-- rear vents and the cable leaving the back -->
      ${vents(X + 40, Y + H, Z, W - 80, D, 5)}
      ${cable([880, Y, Z + D], [1040, 4, Z + 110], 0.3)}`;
    } },

  { id: 'stickies-bezel', cl: 'risk', z: 558, on: 'monitor', art: () => {
      const S = [[566, 396, '#e8c24a'], [560, 300, '#d98f6a']];
      return S.map(([x, y, c]) => {
        const b = [P(x, y, 558), P(x + 58, y, 558), P(x + 58, y + 58, 558), P(x, y + 58, 558)];
        return `<path class="solid" d="${poly(b)}"/><path class="col vis" style="--c:${c}" d="${poly(b)}"/>`;
      }).join('');
    } },

  { id: 'riser', cl: 'work', z: 480, art: () => box(1300, 0, 480, 420, 88, 220) },

  { id: 'laptop', cl: 'work', z: 520, on: 'riser', art: () => {
      /* deck sits on the riser (1300, z 480, 420 x 220); screen hinges at its
         back edge, keys behind the trackpad — which is the way round a laptop
         actually is, and was previously reversed. */
      const DX = 1316, DZ = 480, DW = 388, DD = 220;
      const X = DX + 14, Y = 88, Z = DZ + 210, W = 360, H = 232;
      const keys = [];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++)
        keys.push(`<path d="${poly([P(X + 16 + c * 27, 84, DZ + 100 + r * 26), P(X + 38 + c * 27, 84, DZ + 100 + r * 26), P(X + 38 + c * 27, 84, DZ + 120 + r * 26), P(X + 16 + c * 27, 84, DZ + 120 + r * 26)])}"/>`);
      return `
      ${panel(X, Y, Z, W, H, 12, { content: cards })}
      <path class="con" d="${poly(circle2(P(X + W / 2, Y + H - 12, Z), 5))}"/>
      ${sheet(DX, 74, DZ, DW, DD, 10)}
      <g class="con">${keys.join('')}</g>
      <path class="vis" d="${poly([P(X + 110, 84, DZ + 15), P(X + 250, 84, DZ + 15), P(X + 250, 84, DZ + 85), P(X + 110, 84, DZ + 85)])}"/>
      <path class="vis" d="${poly([P(X - 8, 30, Z - 6), P(X + W + 8, 30, Z - 6), P(X + W + 8, 54, Z - 6), P(X - 8, 54, Z - 6)])}"/>
      ${screw(X - 2, 42, Z - 6, 6)}${screw(X + W + 2, 42, Z - 6, 6)}
      <path class="hid" d="${line2(P(DX, 74, DZ + 92), P(DX + DW, 74, DZ + 92))}"/>`;
    } },

  { id: 'pens', cl: 'design', z: 470, art: () => {
      const cx = 130, cz = 420;
      const pens = PENS.map((c, i) =>
        `<path class="col vis" style="--c:${c}" d="${poly([P(cx - 30 + i * 18, 96, cz - 6 + i * 5), P(cx - 22 + i * 18, 96, cz - 6 + i * 5), P(cx - 22 + i * 18, 190 + i * 14, cz - 6 + i * 5), P(cx - 30 + i * 18, 190 + i * 14, cz - 6 + i * 5)])}"/>`).join('');
      return `${pens}${cyl(cx, cz, 46, 104, 0, { inner: 7 })}`;
    } },

  /* ---- middle of the desk ------------------------------------------------ */
  { id: 'headphones', cl: 'general', z: 420, art: () => {
      const cx = 1254, cz = 424;
      return `${sheet(1190, 0, 380, 128, 88, 6, { light: true })}
        <path class="ol" fill="none" d="M${f(P(cx - 62, 10, cz)[0])} ${f(P(cx - 62, 10, cz)[1])} C${f(P(cx - 62, 132, cz)[0])} ${f(P(cx - 62, 132, cz)[1])} ${f(P(cx + 62, 132, cz)[0])} ${f(P(cx + 62, 132, cz)[1])} ${f(P(cx + 62, 10, cz)[0])} ${f(P(cx + 62, 10, cz)[1])}"/>
        <path class="vis" d="${poly(circle2(P(cx - 62, 30, cz), 26))}"/>
        <path class="vis" d="${poly(circle2(P(cx + 62, 30, cz), 26))}"/>`;
    } },

  { id: 'papers', cl: 'risk', z: 372, art: () => {
      /* three sheets, each a few degrees off — used often, not messy */
      const s = [[650, 345, 0], [666, 357, 6], [658, 351, -5]];
      return s.map(([x, z, r], i) => {
        const w = 290, dp = 190, rad = r * Math.PI / 180, y = 2 + i * 2.6;
        const c = [x + w / 2, z + dp / 2];
        const rot = (px, pz) => { const dx = px - c[0], dz = pz - c[1]; return [c[0] + dx * Math.cos(rad) - dz * Math.sin(rad), c[1] + dx * Math.sin(rad) + dz * Math.cos(rad)]; };
        const q = [[x, z], [x + w, z], [x + w, z + dp], [x, z + dp]].map(([px, pz]) => { const [rx, rz] = rot(px, pz); return P(rx, y, rz); });
        if (i !== 2) return `<path class="solid" d="${poly(q)}"/><path class="vis" d="${poly(q)}"/>`;
        /* top sheet carries the actual workpaper: a ruled control table with a
           header rule, a tick column and a highlighted finding row */
        const at = (u, v) => { const [px, pz] = rot(x + w * u, z + dp * v); return P(px, y, pz); };
        const rows = [0.22, 0.34, 0.46, 0.58, 0.70, 0.82];
        const grid = rows.map(t => `<path d="${line2(at(0.07, t), at(0.93, t))}"/>`).join('')
          + [0.20, 0.33].map(u => `<path d="${line2(at(u, 0.14), at(u, 0.90))}"/>`).join('');
        const ticks = rows.slice(0, 5).map((t, k) =>
          `<path d="${line2(at(0.10, t + 0.04), at(0.13, t + 0.07))}"/><path d="${line2(at(0.13, t + 0.07), at(0.18, t - 0.02))}"/>`).join('');
        return `<path class="solid" d="${poly(q)}"/><path class="ol" d="${poly(q)}"/>
          <path class="vis" d="${line2(at(0.07, 0.14), at(0.93, 0.14))}"/>
          <g class="con">${grid}${ticks}</g>
          <path class="col" style="--c:#e8c24a" d="${poly([at(0.07, 0.58), at(0.93, 0.58), at(0.93, 0.70), at(0.07, 0.70)])}"/>`;
      }).join('');
    } },

  { id: 'mug', cl: 'general', z: 420, art: () => {
      const cx = 1020, cz = 420, r = 46;
      const hx = cx + r, ho = cx + r + 74;          // handle springs off the right side
      return `
      ${centre(cx, cz, -26, 150)}
      ${cyl(cx, cz, r, 96, 0, { inner: 7, fill: '#4a2f1e' })}
      <path class="ol" fill="none" d="M${f(P(hx, 68, cz)[0])} ${f(P(hx, 68, cz)[1])} C${f(P(ho, 76, cz)[0])} ${f(P(ho, 76, cz)[1])} ${f(P(ho, 22, cz)[0])} ${f(P(ho, 22, cz)[1])} ${f(P(hx, 28, cz)[0])} ${f(P(hx, 28, cz)[1])}"/>`;
    } },

  { id: 'ipad', cl: 'design', z: 460, art: () => `
      ${panel(1760, 46, 460, 250, 180, 10, { content: (x, y, z, w, h) => `<path class="con" d="${line2(P(x + w * .1, y + h * .5, z), P(x + w * .9, y + h * .5, z))}"/><path class="con" d="${line2(P(x + w * .1, y + h * .72, z), P(x + w * .62, y + h * .72, z))}"/>` })}
      <path class="vis" fill="none" d="${line2(P(1885, 46, 460), P(1885, 0, 488))}"/>
      <path class="vis" fill="none" d="${line2(P(1820, 46, 460), P(1820, 0, 488))}"/>` },

  { id: 'bottle', cl: 'general', z: 400, art: () => {
      const cx = 1880, cz = 400, r = 44;
      return `
      ${centre(cx, cz, -26, 330)}
      ${cyl(cx, cz, r, 190, 0)}
      <path class="con" d="${poly(ringXZ(cx, 26, cz, r), false)}"/>
      <path class="con" d="${poly(ringXZ(cx, 150, cz, r), false)}"/>
      ${cyl(cx, cz, 34, 24, 190, { nohidden: true })}
      ${cyl(cx, cz, 30, 40, 214, { nohidden: true })}
      ${knurl(cx, cz, 30, 216, 36, 30)}
      <path class="col" style="--c:#8fa9b8" d="${poly(ringXZ(cx, 188, cz, 40))}"/>
      <path class="hid" d="${line2(P(cx - r, 60, cz), P(cx + r, 60, cz))}"/>`;
    } },

  /* ---- front of the desk ------------------------------------------------- */
  { id: 'sketchpad', cl: 'design', z: 230, art: () => {
      const x = 200, z = 300, w = 400, dp = 260, y = 8;
      /* an actual wireframe sketched on the page: header bar, nav, a hero
         block, two cards and a footer — the thing she'd actually be drawing */
      const r = (a, b, c, d2) => poly([P(x + w * a, y, z + dp * b), P(x + w * c, y, z + dp * b),
                                        P(x + w * c, y, z + dp * d2), P(x + w * a, y, z + dp * d2)]);
      const wire = `<g class="con">
        <path d="${r(.10, .10, .90, .20)}"/>
        ${[.62, .70, .78, .86].map(t => `<path d="${line2(P(x + w * t, y, z + dp * .15), P(x + w * (t + .05), y, z + dp * .15))}"/>`).join('')}
        <path d="${r(.10, .26, .56, .50)}"/>
        <path d="${line2(P(x + w * .60, y, z + dp * .30), P(x + w * .90, y, z + dp * .30))}"/>
        <path d="${line2(P(x + w * .60, y, z + dp * .38), P(x + w * .82, y, z + dp * .38))}"/>
        <path d="${line2(P(x + w * .60, y, z + dp * .46), P(x + w * .88, y, z + dp * .46))}"/>
        <path d="${r(.10, .58, .46, .82)}"/>
        <path d="${r(.54, .58, .90, .82)}"/>
        <path d="${line2(P(x + w * .10, y, z + dp * .90), P(x + w * .90, y, z + dp * .90))}"/>
        <path d="${line2(P(x + w * .10, y, z + dp * .26), P(x + w * .56, y, z + dp * .50))}"/>
        <path d="${line2(P(x + w * .56, y, z + dp * .26), P(x + w * .10, y, z + dp * .50))}"/>
      </g>`;
      /* pencil lying across the corner of the pad */
      const pencil = poly([P(x + 260, 12, z + 210), P(x + 396, 12, z + 246), P(x + 394, 20, z + 250), P(x + 258, 20, z + 214)]);
      return `${sheet(x, 0, z, w, dp, 8, { col: '#5b86a8' })}${wire}
        <g class="con">${Array.from({ length: 8 }, (_, i) => `<path d="${poly(circle2(P(x - 10, 10, z + 20 + i * 32), 8))}"/>`).join('')}</g>
        <path class="hid" d="${line2(P(x, 0, z), P(x, 8, z))}"/>
        <path class="solid" d="${pencil}"/><path class="vis" d="${pencil}"/>
        <path class="col vis" style="--c:#c0563f" d="${poly([P(x + 384, 12, z + 244), P(x + 396, 12, z + 246), P(x + 394, 20, z + 250), P(x + 382, 20, z + 248)])}"/>`;
    } },

  { id: 'palette', cl: 'travel', z: 330, art: () => {
      const x = 1400, z = 330, W = 236, D = 104, Hb = 15;
      const pans = [];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
        const px = x + 12 + c * 36, pz = z + 10 + r * 44;
        pans.push(`<path class="vis col" style="--c:${PAN_COLS[r * 6 + c]}" d="${poly([P(px, Hb, pz), P(px + 30, Hb, pz), P(px + 30, Hb, pz + 36), P(px, Hb, pz + 36)])}"/>`);
      }
      const lid = [P(x, Hb, z + D), P(x + W, Hb, z + D), P(x + W, Hb + 92, z + D + 34), P(x, Hb + 92, z + D + 34)];
      return `<path class="solid" d="${poly(lid)}"/><path class="ol" d="${poly(lid)}"/>
        ${box(x, 0, z, W, Hb, D, { nohidden: true })}
        <path class="solid" d="${poly([P(x, Hb, z), P(x + W, Hb, z), P(x + W, Hb, z + D), P(x, Hb, z + D)])}"/>
        <path class="vis" d="${poly([P(x, Hb, z), P(x + W, Hb, z), P(x + W, Hb, z + D), P(x, Hb, z + D)])}"/>
        ${pans.join('')}`;
    } },

  { id: 'notebooks', cl: 'journey', z: 40, art: () => {
      /* three books: visible page block on the near edge, an elastic closure
         on the top one, and a dated spine label — the reason they read as a
         timeline in shot 3 */
      const cols = ['#b5764a', '#356f74', '#8a3f5a'];
      return cols.map((c, i) => {
        const x = 60 + i * 8, y = i * 26, z = 40 + i * 6, w = 300 - i * 12, dp = 210 - i * 8;
        const pages = `<g class="con">${[6, 11, 16].map(o =>
          `<path d="${line2(P(x + 4, y + o, z + dp), P(x + w - 4, y + o, z + dp))}"/>`).join('')}</g>`;
        const elastic = i === 2
          ? `<path class="vis" d="${line2(P(x + w * .74, y + 24, z), P(x + w * .74, y + 24, z + dp))}"/>
             <path class="vis" d="${line2(P(x + w * .74, y, z + dp / 2), P(x + w * .74, y + 24, z + dp / 2))}"/>` : '';
        const label = `<path class="con" d="${poly([P(x + 18, y + 24, z + 26), P(x + 118, y + 24, z + 26), P(x + 118, y + 24, z + 74), P(x + 18, y + 24, z + 74)])}"/>
          <path class="con" d="${line2(P(x + 28, y + 24, z + 50), P(x + 106, y + 24, z + 50))}"/>`;
        return `${sheet(x, y, z, w, dp, 24, { col: c })}${pages}${label}${elastic}`;
      }).join('');
    } },

  { id: 'keyboard', cl: 'risk', z: 190, art: () => {
      const x = 720, z = 190, u = 19, pitch = 19, y = 26;
      const KW = 18.5 * u, KD = 6 * pitch;          // 351.5 x 114 — a real tenkeyless
      const W = KW + 13, DP = KD + 15;
      /* ANSI tenkeyless. Negative entries are gaps, and they are what produce the
         function-row breaks, the offset navigation block and the arrow cluster. */
      const ROWS = [
        [1, -1, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, -0.5, 1, 1, 1],
        [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, -0.5, 1, 1, 1],
        [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
        [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, -1.5, 1],
        [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, -0.5, 1, 1, 1]
      ];
      const caps = keyMap(x + 6, y, z + 7, ROWS, u, pitch)
        .map(d => `<path d="${d}"/>`).join('');
      /* lock indicators, top right of the case */
      const leds = [0, 1, 2].map(i =>
        `<path d="${poly(circle2(P(x + W - 46 + i * 15, y, z + 5), 3.5), 10)}"/>`).join('');
      return `${box(x, 0, z, W, y, DP, { nohidden: true })}
        <path class="con" d="${rrectXZ(x + 4, y, z + 4, W - 8, DP - 8, 4)}"/>
        <g class="con">${caps}${leds}</g>
        <path class="hid" d="${line2(P(x + 20, 0, z + DP), P(x + 20, 8, z + DP))}"/>
        <path class="hid" d="${line2(P(x + W - 20, 0, z + DP), P(x + W - 20, 8, z + DP))}"/>
        ${cable([x + W - 24, 14, z + DP], [1000, 4, 556], 0.3)}`;
    } },

  { id: 'mouse', cl: 'general', z: 170, art: () => {
      const cx = 1320, cz = 260;
      return `${cyl(cx, cz, 46, 30, 0, { nohidden: true })}
        <path class="vis" d="${line2(P(cx, 30, cz - 46), P(cx, 30, cz + 46))}"/>`;
    } },

  /* 76 x 158 — a phone, not the tea tray it used to be */
  { id: 'phone', cl: 'general', z: 20, art: () => `
      ${sheet(1290, 0, 20, 76, 158, 12, { col: '#141c22' })}` },

  /* passes lying on the map is a real thing a desk does — declared, so the
     layout checker treats it as intent rather than an accident of draw order */
  { id: 'tickets', cl: 'travel', z: 100, on: 'map', art: () => {
      const t = [[1660, 100, 4], [1696, 122, -7], [1730, 110, 9]];
      return t.map(([x, z, r], i) => {
        const w = 250, dp = 110, rad = r * Math.PI / 180, y = 2 + i * 2.4, c = [x + w / 2, z + dp / 2];
        const q = [[x, z], [x + w, z], [x + w, z + dp], [x, z + dp]].map(([px, pz]) => {
          const dx = px - c[0], dz = pz - c[1];
          return P(c[0] + dx * Math.cos(rad) - dz * Math.sin(rad), y, c[1] + dx * Math.sin(rad) + dz * Math.cos(rad));
        });
        /* boarding pass: perforated stub, barcode, detail rules */
        const at = (u, v) => {
          const px = x + w * u, pz = z + dp * v, dx = px - c[0], dz = pz - c[1];
          return P(c[0] + dx * Math.cos(rad) - dz * Math.sin(rad), y, c[1] + dx * Math.sin(rad) + dz * Math.cos(rad));
        };
        const bars = Array.from({ length: 11 }, (_, k) =>
          `<path d="${line2(at(0.70 + k * 0.021, 0.24), at(0.70 + k * 0.021, 0.76))}"/>`).join('');
        return `<path class="solid" d="${poly(q)}"/><path class="col vis" style="--c:#d8a24a" d="${poly(q)}"/>
          <path class="hid" d="${line2(at(0.64, 0.02), at(0.64, 0.98))}"/>
          <g class="con">${bars}
            <path d="${line2(at(0.06, 0.30), at(0.40, 0.30))}"/>
            <path d="${line2(at(0.06, 0.50), at(0.54, 0.50))}"/>
            <path d="${line2(at(0.06, 0.70), at(0.32, 0.70))}"/>
          </g>`;
      }).join('');
    } },

  { id: 'map', cl: 'travel', z: 60, art: () => {
      const x = 1620, z = 60, w = 380, dp = 260, y = 4;
      const at = (u, v) => P(x + w * u, y, z + dp * v);
      const flat = [P(x, y, z), P(x + w * .62, y, z), P(x + w * .62, y, z + dp), P(x, y, z + dp)];
      const fold = [P(x + w * .62, y, z), P(x + w * .86, 74, z + 20), P(x + w * .86, 74, z + dp - 20), P(x + w * .62, y, z + dp)];
      /* contours: the lines that morph into the ridgeline in shot 7 */
      const contour = t => {
        const pts = Array.from({ length: 26 }, (_, i) => {
          const u = i / 25;
          return P(x + 24 + u * (w * .54), y + 1, z + 34 + dp * .62 * (0.5 + 0.34 * Math.sin(u * 5.4 + t * 1.7)) - t * 24);
        });
        return `<path class="colstroke con" d="${poly(pts, false)}"/>`;
      };
      /* fold creases — a map that has been opened is never flat */
      const creases = [0.33, 0.66].map(v => `<path class="hid" d="${line2(at(0.02, v), at(0.60, v))}"/>`).join('')
        + [0.21, 0.41].map(u => `<path class="hid" d="${line2(at(u, 0.03), at(u, 0.97))}"/>`).join('');
      /* route with waypoints, a compass rose and a scale bar */
      const route = poly([at(0.10, 0.82), at(0.22, 0.62), at(0.30, 0.66), at(0.42, 0.40), at(0.52, 0.24)], false);
      const pins = [[0.10, 0.82], [0.30, 0.66], [0.52, 0.24]].map(([u, v]) =>
        `<path class="col" style="--c:#c0563f" d="${poly(circle2(at(u, v), 7), 12)}"/>
         <path class="vis" d="${poly(circle2(at(u, v), 7), 12)}"/>`).join('');
      const rose = (() => {
        const c = at(0.50, 0.86), r = 26;
        return `<path class="vis" d="${poly(circle2(c, r))}"/>
          <path class="cen" d="${line2([c[0] - r * 1.5, c[1]], [c[0] + r * 1.5, c[1]])}"/>
          <path class="cen" d="${line2([c[0], c[1] - r * 1.5], [c[0], c[1] + r * 1.5])}"/>
          <path class="ol" d="${poly([[c[0], c[1] - r], [c[0] + r * .3, c[1]], [c[0], c[1] + r * .3], [c[0] - r * .3, c[1]]])}"/>`;
      })();
      const scaleBar = (() => {
        const a = at(0.06, 0.94), b = at(0.26, 0.94);
        const seg = [0, 1, 2, 3].map(i => {
          const t0 = i / 4, t1 = (i + 1) / 4;
          const p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0];
          const p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1];
          return `<path class="${i % 2 ? 'solid' : 'vis'}" d="${poly([p0, p1, [p1[0], p1[1] - 7], [p0[0], p0[1] - 7]])}"/>
                  <path class="vis" d="${poly([p0, p1, [p1[0], p1[1] - 7], [p0[0], p0[1] - 7]])}"/>`;
        }).join('');
        return seg;
      })();
      return `<path class="solid" d="${poly(flat)}"/><path class="ol col" style="--c:#5d8a58" d="${poly(flat)}"/>
        <g style="--c:#4f7d4a">${[0, 1, 2, 3].map(contour).join('')}</g>
        ${creases}
        <path class="colstroke vis" style="--c:#c0563f" d="${route}"/>${pins}
        ${rose}${scaleBar}
        <path class="solid" d="${poly(fold)}"/><path class="ol" d="${poly(fold)}"/>
        <path class="con" d="${line2(P(x + w * .74, 38, z + 20), P(x + w * .74, 38, z + dp - 20))}"/>`;
    } },

  { id: 'binoculars', cl: 'travel', z: 90, art: () => {
      const y = 62, L = 150, r = 40, rF = 46, cz = 90;
      const cxL = 1428, cxR = 1556, mid = (cxL + cxR) / 2;
      const barrel = cx => {
        const n0 = P(cx, y, cz), n1 = P(cx, y, cz + L);
        const dx = n1[0] - n0[0], dy = n1[1] - n0[1], m = Math.hypot(dx, dy);
        const px = -dy / m, py = dx / m;
        const band = [[n0[0] + px * r, n0[1] + py * r], [n1[0] + px * rF, n1[1] + py * rF],
                      [n1[0] - px * rF, n1[1] - py * rF], [n0[0] - px * r, n0[1] - py * r]];
        return `<path class="solid" d="${poly(circle2(n1, rF))}"/><path class="ol" d="${poly(circle2(n1, rF))}"/>
          <path class="solid" d="${poly(band)}"/><path class="ol" d="${poly(band, false)}"/>
          <path class="con" d="${poly(circle2(P(cx, y, cz + L * .4), r + (rF - r) * .4))}"/>
          <path class="solid" d="${poly(circle2(n0, r))}"/><path class="ol" d="${poly(circle2(n0, r))}"/>
          <path class="vis" d="${poly(circle2(n0, r - 10))}"/>
          <path class="col vis" style="--c:#2f4f5c" d="${poly(circle2(n0, r - 17))}"/>`;
      };
      /* hinge bridge, focus wheel on its axis, dioptre ring, strap lugs */
      const focus = (() => {
        const c = P(mid, y + 30, cz + 78), r = 26;
        return `<path class="solid" d="${poly(circle2(c, r))}"/><path class="vis" d="${poly(circle2(c, r))}"/>
          ${knurl(mid, cz + 78, 26, y + 12, 36, 22)}
          <path class="cen" d="${line2([c[0] - r * 1.7, c[1]], [c[0] + r * 1.7, c[1]])}"/>`;
      })();
      const lug = cx => `<path class="vis" d="${poly([P(cx - 8, y + 34, cz + 24), P(cx + 8, y + 34, cz + 24), P(cx + 8, y + 46, cz + 24), P(cx - 8, y + 46, cz + 24)])}"/>`;
      return `${box(mid - 31, y - 16, cz + 40, 62, 32, 62, { nohidden: true })}
        ${barrel(cxL)}${barrel(cxR)}
        ${focus}
        ${lug(cxL - 42)}${lug(cxR + 42)}
        <path class="con" d="${poly(circle2(P(cxR, y, cz + 6), 18))}"/>
        <path class="cen" d="${line2(P(cxL, y, cz - 40), P(cxL, y, cz + L + 30))}"/>
        <path class="cen" d="${line2(P(cxR, y, cz - 40), P(cxR, y, cz + L + 30))}"/>`;
    } }
];

/* --- chair and the seated figure, foreground ------------------------------ */
export const FOREGROUND = () => {
  /* Seated on the monitor's centre line, which is both where a person
     actually sits and what keeps her clear of the left-hand cluster that
     shot 3 zooms into. A seated head unavoidably overlaps the desk surface
     from this camera; the choice is only what it overlaps. */
  const z = -330, cx = 880;

  /* Every part of her is a meshed surface rather than an outline. A head or a
     pair of shoulders described only by a silhouette reads flat no matter how
     much detail sits around it, and that flatness was the single biggest gap
     between this drawing and the reference sheets. The quad wireframe is what
     makes a curved thing read as built.

     Her back is toward us, so -z is the near side throughout. */

  /* ---- hoodie -----------------------------------------------------------
     Half-widths are real: 450mm across the shoulders. The profile stays broad
     at the top rather than tapering, so the loft ends in a shoulder plateau —
     an earlier version closed to a point and the whole torso read as a vase.
     The squared-off section (e = 2.7) is what makes a back look like a back. */
  const TORSO = [[0, 196, 96], [0.35, 212, 104], [0.70, 224, 110], [1, 220, 102]];
  const torso = loft(cx, z, -250, 256, TORSO, 2.7);
  const torsoSil = poly(hull(surfacePts(torso)));

  /* arms, angling out and down from the shoulder — without them the silhouette
     has no idea where a person ends */
  const armFn = s => (u, v) => {
    const r = 78 - 26 * v, a = u * Math.PI * 2;
    return [cx + s * (192 + 62 * v) + r * Math.cos(a), 240 - 330 * v,
            z + 8 - 16 * v + r * 0.88 * Math.sin(a)];
  };
  const armSil = s => poly(hull(surfacePts(armFn(s))));

  /* ---- from behind you see hair, not skull, so the head IS the hair mass:
     a spheroid carrying more volume at the back of the crown, lumped just
     enough to read as hair rather than as a helmet --------------------- */
  const head = (u, v) => {
    const a = u * Math.PI * 2, p = v * Math.PI;
    const back = 1 + 0.17 * Math.max(0, -Math.sin(a));
    const r = 88 * (1 + 0.035 * Math.sin(6 * a) * Math.sin(2 * p));
    return [cx + r * 0.95 * Math.sin(p) * Math.cos(a),
            448 + r * 1.12 * Math.cos(p),
            z + r * back * Math.sin(p) * Math.sin(a)];
  };
  const headSil = poly(hull(surfacePts(head)));

  /* ---- the fluffy ponytail, gathered high at the back of the crown. The
     lumpiness is deterministic — a mass, not a billiard ball. */
  const pony = (u, v) => {
    const a = u * Math.PI * 2, p = v * Math.PI;
    const r = 74 * (1 + 0.16 * Math.sin(5 * a) * Math.sin(3 * p)
                      + 0.11 * Math.cos(7 * a + 1.2) * Math.sin(p));
    return [cx + r * 1.05 * Math.sin(p) * Math.cos(a),
            596 + r * 0.94 * Math.cos(p),
            z - 46 + r * 0.85 * Math.sin(p) * Math.sin(a)];
  };
  const ponySil = poly(hull(surfacePts(pony)));

  /* strands sweeping up into the gather — what says "tied" rather than "loose" */
  const strands = [-64, -30, 4, 38, 70].map(dx => {
    const A = P(cx + dx, 392, z - 20), B = P(cx + dx * 1.5, 470, z - 30), C = P(cx + dx * 0.5, 528, z - 44);
    return `<path d="M${f(A[0])} ${f(A[1])} Q${f(B[0])} ${f(B[1])} ${f(C[0])} ${f(C[1])}"/>`;
  }).join('');

  const neck = [P(cx - 46, 292, z), P(cx + 46, 292, z), P(cx + 40, 374, z), P(cx - 40, 374, z)];
  const hood = [P(cx - 104, 268, z - 30), P(cx - 62, 330, z - 40), P(cx + 62, 330, z - 40), P(cx + 104, 268, z - 30)];

  /* ---- task chair: a curved mesh back that wraps toward the viewer at its
     edges, on a frame, with armrests and the lumbar bar ------------------ */
  /* ---- task chair -------------------------------------------------------
     Real heights, measured from the desk top: a mid-back task chair tops out
     around 950mm off the floor, which against a 720mm desk puts its top edge
     at +230 — just under her shoulders, so she reads as sitting *in* it. The
     back wraps toward the viewer at its edges. */
  const CZ = z - 40;
  const back = (u, v) => {
    const s = u * 2 - 1;
    /* 400mm across, topping out at +170 — narrower than her 450mm shoulders and
       lower than their 256, so she reads as sitting in the chair rather than
       being hidden by it */
    const hw = 202 + 12 * Math.sin(Math.PI * v) - 24 * Math.pow(v, 4);
    return [cx + s * hw, -170 + 340 * v, CZ - 44 * s * s];
  };
  const backSil = panelSil(back);

  const chairArm = s => {
    const ax = cx + s * 262, pad = rrectXZ(ax - 32, -60, CZ - 180, 64, 186, 14);
    return `${box(ax - 13, -220, CZ - 60, 26, 162, 34, { nohidden: true })}
      <path class="solid" d="${pad}"/><path class="ol" d="${pad}"/>`;
  };

  const lumbar = [P(cx - 210, -140, CZ - 44), P(cx + 210, -140, CZ - 44),
                  P(cx + 210, -76, CZ - 44), P(cx - 210, -76, CZ - 44)];

  /* Draw order is depth order, and the chair is NEARER the camera than she is —
     she is sitting against it. So her body goes down first and the chair back
     paints over her lower torso, which is exactly what you see from behind a
     seated person. Reversed, the chair vanished behind her. */
  return `<g id="fg">
    ${centre(cx, z, 300, 700)}

    <path class="solid" d="${armSil(-1)}"/>
    ${mesh(armFn(-1), 8, 6, { clip: armSil(-1) })}
    <path class="ol" d="${armSil(-1)}"/>
    <path class="solid" d="${armSil(1)}"/>
    ${mesh(armFn(1), 8, 6, { clip: armSil(1) })}
    <path class="ol" d="${armSil(1)}"/>

    <path class="solid" d="${torsoSil}"/>
    ${mesh(torso, 12, 8, { clip: torsoSil })}
    <path class="ol" d="${torsoSil}"/>
    <path class="solid" d="${poly(hood)}"/><path class="vis" d="${poly(hood, false)}"/>
    <path class="solid" d="${poly(neck)}"/><path class="vis" d="${poly(neck)}"/>

    <path class="solid" d="${headSil}"/>
    ${mesh(head, 12, 9, { clip: headSil })}
    <path class="ol" d="${headSil}"/>
    <g class="con">${strands}</g>

    <path class="solid" d="${ponySil}"/>
    ${mesh(pony, 11, 8, { clip: ponySil })}
    <path class="ol" d="${ponySil}"/>

    ${chairArm(-1)}${chairArm(1)}
    <path class="solid" d="${backSil}"/>
    ${mesh(back, 9, 7, { clip: backSil })}
    <path class="ol" d="${backSil}"/>
    <path class="solid" d="${poly(lumbar)}"/><path class="vis" d="${poly(lumbar)}"/>
    ${screw(cx - 210, -108, CZ - 44, 9)}${screw(cx + 210, -108, CZ - 44, 9)}
    <path class="cen" d="${line2(P(cx, -200, CZ), P(cx, 260, CZ))}"/>
  </g>`;
};

/* --- room shell ----------------------------------------------------------- */
export const ROOM = () => {
  const { x1: DX, z1: DZ } = DESK;
  const wall = [P(-400, -200, 740), P(2600, -200, 740), P(2600, 900, 740), P(-400, 900, 740)];
  const top  = [P(0, 0, 0), P(DX, 0, 0), P(DX, 0, DZ), P(0, 0, DZ)];
  const front = [P(0, 0, 0), P(DX, 0, 0), P(DX, -60, 0), P(0, -60, 0)];
  return `
    <path id="wall" d="${poly(wall)}"/>
    <path class="con" d="${line2(P(-400, 0, 740), P(2600, 0, 740))}"/>
    <path class="solid" d="${poly(top)}"/><path class="ol" d="${poly(top)}"/>
    <path class="solid" d="${poly(front)}"/><path class="ol" d="${poly(front)}"/>
    <path class="hid" d="${line2(P(0, -60, 0), P(0, -560, 0))}"/>
    <path class="hid" d="${line2(P(2050, -60, 0), P(2050, -560, 0))}"/>`;
};

/* --- assemble ------------------------------------------------------------- */
export function buildScene() {
  /* Far to near, so nearer objects occlude what sits behind them. */
  const sorted = [...PROPS].sort((a, b) => b.z - a.z);

  /* Then honour `on:` — a prop resting on another is drawn straight after its
     host whatever its depth, because the host is precisely the thing that would
     otherwise paint over it. Boarding passes lie on the map at a greater z than
     the map itself, so depth order alone would bury them. Keeping this separate
     is what lets `z` stay an honest position instead of a draw-order fudge. */
  const ordered = [];
  const place = p => {
    if (ordered.includes(p)) return;
    ordered.push(p);
    for (const q of sorted) if (q.on === p.id) place(q);
  };
  for (const p of sorted) if (!p.on) place(p);
  for (const p of sorted) place(p);            // any prop whose host went missing
  const layers = {
    wall:  ordered.filter(p => p.z >= 700),
    back:  ordered.filter(p => p.z < 700 && p.z >= 400),
    front: ordered.filter(p => p.z < 400)
  };
  /* data-foot rides along on every group: the layout checker reads it, and the
     camera will use the same numbers to cull and to size annotation on zoom. */
  const g = list => list.map(p => {
    probeStart(p.id);
    const art = p.art();
    const b = probeEnd();
    const foot = b ? `${Math.round(b.x0)} ${Math.round(b.z0)} ${Math.round(b.x1)} ${Math.round(b.z1)} ${Math.round(b.y1)}` : '';
    return `<g class="obj" id="p-${p.id}" data-cl="${p.cl}" data-foot="${foot}">${art}</g>`;
  }).join('\n');

  return `<g id="L-room">${ROOM()}</g>
<g id="L-wall">${g(layers.wall)}</g>
<g id="L-back">${g(layers.back)}</g>
<g id="L-front">${g(layers.front)}</g>
<g id="L-fg">${FOREGROUND()}</g>`;
}

export const GRID_DEFS = `<defs>
  <pattern id="bp10" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M40 0 L0 0 0 40" fill="none" stroke="var(--bp-grid)" stroke-width="1"/>
  </pattern>
  <pattern id="bp50" width="200" height="200" patternUnits="userSpaceOnUse">
    <rect width="200" height="200" fill="url(#bp10)"/>
    <path d="M200 0 L0 0 0 200" fill="none" stroke="var(--bp-grid-b)" stroke-width="1.6"/>
  </pattern>
</defs>`;
