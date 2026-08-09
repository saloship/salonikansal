# Object specification format

Every object is described completely, as data, **before** anything is modelled.
`tools/bake/build.py` reads the spec and builds exactly what it says. Nothing is
chosen while writing code, so when something is wrong the fix goes in the spec.

One spec per object: `tools/bake/specs/<id>.json`. The `id` must match the prop id
in `assets/scene/desk.mjs`, because the layout checker and the camera both key off
it.

## Which pipeline — `"pipeline": "hand" | "bake"`

Not every object wants the same treatment, and this is decided by looking, not by
preference. Recorded in the spec so it is not rediscovered each time.

**Bake** an object whose form is genuinely three-dimensional and mechanical: the
lamp's articulated arm, the laptop hinge, the scissor riser, the chair, and curved
bodies — mug, bottle, plant pot, binocular barrels. There, computed hidden-line
removal and exact curvature are real information that cannot be got by hand.

**Hand-author** flat arrays of small repeated parts. The keyboard was the test
case (`bake-test.html`): 87 near-identical caps whose true 1.05mm gap is a fifth
of a pixel at any zoom the object is seen at. Baking added truthful taper sides,
cap fronts and hidden rims — all of which became noise, and it stopped reading as
a keyboard. A legible diagram beat a faithful projection.

The spec is written either way. It is the source of truth for dimensions whichever
pipeline consumes it — `keyMap()` in `desk.mjs` reads the same 19.05mm pitch and
row widths that `build.py` would have.

## Coordinates

Same system as `desk.mjs`, in **millimetres**:

```
x  right along the desk      0 .. 2050
y  up from the desk surface  0 = the desk top
z  away from the viewer      0 = front edge, 720 = the wall
```

`datum` places the object in that world. **Every part position inside the spec is
relative to the datum**, so the object can be moved by changing one line and
nothing else has to be recomputed. Parts are dimensioned front-left-bottom
corner first, which matches how the drawing reads.

## Schema

```jsonc
{
  "id": "keyboard",                 // must match the desk.mjs prop id
  "name": "KEYBOARD — ANSI TENKEYLESS",
  "shots": [4],                     // which shots frame this object; drives detail tier
  "datum":    { "x": 720, "y": 0, "z": 190, "note": "why the datum is here" },
  "envelope": { "w": 368, "h": 20, "d": 130 },   // asserted; the build fails if parts exceed it
  "tilt":     { "deg": 6, "note": "rear raised by the flip feet" },

  "parts": [
    { "id": "shell", "kind": "well", "x": 0, "y": 0, "z": 0,
      "w": 368, "h": 20, "d": 130, "wall": 8, "floor": 8, "fillet": 1.6,
      "lod": 1, "note": "a well, not a slab — see below" }
  ],

  "features": [                     // small things that make a part read as made
    { "id": "led", "kind": "box", "count": 3, "pitch": 13, ... , "lod": 3 }
  ],

  "annotation": {
    "dimensions": [                 // what gets called out, and on which side
      { "of": "envelope.w", "side": "front", "value": 368 }
    ],
    "leader": { "x": 0, "y": 20, "z": 130, "note": "where a balloon leader lands" },
    "keepout": [                    // where a leader or note must NOT cross
      { "of": "keyfield", "note": "never run a leader over the key field" }
    ]
  },

  "colour": { "of": "led", "hex": "#4f7d4a" }   // or null; only appears in shot
}
```

### `kind` values the builder understands

| kind | what it makes | required keys |
|---|---|---|
| `box` | bevelled rectangular solid | `w h d` |
| `cyl` | upright cylinder | `r h` |
| `well` | base plate + four rim walls | `w h d wall floor` |
| `keymap` | a key field from real row specs | `u pitch cap rows` |

`fillet` is a real edge radius in mm. It is applied after the mesh is scaled — a
bevel modifier works in local space, so bevelling an unapplied unit cube turns a
keycap into an ellipsoid.

### `lod` on every part and feature

- **1** — silhouette and primary structure. Always drawn.
- **2** — features that read at normal zoom: keycaps, grilles, feet, ports.
- **3** — micro detail and annotation: seams, fasteners, dimensions, hidden edges.
  Drawn only for the object the camera is actually on.

## Rules the specs must obey

1. **A surface something stands on must be a real surface.** A solid slab has a
   flat top face, so hidden-line removal correctly draws nothing there and
   anything on it appears to float. Use `well`, or an explicit plate.
2. **Nothing may exceed the declared `envelope`.** The build asserts this.
3. **The footprint must sit inside the desk** and must not overlap another
   object's, unless `desk.mjs` declares an `on:` relationship. `check-layout.mjs`
   enforces it.
4. **Annotation keep-outs are part of the spec, not an afterthought.** A leader
   that crosses the face it is describing is a drawing error.
5. **Real dimensions only.** 19.05mm key pitch because that is the standard, not
   because it looked right.
