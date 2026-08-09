/* ===========================================================================
   check-layout.mjs
   ---------------------------------------------------------------------------
   Proves that nothing on the desk is buried under something else, stacked by
   accident, or hanging off the edge into thin air.

   This exists because all three had happened and nothing could tell us. The
   map was sitting completely on top of the travel paint set, and the only
   reason it was on top rather than underneath was that it appeared later in
   the PROPS array — two props declaring the same `z` made the draw-order sort
   a coin toss.

   Footprints are not declared anywhere. desk.mjs instruments P() so each prop's
   bounds fall out of the geometry it actually drew, which means this check can
   never quietly validate a stale number.

   Run: node tools/check-layout.mjs
   =========================================================================== */

import { buildScene, FOOTPRINTS, PROPS, DESK } from '../assets/scene/desk.mjs';

buildScene();                       // populates FOOTPRINTS through the probe

const TOL = 12;                     // mm of overhang not worth caring about
const FAIL_PCT = 5;                 // overlap above this share of the smaller prop fails
const WALL_Z = 700;                 // at or beyond this, a prop is on the wall

/* Documented exceptions. A single bounding box cannot express "the monitor
   panel is up in the air above the paper pile", so the few genuine over-reaches
   are named here, each with the reason it is legitimate. Anything NOT on this
   list that overlaps is a bug. */
const ALLOW = [
  ['lamp', 'sketchpad', 'the arm reaches over the pad at 336mm+, which is the point of a task lamp'],
  ['monitor', 'papers', 'panel overhangs the top sheet of the pile by 4mm at 146mm+'],
];

const allowed = (a, b) =>
  ALLOW.some(([p, q]) => (p === a && q === b) || (p === b && q === a));

const byId = Object.fromEntries(PROPS.map(p => [p.id, p]));
const stacked = (a, b) => byId[a]?.on === b || byId[b]?.on === a;

const area = f => Math.max(0, f.x1 - f.x0) * Math.max(0, f.z1 - f.z0);
const overlapArea = (a, b) => {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const d = Math.min(a.z1, b.z1) - Math.max(a.z0, b.z0);
  return w > 0 && d > 0 ? w * d : 0;
};

const ids = PROPS.map(p => p.id).filter(id => FOOTPRINTS[id]);
const deskProps = ids.filter(id => FOOTPRINTS[id].z0 < WALL_Z);

const errors = [];
const notes = [];

/* --- 1. does every desk prop actually sit on the desk? --------------------- */
for (const id of deskProps) {
  const f = FOOTPRINTS[id];
  const off = [];
  if (f.x0 < DESK.x0 - TOL) off.push(`${Math.round(DESK.x0 - f.x0)}mm past the left edge`);
  if (f.x1 > DESK.x1 + TOL) off.push(`${Math.round(f.x1 - DESK.x1)}mm past the right edge`);
  if (f.z0 < DESK.z0 - TOL) off.push(`${Math.round(DESK.z0 - f.z0)}mm past the front edge`);
  if (f.z1 > DESK.z1 + TOL) off.push(`${Math.round(f.z1 - DESK.z1)}mm past the back edge`);
  if (off.length) errors.push(`${id.padEnd(15)} hangs off the desk — ${off.join(', ')}`);
}

/* --- 2. is anything buried under anything else? ---------------------------- */
for (let i = 0; i < deskProps.length; i++) {
  for (let j = i + 1; j < deskProps.length; j++) {
    const a = deskProps[i], b = deskProps[j];
    const ov = overlapArea(FOOTPRINTS[a], FOOTPRINTS[b]);
    if (!ov) continue;

    const smaller = Math.min(area(FOOTPRINTS[a]), FOOTPRINTS[b] ? area(FOOTPRINTS[b]) : Infinity);
    const pct = smaller ? (ov / smaller) * 100 : 0;
    const line = `${a} ∩ ${b} — ${pct.toFixed(0)}% of the smaller (${Math.round(ov / 100) / 10}k mm²)`;

    if (stacked(a, b)) { notes.push(`declared stack:  ${line}`); continue; }
    if (allowed(a, b)) { notes.push(`allowed:         ${line}`); continue; }
    if (pct >= FAIL_PCT) errors.push(`${line}`);
    else notes.push(`grazing:         ${line}`);
  }
}

/* --- 3. can the draw order actually be relied on? ------------------------- */
/* Two overlapping props at the same z make the far-to-near sort a tie, and
   which one ends up on top is then just which was typed first. */
const seen = new Map();
for (const p of PROPS) {
  if (!FOOTPRINTS[p.id]) continue;
  if (seen.has(p.z)) {
    const other = seen.get(p.z);
    if (overlapArea(FOOTPRINTS[p.id], FOOTPRINTS[other])) {
      errors.push(`${p.id} and ${other} both declare z=${p.z} and overlap — draw order is a tie`);
    }
  } else seen.set(p.z, p.id);
}

/* --- report --------------------------------------------------------------- */
console.log(`\ndesk ${DESK.x1} x ${DESK.z1} mm · ${ids.length} props probed ` +
            `(${deskProps.length} on the desk, ${ids.length - deskProps.length} on the wall)\n`);

if (notes.length) {
  console.log('  fine:');
  for (const n of notes) console.log(`    ${n}`);
  console.log('');
}

if (errors.length) {
  console.log(`  ${errors.length} problem${errors.length > 1 ? 's' : ''}:`);
  for (const e of errors) console.log(`    ✗ ${e}`);
  console.log('');
  process.exit(1);
}

console.log('  ✓ layout clean — nothing buried, nothing off the edge\n');
