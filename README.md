# site-v2 — "The Desk"

Work-in-progress redesign of [saloship.github.io](https://saloship.github.io). The live site is untouched until this is explicitly merged.

**Preview:** https://saloship.github.io/site-v2/
**M1 composition gate:** https://saloship.github.io/site-v2/wireframe.html

## The idea

One master illustration — a real, lived-in work desk — that the page never leaves. Every section is a camera move into a region of that desk, where objects settle, unfold, or morph into an ordered state. The visual argument for the tagline: *living between control and chaos*.

- **Chaos is density, not disorder.** A good adult work desk with a lot on it, arranged the way things land when they're used every day.
- **Colour is the reward for focus.** The scene sits in monochrome line art. When a section comes into shot, the objects it is about take *their own real colours* — paint in the pans, greens on the map, blue marker on the whiteboard. Not a blanket yellow; yellow stays the brand colour in the interface. **The world stays a sketch until you look closely, then it becomes real.**

Style reference: monoline 2.5D sketch — line-weight hierarchy and flat tone faces imply volume without shading.

## Layout

```
index.html              the site
lab.html                animation lab — where the scene and scroll engine get built
assets/scene/desk.svg   master scene, source of truth
assets/scene/scene.js   camera + morph engine
assets/scene/shots.js   shot list / storyline config
tools/build.mjs         inlines desk.svg into index.html
tools/jitter.mjs        authoring-time hand-wobble on path data
tools/check-morphs.mjs  validates matched path structure across morph variants
```

Static, zero runtime dependencies, no framework. `tools/` is the only Node, and it runs at authoring time.

## Working on it

```sh
python -m http.server 8080     # serve
node tools/build.mjs           # before committing
node tools/check-morphs.mjs    # morph variants must have matched path structure
```

## Before merging to the live site

`canonical` and the `og:*` URLs in `index.html` point at the `/site-v2/` preview path. They flip back to the root domain on merge.
