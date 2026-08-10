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

/** Frame `cw` viewBox units wide, with the world point placed at (bx, by) as a
 *  fraction of the frame rather than dead centre.
 *
 *  Centring the subject was fighting the copy panel: both wanted the middle. Biasing
 *  it down and to the right pushes the drawing into a corner and leaves the upper
 *  left clear, so the panel has room to breathe and the subject is still the thing
 *  your eye lands on. */
export const frameAt = (cw, world, bx = 0.5, by = 0.5) => {
  const [cx, cy] = world ? P(...world) : [SHEET_W / 2, SHEET_W / ASPECT / 2];
  const ch = cw / ASPECT;
  return [cx - cw * bx, cy - ch * by, cw, ch];
};

/* PANELS ALTERNATE SIDES, AND THE CAMERA ALTERNATES WITH THEM.
   The panels were moved to a single side because the camera had ONE fixed bias — subject
   pushed down-right, so the only clear zone was upper-left and the panel had to live there.
   Parking every panel in the same place is what turned eight shots into a list of boxes: the
   drawing moves but the reading position never does, so nothing feels like it is travelling.

   The fix is that the bias is not a constant. `side` says which side the panel takes, and the
   horizontal bias is simply mirrored to match — panel left puts the subject at 68% across,
   panel right puts it at 32%. One declaration per shot drives both, so they cannot disagree,
   which is the failure the single-sided version was avoiding rather than solving. */
const B = 0.68, BY = 0.60;
const bx = side => (side === 'r' ? 1 - B : side === 'c' ? 0.5 : B);

const WHOLE = [0, 0, SHEET_W, SHEET_W / ASPECT];

export const SHOTS = [
  {
    n: 1, id: 'hero', title: 'Hero', r: WHOLE, lit: [], side: 'l',
    beat: 'Everything present, dense, nothing lit. The tagline has to carry it.'
  },
  {
    /* Bias 0.30, not the mirror of 0.58, and this shot cannot be made perfectly clean either
       way. It is nearly the whole sheet and lights six objects spread right across the desk, so
       SOMETHING sits behind the panel whichever side it takes: on the left it buries the
       sketchpad, on the right the iPad. The sketchpad wins, because it owns this section's
       detail view and is the anchor a reader taps — the iPad is one member of the design
       cluster and the sketchpad already speaks for it. 0.30 is the bias that clears the
       sketchpad; measured, the iPad ends up ~93% behind the panel at 1440px and comes back
       into view on wider screens, where the card stops growing at 56ch. */
    n: 2, id: 'me', title: 'Three hats', side: 'r',
    r: frameAt(2280, [1060, 210, 340], 0.30, 0.55),
    lit: ['papers', 'sketchpad', 'ipad', 'map', 'binoculars', 'palette'],
    beat: 'Three clusters light in turn: risk, design, travel.'
  },
  {
    n: 3, id: 'journey', title: 'Journey', side: 'l',
    r: frameAt(1320, [210, 40, 140], bx('l'), BY),
    lit: ['notebooks'],
    beat: 'The notebook stack and the dated tickets read as a timeline.'
  },
  {
    /* Framed to hold the monitor AND the paper pile. Centred on the screen alone,
       the papers fell off the bottom edge — and they are the subject of the morph,
       so the one thing the shot exists to show was happening out of frame.

       THE ONE SHOT THAT CANNOT ALTERNATE. The monitor carries the six audit steps at
       readable size, so it is the widest subject in the drawing — around half the frame.
       With the panel on the right it overlaps the screen's text no matter how far left the
       bias pushes it, and the whole point of this shot is that those six steps can be read.
       So it repeats the previous shot's side, and that is a deliberate exception rather than
       an oversight: content that must stay legible outranks the rhythm. */
    n: 4, id: 'method', title: 'Method', side: 'l',
    r: frameAt(1180, [905, 210, 560], bx('l'), 0.54),
    lit: ['monitor', 'papers', 'stickies-bezel'],
    beat: 'Hero morph: the loose workpapers square up and resolve into the control table on screen.'
  },
  {
    n: 5, id: 'work', title: 'Work', side: 'r',
    r: frameAt(1080, [1510, 200, 690], bx('r'), BY),
    lit: ['laptop'],
    beat: 'Projects appear as clean screens on the laptop.'
  },
  {
    /* Centred, because it is the one shot with a single line of copy and a full pull-back —
       the reading position landing dead centre is what makes it read as a statement. */
    n: 6, id: 'statement', title: 'Statement', r: [-140, -100, 2680, 1675],
    lit: [], side: 'c',
    beat: 'Hard pull back. Systems are predictable. Humans are not.'
  },
  {
    n: 7, id: 'beyond', title: 'Beyond', side: 'l',
    r: frameAt(1180, [1700, 40, 220], bx('l'), BY),
    lit: ['map', 'binoculars', 'tickets', 'whiteboard', 'palette', 'photo'],
    beat: 'Second hero morph: the map contours become a ridgeline.'
  },
  {
    n: 8, id: 'connect', title: 'Connect', r: WHOLE, side: 'r',
    lit: ['monitor', 'sketchpad', 'ipad', 'map', 'notebooks', 'laptop', 'photo',
          'palette', 'plant', 'mug', 'lamp', 'papers', 'tickets', 'binoculars',
          'whiteboard'],
    beat: 'The desk you started with, resolved. Lamp on, everything in its place.'
  }
];

/* PORTRAIT IS A FIXED FRAME.
   The whole piece of furniture — wall to floor, desk legs, chair castors — measures
   about 1700 x 1740 in sheet units, which is very nearly square and therefore right for
   a phone. A transform cannot change the frame's ASPECT, only its scale and offset, so
   portrait gets its own viewBox and no camera transform whatsoever.
   That is deliberate rather than a limitation: on a phone the camera does not move at
   all, and the story is told purely by which objects light up. */
/* Tight to the desk, because the desk's ON-SCREEN size depends only on the frame's
   WIDTH — the svg is width-constrained, so height = 100% x (frameH / frameW) and adding
   vertical extent changes nothing. The furniture spans 1657 units across, so 1720 is
   about as narrow as this can go before the desk itself starts getting cropped: it buys
   roughly 12% more desk and takes the drawing from 45% to 53% of the viewport.
   The vitrine walls survive as ~30-unit bands at each edge, which is the thin sliver her
   reference shows anyway. */
/* Cropped in from 1720 to 1580 across, and the bottom trimmed so less of the chair base
   shows. The width is the part that matters: the drawing is width-constrained, so the desk's
   on-screen size is proportional to 1/frameWidth and nothing else. 80 to 1660 drops only the
   bare desk corners — every object still falls inside — and buys about 9% more desk.
   Trimming the bottom does not enlarge anything, but it removes dead space below the
   castors, which is what Saloni offered to give up to get the zoom. */
export const MOBILE_VIEW = [80, 150, 1580, 1730];

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
