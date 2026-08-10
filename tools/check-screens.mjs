/* ===========================================================================
   check-screens.mjs
   ---------------------------------------------------------------------------
   The devices in the drawing display real copy, and a display is a fixed size. The
   monitor's document is currently within a millimetre of full — measured, not guessed
   — so the next person to add a seventh audit step, or to lengthen the outcome note,
   would silently push text off the bottom of the screen and never see it.

   SVG text does not reflow and does not clip visibly: it just draws outside its box.
   So overflow here is invisible in review and obvious to a reader.

   Everything below is computed with the SAME functions the renderer uses
   (screenTextHeight, monitorBlocks, MONITOR_SCREEN) rather than a copy of the
   arithmetic, because a check that reimplements what it checks drifts from it.

   Run: node tools/check-screens.mjs
   =========================================================================== */

import { MONITOR_SCREEN, monitorBlocks, screenTextHeight, wrapText } from '../assets/scene/desk.mjs';
import { SECTIONS } from '../assets/scene/content.js';

const errors = [];
const notes = [];

/* Monospace glyphs are 0.6em wide, so this is how much room a string needs. */
const widthOf = (s, size) => s.length * size * 0.6;

function checkScreen(name, doc, box) {
  if (!doc) { notes.push(`${name}: no copy assigned`); return; }
  const blocks = monitorBlocks(doc);
  const used = screenTextHeight(blocks);
  const free = box.h - used;

  console.log(`  ${name.padEnd(9)} ${used.toFixed(1)} of ${box.h} mm used, ` +
              `${free.toFixed(1)} free  (${blocks.length} lines)`);

  if (used > box.h) {
    errors.push(`${name}: content is ${(used - box.h).toFixed(1)}mm TALLER than the screen — ` +
                `${blocks.length} lines need ${used.toFixed(1)}mm, only ${box.h}mm exists`);
  } else if (free < 6) {
    notes.push(`${name}: only ${free.toFixed(1)}mm of headroom — one more line will overflow`);
  }

  /* Items are not word-wrapped, so a long one simply runs off the side. Only the note
     is wrapped, and its wrap width has to agree with the box. */
  for (const b of blocks) {
    const avail = box.w - (b.indent || 0);
    const need = widthOf(b.t, b.size ?? 11);
    if (need > avail) {
      errors.push(`${name}: line runs ${(need - avail).toFixed(0)}mm off the screen ` +
                  `(${b.t.length} chars at ${b.size}mm needs ${need.toFixed(0)}mm of ${avail}) — ` +
                  `"${b.t.slice(0, 46)}${b.t.length > 46 ? '…' : ''}"`);
    }
  }

  /* Report the budgets, so whoever writes the copy has the numbers rather than a warning
     after the fact. */
  const maxChars = size => Math.floor(box.w / (size * 0.6));
  notes.push(`${name}: max ${maxChars(11)} chars per item heading, ` +
             `${Math.floor((box.w - box.indent) / (9.5 * 0.6))} per item body`);
  if (doc.note) {
    const lines = wrapText(doc.note, 78).length;
    const room = Math.floor((box.h - screenTextHeight(monitorBlocks({ ...doc, note: null }))) / (9 * 1.3));
    notes.push(`${name}: outcome note uses ${lines} of ${room} available wrapped lines ` +
               `(${doc.note.length} chars)`);
    if (lines > room) errors.push(`${name}: outcome note needs ${lines} lines, only ${room} fit`);
  }
}

console.log('\nscreen capacity\n');
checkScreen('monitor', SECTIONS.method.deep, MONITOR_SCREEN);

if (notes.length) {
  console.log('\n  budgets:');
  for (const n of notes) console.log(`    ${n}`);
}

if (errors.length) {
  console.log(`\n  ${errors.length} problem${errors.length > 1 ? 's' : ''}:`);
  for (const e of errors) console.log(`    ✗ ${e}`);
  console.log('');
  process.exit(1);
}

console.log('\n  ✓ every screen fits its display\n');
