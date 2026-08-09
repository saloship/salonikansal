/* ===========================================================================
   THE STORYLINE — the shot list
   ---------------------------------------------------------------------------
   A shot is defined by what it LOOKS AT in world millimetres plus how wide the
   frame is. Never by a rectangle typed out by hand: the drawing gets re-laid
   often, and a hand-typed rectangle silently stops pointing at the thing it was
   meant to point at. Ask for the monitor and you get the monitor.

   Every frame is 16:10, so the camera cannot distort the drawing.

   `lit` is the list of prop ids that take their real colours in this shot. That
   is the whole colour rule: the world stays a navy drawing until you look
   closely at something, and then that thing becomes real.
   =========================================================================== */

import { P } from './desk.mjs';

export const SHEET_W = 2400, ASPECT = 1.6;

/** Frame `cw` viewBox units wide, centred on a world point. */
export const frameAt = (cw, world) => {
  const [cx, cy] = world ? P(...world) : [SHEET_W / 2, SHEET_W / ASPECT / 2];
  return [cx - cw / 2, cy - cw / (ASPECT * 2), cw, cw / ASPECT];
};

const WHOLE = [0, 0, SHEET_W, SHEET_W / ASPECT];

export const SHOTS = [
  {
    n: 1, id: 'hero', title: 'Hero', r: WHOLE, lit: [],
    beat: 'Everything present, dense, nothing lit. The tagline has to carry it.'
  },
  {
    n: 2, id: 'me', title: 'Three hats', r: frameAt(2160, [1000, 240, 340]),
    lit: ['papers', 'sketchpad', 'ipad', 'map', 'binoculars', 'palette'],
    beat: 'Three clusters light in turn: risk, design, travel.'
  },
  {
    n: 3, id: 'journey', title: 'Journey', r: frameAt(1000, [210, 40, 140]),
    lit: ['notebooks'],
    beat: 'The notebook stack and the dated tickets read as a timeline.'
  },
  {
    /* Framed to hold the monitor AND the paper pile. Centred on the screen alone,
       the papers fell off the bottom edge — and they are the subject of the morph,
       so the one thing the shot exists to show was happening out of frame. */
    n: 4, id: 'method', title: 'Method', r: frameAt(880, [885, 165, 560]),
    lit: ['monitor', 'papers', 'stickies-bezel'],
    beat: 'Hero morph: the loose workpapers square up and resolve into the control table on screen.'
  },
  {
    n: 5, id: 'work', title: 'Work', r: frameAt(820, [1510, 200, 690]),
    lit: ['laptop'],
    beat: 'Projects appear as clean screens on the laptop.'
  },
  {
    n: 6, id: 'statement', title: 'Statement', r: [-140, -100, 2680, 1675],
    lit: [],
    beat: 'Hard pull back. Systems are predictable. Humans are not.'
  },
  {
    n: 7, id: 'beyond', title: 'Beyond', r: frameAt(900, [1700, 40, 220]),
    lit: ['map', 'binoculars', 'tickets', 'whiteboard', 'palette', 'photo'],
    beat: 'Second hero morph: the map contours become a ridgeline.'
  },
  {
    n: 8, id: 'connect', title: 'Connect', r: WHOLE,
    lit: ['monitor', 'sketchpad', 'ipad', 'map', 'notebooks', 'laptop', 'photo',
          'palette', 'plant', 'mug', 'lamp', 'papers', 'tickets', 'binoculars',
          'whiteboard'],
    beat: 'The desk you started with, resolved. Lamp on, everything in its place.'
  }
];

/* Portrait is not the desktop list rescaled — that only ever gives you a wide
   drawing with its subject somewhere off to the side. Tighter crops, and the
   wide shots pull in to where the desk actually reads. */
export const SHOTS_MOBILE = SHOTS.map(s => {
  const tight = { hero: 1500, me: 1200, journey: 620, method: 560, work: 520,
                  statement: 1900, beyond: 560, connect: 1500 };
  const look = { hero: [1000, 180, 400], me: [900, 200, 380], journey: [200, 30, 130],
                 method: [880, 300, 560], work: [1500, 190, 690],
                 statement: [1000, 160, 400], beyond: [1680, 30, 200],
                 connect: [1000, 180, 400] };
  return { ...s, r: frameAt(tight[s.id], look[s.id]) };
});

/* The morph schedule. `in` is the 0-based shot the morph completes on; `out` is
   where it releases, if it ever does.
                                          0 hero  1 me  2 journey  3 method
                                          4 work  5 statement  6 beyond  7 connect

   The workpapers releasing at the Statement is the whole argument of this site
   made visible: the grid you just watched assemble comes apart again, because
   systems are predictable and humans are not. */
export const MORPHS = [
  { sel: '#p-papers', in: 3, out: 5,
    beat: 'loose workpapers square up arriving at Method, and let go again at the Statement' },
  { sel: '#p-map', in: 6,
    beat: 'the map contours stand up into a ridgeline' }
];

/* Layer depth weights for parallax. The camera pans and the layers slide against
   each other by a fraction of that pan — which is what sells 2.5D, and costs
   nothing because these are the same transforms the camera already applies. */
export const LAYERS = [
  ['L-room', -1.00],
  ['L-wall', -0.66],
  ['L-back', -0.24],
  ['L-front', 0.30],
  ['L-fg', 1.00]
];
