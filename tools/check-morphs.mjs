/* ===========================================================================
   check-morphs.mjs
   ---------------------------------------------------------------------------
   The path interpolator in scene.js is ten lines: it walks the numbers in two
   `d` strings and lerps them pairwise. That only works if both strings have the
   SAME commands in the SAME order with the SAME number counts.

   desk.mjs upholds that by generating both states from one function, but "upheld
   by construction" is a promise, and a promise nobody checks is how a morph ends
   up tearing a shape inside out in front of someone. So it is checked, and a
   mismatch is a build failure rather than a runtime surprise.

   Run: node tools/check-morphs.mjs
   =========================================================================== */

import { buildScene, PROPS } from '../assets/scene/desk.mjs';
import { MORPHS } from '../assets/scene/shots.js';

const svg = buildScene();

const NUM = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
const cmds = d => (d.match(/[A-Za-z]/g) || []).join('');
const count = d => (d.match(NUM) || []).length;

/* pull every data-d0 / data-d1 pair, keeping the enclosing group id for reporting */
const groups = [...svg.matchAll(/<g class="obj" id="p-([^"]+)"[^>]*>([\s\S]*?)(?=<g class="obj"|$)/g)];

const errors = [];
let pairs = 0;
const perProp = {};

for (const [, id, body] of groups) {
  const found = [...body.matchAll(/data-d0="([^"]*)"\s+data-d1="([^"]*)"/g)];
  if (!found.length) continue;
  perProp[id] = found.length;
  found.forEach(([, d0, d1], i) => {
    pairs++;
    if (cmds(d0) !== cmds(d1)) {
      errors.push(`${id}[${i}] command structure differs\n      d0: ${cmds(d0)}\n      d1: ${cmds(d1)}`);
    } else if (count(d0) !== count(d1)) {
      errors.push(`${id}[${i}] number count differs: ${count(d0)} vs ${count(d1)}`);
    }
    for (const [n, d] of [['d0', d0], ['d1', d1]]) {
      if (!d.trim()) errors.push(`${id}[${i}] ${n} is empty`);
      else if (/NaN|undefined/.test(d)) errors.push(`${id}[${i}] ${n} contains NaN or undefined`);
    }
  });
}

/* every scheduled morph must actually find something to morph — a selector that
   matches nothing is a silently dead beat, which is worse than a broken one */
for (const m of MORPHS) {
  const id = m.sel.replace(/^#p-/, '');
  if (!perProp[id]) errors.push(`MORPHS entry ${m.sel} matches no path carrying data-d0`);
  if (!PROPS.some(p => p.id === id)) errors.push(`MORPHS entry ${m.sel} names no prop in desk.mjs`);
}

console.log(`\n${pairs} morph pair${pairs === 1 ? '' : 's'} across ${Object.keys(perProp).length} prop(s)`);
for (const [id, n] of Object.entries(perProp)) console.log(`    ${id.padEnd(12)} ${n}`);
console.log('');

if (errors.length) {
  console.log(`  ${errors.length} problem${errors.length > 1 ? 's' : ''}:`);
  for (const e of errors) console.log(`    ✗ ${e}`);
  console.log('');
  process.exit(1);
}

console.log('  ✓ every morph pair is structurally matched\n');
