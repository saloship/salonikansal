/* ===========================================================================
   DRAWING SHEET FURNITURE
   ---------------------------------------------------------------------------
   The apparatus that turns a line drawing into an actual engineering document:
   border and frame, zone markers, title block, revision table, notes, a third-
   angle projection symbol, a bill of materials, and numbered balloons keyed to
   the objects on the desk.

   Conventions follow standard practice: title block bottom-right carrying part
   name / number / scale / material / drawn-by / sheet / revision; revision
   table top-right; parts list stacked directly above the title block; detail
   views called out with a circle, a letter and their own scale.

   This lives outside the camera group, so the sheet stays put while the
   drawing zooms inside it — you are looking at one document through a loupe,
   not flying through space.
   =========================================================================== */

const f = n => Math.round(n * 100) / 100;
const R = (x, y, w, h) => `M${f(x)} ${f(y)} L${f(x + w)} ${f(y)} L${f(x + w)} ${f(y + h)} L${f(x)} ${f(y + h)} Z`;
const L = (x1, y1, x2, y2) => `M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}`;

/* --- title block ----------------------------------------------------------
   Field order and grouping follow the standard layout: identity on the left,
   the small metadata cells (scale / sheet / rev) banked on the right. */
const TITLE_FIELDS = [
  { k: 'DRAWN',    v: 'S. KANSAL' },
  { k: 'DATE',     v: '2026-08' },
  { k: 'MATERIAL', v: 'MIXED' },
  { k: 'FINISH',   v: 'AS NOTED' }
];

export function titleBlock(x, y, w, h) {
  /* two field rows, not four — four at this height had the value of one row
     printing over the key of the next */
  const rowH = h / 2, colA = w * 0.46, colB = w * 0.72;
  const cells = TITLE_FIELDS.map((fl, i) => {
    const col = i % 2, row = (i / 2) | 0;
    const fx = x + 14 + col * (colA / 2), fy = y + rowH * row;
    return `<text class="sh-k" x="${f(fx)}" y="${f(fy + 24)}">${fl.k}</text>
            <text class="sh-v" x="${f(fx)}" y="${f(fy + 50)}">${fl.v}</text>`;
  }).join('') + `
    <path class="sh-line" d="${L(x, y + rowH, x + colA, y + rowH)}"/>
    <path class="sh-line" d="${L(x + colA / 2, y, x + colA / 2, y + h)}"/>`;

  /* third-angle projection symbol: a truncated cone seen from the end and
     from the side — the mark that tells you how the views are arranged */
  const px = x + colA + (colB - colA) / 2, py = y + h * 0.30, rr = h * 0.15;
  const proj = `
    <ellipse class="sh-line" cx="${f(px - rr * 1.15)}" cy="${f(py)}" rx="${f(rr * 0.52)}" ry="${f(rr)}"/>
    <ellipse class="sh-line" cx="${f(px - rr * 1.15)}" cy="${f(py)}" rx="${f(rr * 0.26)}" ry="${f(rr * 0.5)}"/>
    <path class="sh-line" d="M${f(px + rr * 0.3)} ${f(py - rr)} L${f(px + rr * 1.7)} ${f(py - rr * 0.5)} L${f(px + rr * 1.7)} ${f(py + rr * 0.5)} L${f(px + rr * 0.3)} ${f(py + rr)} Z"/>
    <path class="sh-cen" d="${L(px - rr * 2.2, py, px + rr * 2.4, py)}"/>`;

  return `<g class="sheetblk">
    <path class="sh-bg" d="${R(x, y, w, h)}"/>
    <path class="sh-frame" d="${R(x, y, w, h)}"/>
    <path class="sh-line" d="${L(x + colA, y, x + colA, y + h)}"/>
    <path class="sh-line" d="${L(x + colB, y, x + colB, y + h)}"/>
    ${cells}
    <text class="sh-title" x="${f(x - 18)}" y="${f(y + 34)}" text-anchor="end">WORKSTATION — GENERAL ARRANGEMENT</text>
    ${proj}
    <text class="sh-k" x="${f(x + colA + 14)}" y="${f(y + h - 46)}">PROJECTION</text>
    <text class="sh-v" x="${f(x + colA + 14)}" y="${f(y + h - 18)}">THIRD ANGLE</text>

    ${(() => {
      /* the metadata bank runs on its own four-row rhythm — sharing the
         two-row pitch of the fields on the left overflowed the block */
      const r4 = h / 4;
      const cells = [['SCALE', '1:5'], ['DWG NO', 'SK-01'], ['SHEET', '1 OF 1'], ['REV', 'C']];
      return cells.map(([k, v], i) => `
        ${i ? `<path class="sh-line" d="${L(x + colB, y + r4 * i, x + w, y + r4 * i)}"/>` : ''}
        <text class="sh-k" x="${f(x + colB + 12)}" y="${f(y + r4 * i + 15)}">${k}</text>
        <text class="sh-v" x="${f(x + w - 12)}" y="${f(y + r4 * i + 30)}" text-anchor="end">${v}</text>`).join('');
    })()}
  </g>`;
}

/* --- bill of materials ----------------------------------------------------
   Sits directly above the title block, read bottom-up, and is keyed to the
   balloons on the drawing. On the site this doubles as the legend: each item
   is one of the things the desk is actually about. */
export const BOM = [
  { n: 1, id: 'monitor',    desc: 'CONTROL MATRIX — DISPLAY', qty: 1, cl: 'risk' },
  { n: 2, id: 'papers',     desc: 'WORKPAPERS, LOOSE',        qty: 3, cl: 'risk' },
  { n: 3, id: 'sketchpad',  desc: 'SKETCHPAD, OPEN',          qty: 1, cl: 'design' },
  { n: 4, id: 'laptop',     desc: 'LAPTOP + RISER ASSY',      qty: 1, cl: 'work' },
  { n: 5, id: 'map',        desc: 'MAP, PART FOLDED',         qty: 1, cl: 'travel' },
  { n: 6, id: 'binoculars', desc: 'BINOCULARS 8×42',          qty: 1, cl: 'travel' },
  { n: 7, id: 'palette',    desc: 'PAINT SET, TRAVEL',        qty: 1, cl: 'travel' },
  { n: 8, id: 'notebooks',  desc: 'NOTEBOOKS, DATED',         qty: 3, cl: 'journey' },
  { n: 9, id: 'whiteboard', desc: 'WHITEBOARD — LANDSCAPE MAP', qty: 1, cl: 'risk' }
];

export function bom(x, y, w, rowH = 30) {
  const rows = BOM.length;
  const h = rowH * (rows + 1);
  const top = y - h;
  const cN = w * 0.10, cQ = w * 0.22;
  const body = BOM.map((it, i) => {
    const ry = y - rowH * (i + 1);
    return `
      <path class="sh-line" d="${L(x, ry, x + w, ry)}"/>
      <text class="sh-v" x="${f(x + cN / 2)}" y="${f(ry + 21)}" text-anchor="middle">${it.n}</text>
      <text class="sh-v" x="${f(x + cQ / 2 + cN)}" y="${f(ry + 21)}" text-anchor="middle">${it.qty}</text>
      <text class="sh-v" x="${f(x + cN + cQ + 12)}" y="${f(ry + 21)}">${it.desc}</text>`;
  }).join('');
  return `<g class="sheetblk">
    <path class="sh-bg" d="${R(x, top, w, h)}"/>
    <path class="sh-frame" d="${R(x, top, w, h)}"/>
    <path class="sh-line" d="${L(x + cN, top, x + cN, y)}"/>
    <path class="sh-line" d="${L(x + cN + cQ, top, x + cN + cQ, y)}"/>
    <path class="sh-line" d="${L(x, y - rowH * rows, x + w, y - rowH * rows)}"/>
    <text class="sh-k" x="${f(x + cN / 2)}" y="${f(top + 21)}" text-anchor="middle">ITEM</text>
    <text class="sh-k" x="${f(x + cQ / 2 + cN)}" y="${f(top + 21)}" text-anchor="middle">QTY</text>
    <text class="sh-k" x="${f(x + cN + cQ + 12)}" y="${f(top + 21)}">DESCRIPTION</text>
    ${body}
  </g>`;
}

/* --- revision table (top-right, standard position) ------------------------ */
const REVS = [
  { r: 'A', d: 'INITIAL BLOCK-OUT',            dt: '08-08' },
  { r: 'B', d: 'SEATED OPERATOR; +4 ITEMS',     dt: '08-09' },
  { r: 'C', d: 'BLUEPRINT LANGUAGE ADOPTED',    dt: '08-09' }
];
export function revisions(x, y, w, rowH = 28) {
  const h = rowH * (REVS.length + 1), cR = w * 0.12, cD = w * 0.70;
  const body = REVS.map((v, i) => `
    <path class="sh-line" d="${L(x, y + rowH * (i + 1), x + w, y + rowH * (i + 1))}"/>
    <text class="sh-v" x="${f(x + cR / 2)}" y="${f(y + rowH * (i + 1) + 20)}" text-anchor="middle">${v.r}</text>
    <text class="sh-v" x="${f(x + cR + 10)}" y="${f(y + rowH * (i + 1) + 20)}">${v.d}</text>
    <text class="sh-v" x="${f(x + w - 10)}" y="${f(y + rowH * (i + 1) + 20)}" text-anchor="end">${v.dt}</text>`).join('');
  return `<g class="sheetblk">
    <path class="sh-bg" d="${R(x, y, w, h)}"/>
    <path class="sh-frame" d="${R(x, y, w, h)}"/>
    <path class="sh-line" d="${L(x + cR, y, x + cR, y + h)}"/>
    <path class="sh-line" d="${L(x + cD, y, x + cD, y + h)}"/>
    <text class="sh-k" x="${f(x + cR / 2)}" y="${f(y + 19)}" text-anchor="middle">REV</text>
    <text class="sh-k" x="${f(x + cR + 10)}" y="${f(y + 19)}">DESCRIPTION</text>
    <text class="sh-k" x="${f(x + w - 10)}" y="${f(y + 19)}" text-anchor="end">DATE</text>
    ${body}
  </g>`;
}

/* --- notes ---------------------------------------------------------------- */
const NOTES = [
  'ALL DIMENSIONS IN MM UNLESS NOTED.',
  'ITEMS SHOWN IN RESTING STATE — MONOCHROME.',
  'COLOUR APPLIES ONLY TO THE ITEM IN SHOT.',
  'HIDDEN DETAIL SHOWN ON FOCUSED ITEM ONLY.'
];
export function notes(x, y) {
  return `<g class="sheetblk">
    <text class="sh-k" x="${f(x)}" y="${f(y)}">NOTES</text>
    ${NOTES.map((t, i) => `<text class="sh-v" x="${f(x)}" y="${f(y + 26 + i * 24)}">${i + 1}. ${t}</text>`).join('')}
  </g>`;
}

/* --- border, frame and zone markers --------------------------------------- */
export function frame(W, H, m = 26, inner = 20) {
  const zx = 6, zy = 4, x0 = m + inner, y0 = m + inner;
  const iw = W - 2 * x0, ih = H - 2 * y0;
  const ticks = [];
  for (let i = 0; i < zx; i++) {
    const cx = x0 + iw * (i + 0.5), bx = x0 + iw * (i + 1);
    ticks.push(`<text class="sh-zone" x="${f(cx)}" y="${f(m + 15)}" text-anchor="middle">${i + 1}</text>`);
    ticks.push(`<text class="sh-zone" x="${f(cx)}" y="${f(H - m - 5)}" text-anchor="middle">${i + 1}</text>`);
    if (i < zx - 1) {
      ticks.push(`<path class="sh-line" d="${L(bx, m, bx, y0)}"/>`);
      ticks.push(`<path class="sh-line" d="${L(bx, H - y0, bx, H - m)}"/>`);
    }
  }
  for (let i = 0; i < zy; i++) {
    const cy = y0 + ih * (i + 0.5), by = y0 + ih * (i + 1), ltr = String.fromCharCode(68 - i);
    ticks.push(`<text class="sh-zone" x="${f(m + 10)}" y="${f(cy + 6)}" text-anchor="middle">${ltr}</text>`);
    ticks.push(`<text class="sh-zone" x="${f(W - m - 10)}" y="${f(cy + 6)}" text-anchor="middle">${ltr}</text>`);
    if (i < zy - 1) {
      ticks.push(`<path class="sh-line" d="${L(m, by, x0, by)}"/>`);
      ticks.push(`<path class="sh-line" d="${L(W - x0, by, W - m, by)}"/>`);
    }
  }
  return `<g class="sheetblk">
    <path class="sh-frame" d="${R(m, m, W - 2 * m, H - 2 * m)}"/>
    <path class="sh-frame" d="${R(x0, y0, iw, ih)}"/>
    ${ticks.join('')}
  </g>`;
}

/* --- balloon: circled item number on a leader with a landing dot ----------- */
export function balloon(n, bx, by, tx, ty, r = 21) {
  const dx = tx - bx, dy = ty - by, m = Math.hypot(dx, dy) || 1;
  const sx = bx + dx / m * r, sy = by + dy / m * r;
  return `<g class="balloon" data-item="${n}">
    <path class="sh-lead" d="${L(sx, sy, tx, ty)}"/>
    <circle class="sh-dot" cx="${f(tx)}" cy="${f(ty)}" r="3.6"/>
    <circle class="sh-balloon" cx="${f(bx)}" cy="${f(by)}" r="${f(r)}"/>
    <text class="sh-bal-t" x="${f(bx)}" y="${f(by + 6)}" text-anchor="middle">${n}</text>
  </g>`;
}

/* --- detail callout: circle + letter, pointing at a blown-up view ---------- */
export function detailCallout(cx, cy, r, letter, scale = '2:1') {
  return `<g class="sheetblk">
    <circle class="sh-detail" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>
    <path class="sh-lead" d="${L(cx + r * 0.71, cy - r * 0.71, cx + r * 0.71 + 44, cy - r * 0.71 - 30)}"/>
    <text class="sh-detail-t" x="${f(cx + r * 0.71 + 50)}" y="${f(cy - r * 0.71 - 34)}">DETAIL ${letter}</text>
    <text class="sh-v" x="${f(cx + r * 0.71 + 50)}" y="${f(cy - r * 0.71 - 12)}">SCALE ${scale}</text>
  </g>`;
}

/* --- section cutting-plane line: heavy, with direction arrows ------------- */
export function cuttingPlane(x1, y1, x2, y2, letter) {
  const dx = x2 - x1, dy = y2 - y1, m = Math.hypot(dx, dy) || 1;
  const nx = -dy / m, ny = dx / m, k = 26;
  const head = (px, py) => `<path class="sh-arrowfill" d="M${f(px)} ${f(py)} L${f(px + nx * k - dx / m * 9)} ${f(py + ny * k - dy / m * 9)} L${f(px + nx * k + dx / m * 9)} ${f(py + ny * k + dy / m * 9)} Z"/>`;
  return `<g class="sheetblk">
    <path class="sh-cut" d="${L(x1, y1, x2, y2)}"/>
    ${head(x1, y1)}${head(x2, y2)}
    <text class="sh-detail-t" x="${f(x1 - 16)}" y="${f(y1 - 12)}" text-anchor="end">${letter}</text>
    <text class="sh-detail-t" x="${f(x2 + 16)}" y="${f(y2 - 12)}">${letter}</text>
  </g>`;
}

/** Whole sheet, assembled. */
export function sheetFurniture(W, H) {
  const m = 26, inner = 20, x0 = m + inner, y0 = m + inner;
  const tbW = 520, tbH = 132;
  const tbX = W - x0 - tbW, tbY = H - y0 - tbH;
  return `
    ${frame(W, H, m, inner)}
    ${titleBlock(tbX, tbY, tbW, tbH)}
    ${bom(tbX, tbY - 34, tbW)}
    ${revisions(W - x0 - 460, y0 + 14, 460)}
    ${notes(x0 + 18, y0 + 34)}`;
}
