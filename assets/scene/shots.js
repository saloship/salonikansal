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

/* THE CAMERA IS A PAN ACROSS THE DESK, and the frame CENTRES have to make that journey
   legible. Mirroring the bias off the panel side — my previous attempt — got the panels
   alternating but made the camera swing: shot 2 drifted right, shot 3 threw it hard left, and
   the result read as lateral jerks rather than travel.

   So the bias serves the PATH, and the panel takes whichever half of the frame is empty. The
   frame centres now run:

     1 hero     1200   the whole sheet
     2 me        950   drifting left, barely zoomed — this shot's event is the LIGHTING
     3 journey   388   the left end of the desk, the furthest point left
     4 method    620   ┐
     5 work     1495   │ one continuous sweep rightward across the desk
     6 statement 1400   │ pull back, almost no lateral move so the zoom carries it
     7 beyond   1531   ┘
     8 connect  1200   pull out to take it all in

   Two direction changes in eight shots — at the leftmost point, and at the final resolve —
   where before there were five. Everything between shot 3 and shot 7 travels one way.

   `BY` stays put: vertical bias never fought anything. */
const BY = 0.60;

const WHOLE = [0, 0, SHEET_W, SHEET_W / ASPECT];

export const SHOTS = [
  {
    n: 1, id: 'hero', title: 'Hero', r: WHOLE, lit: [], side: 'l',
    beat: 'Everything present, dense, nothing lit. The tagline has to carry it.'
  },
  {
    /* No zoom at all — the frame stays the hero's 2400 and only slides. That is the point: this
       shot's event is six objects lighting up across the desk, not a change of viewpoint.

       Panel RIGHT, at her instruction, and the framing is what makes that survivable. This shot
       lights three clusters — risk, design, travel — spread right across the desk, and the
       travel cluster lives on the desk's right, which is precisely where a right-hand panel
       sits. Framed naively it buried four of the six.
       The bias here was TUNED AGAINST MEASUREMENTS, not derived, and the reason matters: the
       layers carry their own parallax translate, so where an object actually lands on screen is
       not the camera rectangle alone. Two analytic attempts put the iPad clear and it measured
       92% then 100% buried. 0.145 comes from reading the real rectangles and shifting until the
       whole lit span sits left of the card.
       The cost is a big rightward drift here (frame centre ~1741 against the hero's 1200) which
       the camera then has to travel back across into shot 3. A left-hand panel here made the
       camera calmer; the right-hand one she asked for buys that at the price of one more
       direction change. */
    n: 2, id: 'me', title: 'Three hats', side: 'r',
    r: frameAt(2400, [1060, 210, 340], 0.145, 0.55),
    lit: ['papers', 'sketchpad', 'ipad', 'map', 'binoculars', 'palette'],
    beat: 'Three clusters light in turn: risk, design, travel.'
  },
  {
    /* FRAME TIGHTENED 1320 to 900, which is the fix for the empty middle she photographed.
       The notebook stack is only 320 units wide; in a 1320-wide frame it filled a quarter of
       the screen and sat right over against the far edge, so the panel and the subject were
       separated by a void. At 900 it fills a third and lands about 100px from the panel — near
       enough to read as one composition, not so near that they touch.
       Panel LEFT at her instruction, so the bias puts the stack on the RIGHT of the frame. 0.66,
       and the number is a compromise between two forces pulling opposite ways: the gap to the
       card (0.68 left the books 30px off it, which reads as touching) and the award paperwork now
       sliding out from under the stack on its right — at 0.76 that paperwork was pushed clean off
       the frame, so the detail existed and could not be seen. 0.66 keeps ~78px of air AND brings
       the certificates back into shot. */
    n: 3, id: 'journey', title: 'Journey', side: 'l',
    r: frameAt(900, [210, 40, 140], 0.66, BY),
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
    /* Bias 0.73, not 0.68. At 0.68 the panel clipped the first ~54px of SIXTEEN OF THE SEVENTEEN
       lines of screen text — the six audit steps, which are the entire point of this shot — and my
       overlap check passed it, because it measured overlap by AREA and 54px of a 500px-wide monitor
       is 11%, under the threshold. Area cannot see whether text is readable. Verified now by
       measuring the leftmost text rectangle against the card edge instead. */
    n: 4, id: 'method', title: 'Method', side: 'l',
    r: frameAt(1180, [905, 210, 560], 0.73, 0.54),
    lit: ['monitor', 'papers', 'stickies-bezel'],
    beat: 'Hero morph: the loose workpapers square up and resolve into the control table on screen.'
  },
  {
    n: 5, id: 'work', title: 'Work', side: 'r',
    r: frameAt(1080, [1510, 200, 690], 0.32, BY),
    lit: ['laptop'],
    beat: 'Projects appear as clean screens on the laptop.'
  },
  {
    /* Centred, because it is the one shot with a single line of copy and a full pull-back —
       the reading position landing dead centre is what makes it read as a statement.
       Offset right of the sheet's middle (centre 1400, not 1200) so the pull-back happens with
       almost no lateral movement: coming off shot 5 at 1495, the zoom does all the work and the
       camera does not slide sideways while it breathes out. */
    n: 6, id: 'statement', title: 'Statement', r: [60, -100, 2680, 1675],
    lit: [], side: 'c',
    beat: 'Hard pull back. Systems are predictable. Humans are not.'
  },
  {
    /* Panel LEFT at her instruction. Bias 0.66: at 0.68 the cluster sat 190px off the card with
       a hole between them, and 0.62 pulled it so close the binoculars went behind the card edge.
       Note the cost, since it is not obvious: shot 5's subject and this one are almost the same
       point on the desk, so flipping the panel between them makes the camera jog left even
       though the objects have not moved. Unavoidable when two adjacent shots share a location
       and take opposite sides. */
    n: 7, id: 'beyond', title: 'Beyond', side: 'l',
    r: frameAt(1180, [1700, 40, 220], 0.66, BY),
    lit: ['map', 'binoculars', 'tickets', 'whiteboard', 'palette', 'photo'],
    beat: 'Second hero morph: the map contours become a ridgeline.'
  },
  {
    /* side 'b' — CENTRE-BOTTOM, no card, over a blurred scene. This is the only shot where a
       side panel cannot work: the frame is the whole sheet with fifteen objects lit, so a panel
       on either flank buries half of them (measured: six on the left, four on the right). The
       resolve is meant to show the desk entire.
       Dropping the words to the bottom centre puts them over the desk's front edge and the
       chair — the emptiest band in the drawing — so nothing lit is covered at all, and the
       page ends by speaking over the scene rather than beside it. */
    n: 8, id: 'connect', title: 'Connect', r: WHOLE, side: 'b',
    lit: ['monitor', 'sketchpad', 'ipad', 'map', 'notebooks', 'laptop', 'photo',
          'palette', 'plant', 'mug', 'lamp', 'papers', 'tickets', 'binoculars',
          'whiteboard', 'phone'],
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
