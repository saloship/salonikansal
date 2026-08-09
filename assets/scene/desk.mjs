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

export const P = (x, y, z) => [OX + (x + z * KZX) * SC, OY - (y + z * KZY) * SC];

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
export const centre = (x, z, y0, y1) => `<path class="cen" d="${line2(P(x, y0, z), P(x, y1, z))}"/>`;

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

/* --- screen content ------------------------------------------------------- */

/* the control matrix — this is what the loose sheets resolve into in shot 4 */
const matrix = (cols, rows, filled = []) => (x, y, z, w, h) => {
  const cw = w / cols, ch = h / rows, g = [];
  for (let c = 1; c < cols; c++) g.push(line2(P(x + c * cw, y, z), P(x + c * cw, y + h, z)));
  for (let r = 1; r < rows; r++) g.push(line2(P(x, y + r * ch, z), P(x + w, y + r * ch, z)));
  const cells = filled.map(([c, r]) =>
    `<path class="col" style="--c:#3d6f92" d="${poly([P(x + c * cw, y + r * ch, z), P(x + (c + 1) * cw, y + r * ch, z), P(x + (c + 1) * cw, y + (r + 1) * ch, z), P(x + c * cw, y + (r + 1) * ch, z)])}"/>`).join('');
  return cells + `<g class="con">${g.map(p => `<path d="${p}"/>`).join('')}</g>`;
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
      const cx = 1880, cz = 600;
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
      const cx = 150, cz = 560;
      /* articulated arm: two links, three pivots, a tension spring on the
         lower link — the things that make a task lamp read as a mechanism */
      const j0 = [cx, 34, cz], j1 = [cx + 26, 300, cz], j2 = [cx + 210, 404, cz];
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
      const shade = [P(cx + 178, 420, cz), P(cx + 300, 420, cz), P(cx + 272, 336, cz), P(cx + 214, 336, cz)];
      return `${cyl(cx, cz, 78, 22, 0, { nohidden: true })}
        ${centre(cx, cz, -30, 60)}
        ${vents(cx - 60, 22, cz - 40, 120, 80, 3)}
        <path class="solid" d="${link(j0, j1, 9)}"/><path class="ol" d="${link(j0, j1, 9)}"/>
        <path class="solid" d="${link(j1, j2, 8)}"/><path class="ol" d="${link(j1, j2, 8)}"/>
        <path class="con" d="${spring()}"/>
        ${screw(...j0, 11)}${screw(...j1, 10)}${screw(...j2, 9)}
        <path class="solid" d="${poly(shade)}"/><path class="ol" d="${poly(shade)}"/>
        <path class="vis" d="${line2(P(cx + 186, 404, cz), P(cx + 292, 404, cz))}"/>
        <path class="col" style="--c:#e8c24a" d="${poly([shade[3], shade[2], P(cx + 272, 332, cz), P(cx + 214, 332, cz)])}"/>
        <path class="hid" fill="none" d="M${f(P(cx, 12, cz)[0])} ${f(P(cx, 12, cz)[1])} C${f(P(cx - 90, 8, cz + 60)[0])} ${f(P(cx - 90, 8, cz + 60)[1])} ${f(P(cx - 40, 6, cz + 150)[0])} ${f(P(cx - 40, 6, cz + 150)[1])} ${f(P(cx + 60, 4, cz + 160)[0])} ${f(P(cx + 60, 4, cz + 160)[1])}"/>`;
    } },

  { id: 'speaker', cl: 'general', z: 596, art: () => `
      ${box(372, 0, 596, 130, 150, 110)}
      <path class="vis" d="${poly(circle2(P(437, 92, 596), 44))}"/>
      <path class="vis" d="${poly(circle2(P(437, 92, 596), 36))}"/>
      <path class="con" d="${poly(circle2(P(437, 92, 596), 15))}"/>
      ${grille(437, 92, 596, 40, 2)}
      ${screw(384, 140, 596, 5)}${screw(490, 140, 596, 5)}${screw(384, 14, 596, 5)}${screw(490, 14, 596, 5)}
      <path class="vis" d="${poly(circle2(P(437, 26, 596), 13))}"/>
      <path class="cen" d="${line2(P(437, 26, 596), P(437, 40, 596))}"/>
      <path class="con" d="${poly(circle2(P(437, 92, 596), 44), false)}"/>` },

  { id: 'monitor', cl: 'risk', z: 560, art: () => {
      const X = 600, Y = 146, Z = 560, W = 560, H = 340, D = 26;
      return `
      ${centre(880, 560, -40, 640)}
      <!-- base: cable channel, rubber feet, tilt scale -->
      ${box(760, 0, 520, 240, 16, 150)}
      ${vents(770, 16, 528, 220, 130, 4)}
      ${screw(790, 8, 520)}${screw(970, 8, 520)}
      <!-- stand column with the hinge slot and height scale -->
      ${box(846, 16, 580, 68, 130, 40)}
      <path class="con" d="${line2(P(852, 60, 580), P(908, 60, 580))}"/>
      <path class="con" d="${line2(P(852, 90, 580), P(908, 90, 580))}"/>
      <path class="hid" d="${poly([P(864, 118, 580), P(896, 118, 580), P(896, 146, 580), P(864, 146, 580)])}"/>
      <!-- panel: bezel, chin, screen -->
      ${box(X, Y, Z, W, H, D)}
      <path class="vis" d="${rrectXY(X + 22, Y + 46, Z, W - 44, H - 76, 6)}"/>
      <path class="col vis" style="--c:#3d6f92" d="${rrectXY(X + 26, Y + 50, Z, W - 52, H - 84, 4)}"/>
      ${matrix(7, 5, [[1, 1], [3, 2], [5, 0], [2, 4], [6, 3]])(X + 26, Y + 50, Z, W - 52, H - 84)}
      <!-- chin: power LED and its centre mark, brand rule -->
      <path class="con" d="${line2(P(X + 240, Y + 22, Z), P(X + 320, Y + 22, Z))}"/>
      ${screw(X + W - 40, Y + 22, Z, 5)}
      <!-- rear vents and the cable leaving the back -->
      ${vents(X + 40, Y + H, Z, W - 80, D, 5)}
      <path class="vis" fill="none" d="M${f(P(880, Y, Z + D)[0])} ${f(P(880, Y, Z + D)[1])} C${f(P(880, 60, Z + 120)[0])} ${f(P(880, 60, Z + 120)[1])} ${f(P(1010, 30, Z + 150)[0])} ${f(P(1010, 30, Z + 150)[1])} ${f(P(1040, 0, Z + 110)[0])} ${f(P(1040, 0, Z + 110)[1])}"/>`;
    } },

  { id: 'stickies-bezel', cl: 'risk', z: 558, art: () => {
      const S = [[566, 396, '#e8c24a'], [560, 300, '#d98f6a']];
      return S.map(([x, y, c]) => {
        const b = [P(x, y, 558), P(x + 58, y, 558), P(x + 58, y + 58, 558), P(x, y + 58, 558)];
        return `<path class="solid" d="${poly(b)}"/><path class="col vis" style="--c:${c}" d="${poly(b)}"/>`;
      }).join('');
    } },

  { id: 'riser', cl: 'work', z: 500, art: () => box(1260, 0, 500, 420, 88, 240) },

  { id: 'laptop', cl: 'work', z: 520, art: () => {
      const X = 1290, Y = 88, Z = 660, W = 360, H = 232;
      /* deck: keys, trackpad, hinge barrel, port cutouts on the left edge */
      const keys = [];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++)
        keys.push(`<path d="${poly([P(X + 16 + c * 27, 84, 520 + 24 + r * 26), P(X + 38 + c * 27, 84, 520 + 24 + r * 26), P(X + 38 + c * 27, 84, 520 + 44 + r * 26), P(X + 16 + c * 27, 84, 520 + 44 + r * 26)])}"/>`);
      return `
      ${panel(X, Y, Z, W, H, 12, { content: cards })}
      <path class="con" d="${poly(circle2(P(X + W / 2, Y + H - 12, Z), 5))}"/>
      ${sheet(1276, 74, 500, 388, 240, 10)}
      <g class="con">${keys.join('')}</g>
      <path class="vis" d="${poly([P(X + 110, 84, 520 + 140), P(X + 250, 84, 520 + 140), P(X + 250, 84, 520 + 220), P(X + 110, 84, 520 + 220)])}"/>
      <path class="vis" d="${poly([P(X - 8, 30, Z - 6), P(X + W + 8, 30, Z - 6), P(X + W + 8, 54, Z - 6), P(X - 8, 54, Z - 6)])}"/>
      ${screw(X - 2, 42, Z - 6, 6)}${screw(X + W + 2, 42, Z - 6, 6)}
      <path class="hid" d="${line2(P(1276, 74, 640), P(1664, 74, 640))}"/>`;
    } },

  { id: 'pens', cl: 'design', z: 470, art: () => {
      const cx = 262, cz = 470;
      const pens = PENS.map((c, i) =>
        `<path class="col vis" style="--c:${c}" d="${poly([P(cx - 30 + i * 18, 96, cz - 6 + i * 5), P(cx - 22 + i * 18, 96, cz - 6 + i * 5), P(cx - 22 + i * 18, 190 + i * 14, cz - 6 + i * 5), P(cx - 30 + i * 18, 190 + i * 14, cz - 6 + i * 5)])}"/>`).join('');
      return `${pens}${cyl(cx, cz, 46, 104, 0, { inner: 7 })}`;
    } },

  /* ---- middle of the desk ------------------------------------------------ */
  { id: 'headphones', cl: 'general', z: 420, art: () => {
      const cx = 1140, cz = 420;
      return `${sheet(1076, 0, 380, 128, 88, 6, { light: true })}
        <path class="ol" fill="none" d="M${f(P(cx - 62, 10, cz)[0])} ${f(P(cx - 62, 10, cz)[1])} C${f(P(cx - 62, 132, cz)[0])} ${f(P(cx - 62, 132, cz)[1])} ${f(P(cx + 62, 132, cz)[0])} ${f(P(cx + 62, 132, cz)[1])} ${f(P(cx + 62, 10, cz)[0])} ${f(P(cx + 62, 10, cz)[1])}"/>
        <path class="vis" d="${poly(circle2(P(cx - 62, 30, cz), 26))}"/>
        <path class="vis" d="${poly(circle2(P(cx + 62, 30, cz), 26))}"/>`;
    } },

  { id: 'papers', cl: 'risk', z: 372, art: () => {
      /* three sheets, each a few degrees off — used often, not messy */
      const s = [[430, 368, 0], [446, 380, 6], [438, 374, -5]];
      return s.map(([x, z, r], i) => {
        const w = 300, dp = 210, rad = r * Math.PI / 180, y = 2 + i * 2.6;
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

  { id: 'mug', cl: 'general', z: 330, art: () => `
      ${centre(760, 330, -26, 150)}
      ${cyl(760, 330, 46, 96, 0, { inner: 7, fill: '#4a2f1e' })}
      <path class="ol" fill="none" d="M${f(P(806, 68, 330)[0])} ${f(P(806, 68, 330)[1])} C${f(P(880, 76, 330)[0])} ${f(P(880, 76, 330)[1])} ${f(P(880, 22, 330)[0])} ${f(P(880, 22, 330)[1])} ${f(P(806, 28, 330)[0])} ${f(P(806, 28, 330)[1])}"/>` },

  { id: 'ipad', cl: 'design', z: 330, art: () => `
      ${panel(1430, 46, 330, 250, 180, 10, { content: (x, y, z, w, h) => `<path class="con" d="${line2(P(x + w * .1, y + h * .5, z), P(x + w * .9, y + h * .5, z))}"/><path class="con" d="${line2(P(x + w * .1, y + h * .72, z), P(x + w * .62, y + h * .72, z))}"/>` })}
      <path class="vis" fill="none" d="${line2(P(1555, 46, 330), P(1555, 0, 358))}"/>
      <path class="vis" fill="none" d="${line2(P(1490, 46, 330), P(1490, 0, 358))}"/>` },

  { id: 'bottle', cl: 'general', z: 300, art: () => `
      ${centre(1790, 300, -26, 330)}
      ${cyl(1790, 300, 44, 190, 0)}
      <path class="con" d="${poly(ringXZ(1790, 26, 300, 44), false)}"/>
      <path class="con" d="${poly(ringXZ(1790, 150, 300, 44), false)}"/>
      ${cyl(1790, 300, 34, 24, 190, { nohidden: true })}
      ${cyl(1790, 300, 30, 40, 214, { nohidden: true })}
      ${knurl(1790, 300, 30, 216, 36, 30)}
      <path class="col" style="--c:#8fa9b8" d="${poly(ringXZ(1790, 188, 300, 40))}"/>
      <path class="hid" d="${line2(P(1746, 60, 300), P(1834, 60, 300))}"/>` },

  /* ---- front of the desk ------------------------------------------------- */
  { id: 'sketchpad', cl: 'design', z: 230, art: () => {
      const x = 240, z = 230, w = 400, dp = 260, y = 8;
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

  { id: 'palette', cl: 'travel', z: 40, art: () => {
      const x = 1980, z = 40, W = 236, D = 104, Hb = 15;
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
        const x = 150 + i * 8, y = i * 26, z = 40 + i * 6, w = 300 - i * 12, dp = 210 - i * 8;
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

  { id: 'keyboard', cl: 'risk', z: 150, art: () => {
      const x = 640, z = 150, w = 620, dp = 210;
      const keys = [];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) {
        const kx = x + 18 + c * 45, kz = z + 22 + r * 44;
        keys.push(`<path class="con" d="${poly([P(kx, 26, kz), P(kx + 36, 26, kz), P(kx + 36, 26, kz + 34), P(kx, 26, kz + 34)])}"/>`);
      }
      return `${box(x, 0, z, w, 24, dp, { nohidden: true })}${keys.join('')}`;
    } },

  { id: 'mouse', cl: 'general', z: 170, art: () => {
      const cx = 1330, cz = 170;
      return `${cyl(cx, cz, 46, 30, 0, { nohidden: true })}
        <path class="vis" d="${line2(P(cx, 30, cz - 46), P(cx, 30, cz + 46))}"/>`;
    } },

  { id: 'phone', cl: 'general', z: 60, art: () => `
      ${sheet(1470, 0, 60, 150, 300, 12, { col: '#141c22' })}` },

  { id: 'tickets', cl: 'travel', z: 34, art: () => {
      const t = [[1640, 30, 4], [1676, 52, -7], [1710, 40, 9]];
      return t.map(([x, z, r], i) => {
        const w = 250, dp = 110, rad = r * Math.PI / 180, y = 2 + i * 2.4, c = [x + w / 2, z + dp / 2];
        const q = [[x, z], [x + w, z], [x + w, z + dp], [x, z + dp]].map(([px, pz]) => {
          const dx = px - c[0], dz = pz - c[1];
          return P(c[0] + dx * Math.cos(rad) - dz * Math.sin(rad), y, c[1] + dx * Math.sin(rad) + dz * Math.cos(rad));
        });
        return `<path class="solid" d="${poly(q)}"/><path class="col vis" style="--c:#d8a24a" d="${poly(q)}"/>`;
      }).join('');
    } },

  { id: 'map', cl: 'travel', z: 40, art: () => {
      const x = 1840, z = 40, w = 460, dp = 300;
      /* part-open: two panels still folded up on the right */
      const flat = [P(x, 4, z), P(x + w * .62, 4, z), P(x + w * .62, 4, z + dp), P(x, 4, z + dp)];
      const fold = [P(x + w * .62, 4, z), P(x + w * .86, 74, z + 20), P(x + w * .86, 74, z + dp - 20), P(x + w * .62, 4, z + dp)];
      const contour = t => {
        const pts = Array.from({ length: 18 }, (_, i) => {
          const u = i / 17;
          return P(x + 30 + u * (w * .56), 5, z + 40 + dp * .62 * (0.5 + 0.34 * Math.sin(u * 5.4 + t * 1.7)) - t * 26);
        });
        return `<path class="colstroke con" d="${poly(pts, false)}"/>`;
      };
      return `<path class="solid" d="${poly(flat)}"/><path class="ol col" style="--c:#5d8a58" d="${poly(flat)}"/>
        <g style="--c:#4f7d4a">${[0, 1, 2, 3].map(contour).join('')}</g>
        <path class="solid" d="${poly(fold)}"/><path class="vis" d="${poly(fold)}"/>`;
    } },

  { id: 'binoculars', cl: 'travel', z: 120, art: () => {
      const y = 62, L = 150, r = 40, rF = 46, cz = 120;
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
      return `${box(1516, y - 16, cz + 40, 62, 32, 62, { nohidden: true })}${barrel(1478)}${barrel(1610)}`;
    } }
];

/* --- chair and the seated figure, foreground ------------------------------ */
export const FOREGROUND = () => {
  /* Seated on the monitor's centre line, which is both where a person
     actually sits and what keeps her clear of the left-hand cluster that
     shot 3 zooms into. A seated head unavoidably overlaps the desk surface
     from this camera; the choice is only what it overlaps. */
  const z = -330, cx = 880;

  /* ---- the operator, back three-quarter ----------------------------------
     Built the way a figure is constructed rather than as a circle on a blob:
     an ovoid cranium (wider and higher at the back of the skull), a neck that
     actually enters the collar, a yoke seam across the shoulders, and the
     hair as a mass with a low bun — which is what reads from behind. */
  const ov = (ccx, ccy, rx, ry, n = 64) =>
    Array.from({ length: n }, (_, i) => {
      const t = i / n * Math.PI * 2;
      return P(ccx + rx * Math.cos(t), ccy + ry * Math.sin(t) + (Math.sin(t) > 0 ? ry * 0.10 : 0), z);
    });

  const shoulders = [P(cx - 274, -200, z), P(cx - 246, 120, z), P(cx - 176, 240, z),
                     P(cx - 96, 292, z), P(cx - 44, 306, z), P(cx + 44, 306, z),
                     P(cx + 96, 292, z), P(cx + 176, 240, z), P(cx + 246, 120, z),
                     P(cx + 274, -200, z)];
  const yoke = `<path class="con" d="M${f(P(cx - 236, 128, z)[0])} ${f(P(cx - 236, 128, z)[1])} Q${f(P(cx, 214, z)[0])} ${f(P(cx, 214, z)[1])} ${f(P(cx + 236, 128, z)[0])} ${f(P(cx + 236, 128, z)[1])}"/>`;
  const collar = [P(cx - 92, 288, z), P(cx - 52, 330, z), P(cx + 52, 330, z), P(cx + 92, 288, z)];
  const neck = [P(cx - 44, 296, z), P(cx + 44, 296, z), P(cx + 38, 376, z), P(cx - 38, 376, z)];
  const head = ov(cx, 452, 92, 104);
  const hair = [P(cx - 96, 402, z), P(cx - 112, 486, z), P(cx - 74, 556, z), P(cx, 574, z),
                P(cx + 74, 556, z), P(cx + 112, 486, z), P(cx + 96, 402, z),
                P(cx + 62, 452, z), P(cx, 470, z), P(cx - 62, 452, z)];
  const bun = circle2(P(cx, 392, z), 54);
  const strands = [-70, -36, 0, 36, 70].map(dx =>
    `<path class="con" d="M${f(P(cx + dx * 0.5, 566, z)[0])} ${f(P(cx + dx * 0.5, 566, z)[1])} Q${f(P(cx + dx * 1.3, 500, z)[0])} ${f(P(cx + dx * 1.3, 500, z)[1])} ${f(P(cx + dx * 1.05, 428, z)[0])} ${f(P(cx + dx * 1.05, 428, z)[1])}"/>`).join('');
  const skullCon = `<path class="cen" d="${line2(P(cx - 120, 452, z), P(cx + 120, 452, z))}"/>`;

  /* ---- task chair, seen from behind -------------------------------------- */
  const frame = [P(cx - 262, -430, z - 30), P(cx + 262, -430, z - 30), P(cx + 262, 40, z - 30),
                 P(cx + 214, 104, z - 30), P(cx - 214, 104, z - 30), P(cx - 262, 40, z - 30)];
  const mesh = [];
  for (let i = 1; i < 9; i++) {
    const yy = -430 + (534 * i / 9);
    const half = 262 - Math.max(0, (yy - 40)) * 0.75;
    mesh.push(`<path d="${line2(P(cx - half, yy, z - 30), P(cx + half, yy, z - 30))}"/>`);
  }
  for (let i = 1; i < 8; i++) {
    const xx = cx - 262 + (524 * i / 8);
    mesh.push(`<path d="${line2(P(xx, -430, z - 30), P(xx, 60, z - 30))}"/>`);
  }
  /* lumbar bar and its adjuster, the giveaway that it is an office chair */
  const lumbar = [P(cx - 236, -196, z - 26), P(cx + 236, -196, z - 26), P(cx + 236, -132, z - 26), P(cx - 236, -132, z - 26)];

  return `<g id="fg">
    ${centre(cx, z, 300, 620)}
    <path class="solid" d="${poly(shoulders)}"/><path class="ol" d="${poly(shoulders)}"/>
    ${yoke}
    <path class="solid" d="${poly(neck)}"/><path class="vis" d="${poly(neck)}"/>
    <path class="solid" d="${poly(collar)}"/><path class="vis" d="${poly(collar, false)}"/>
    <path class="solid" d="${poly(head)}"/><path class="ol" d="${poly(head)}"/>
    ${skullCon}
    <path class="solid" d="${poly(hair)}"/><path class="ol" d="${poly(hair)}"/>
    ${strands}
    <path class="solid" d="${poly(bun)}"/><path class="ol" d="${poly(bun)}"/>
    <path class="con" d="${poly(circle2(P(cx, 392, z), 32))}"/>
    <path class="solid" d="${poly(frame)}"/><path class="ol" d="${poly(frame)}"/>
    <g class="con">${mesh.join('')}</g>
    <path class="solid" d="${poly(lumbar)}"/><path class="vis" d="${poly(lumbar)}"/>
    ${screw(cx - 236, -164, z - 26, 9)}${screw(cx + 236, -164, z - 26, 9)}
    <path class="cen" d="${line2(P(cx, -450, z - 30), P(cx, 120, z - 30))}"/>
  </g>`;
};

/* --- room shell ----------------------------------------------------------- */
export const ROOM = () => {
  const wall = [P(-400, -200, 740), P(2600, -200, 740), P(2600, 900, 740), P(-400, 900, 740)];
  const top  = [P(0, 0, 0), P(2050, 0, 0), P(2050, 0, 720), P(0, 0, 720)];
  const front = [P(0, 0, 0), P(2050, 0, 0), P(2050, -60, 0), P(0, -60, 0)];
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
  /* far to near, so nearer objects occlude what sits behind them */
  const ordered = [...PROPS].sort((a, b) => b.z - a.z);
  const layers = {
    wall:  ordered.filter(p => p.z >= 700),
    back:  ordered.filter(p => p.z < 700 && p.z >= 400),
    front: ordered.filter(p => p.z < 400)
  };
  const g = list => list.map(p =>
    `<g class="obj" id="p-${p.id}" data-cl="${p.cl}">${p.art()}</g>`).join('\n');

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
