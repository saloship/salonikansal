/* ===========================================================================
   build.mjs — generate index.html from lab.html
   ---------------------------------------------------------------------------
   Two jobs, and the first is the one that matters.

   1. INLINE THE DRAWING. Until now the SVG was built by a JavaScript module at
      runtime, which means that if the module fails to load — flaky network, an
      old browser, a blocked script — the visitor gets an empty navy page. There
      is no fallback because there is nothing in the HTML to fall back to.
      Inlining it makes the drawing part of the document: it paints on first
      render, in one request, and it survives JavaScript failing entirely. What
      is lost without JS is the camera and the interactions, not the site.

   2. RESTORE THE REAL HEAD. lab.html is a working page and carries a working
      title plus `noindex`. The published page needs Saloni's own title,
      description, canonical, Open Graph, Twitter card and the Person structured
      data that names her job and employer — the machine-readable EY claim that
      exists nowhere else on the site.

   lab.html stays the page that is AUTHORED; index.html is a build artifact and
   should not be hand-edited. Re-run this after changing lab.html or any module.

   Run: node tools/build.mjs
   =========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { buildScene, GRID_DEFS } from '../assets/scene/desk.mjs';
import { sheetFurniture } from '../assets/scene/sheet.mjs';
import { SECTIONS, KEYWORDS, FOOTER } from '../assets/scene/content.js';
import { SHOTS } from '../assets/scene/shots.js';
import { panelsHTML } from '../assets/scene/panels.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* PREVIEW BY DEFAULT, and deliberately so. Stripping noindex from a build that lives at
   /site-v2/ would let a copy of her portfolio into the index competing with her real site
   for her own name — which is the whole reason the guard exists. A preview build keeps
   noindex and points canonical at the preview; only --publish emits the live head.
   robots.txt disallows as well, so the preview is protected twice over. */
const PUBLISH = process.argv.includes('--publish');
const LIVE = 'https://saloship.github.io/';
const PREVIEW = 'https://saloship.github.io/site-v2/';
const SITE = PUBLISH ? LIVE : PREVIEW;

/* CANONICAL POINTS AT THE LIVE SITE EVEN IN PREVIEW — carried over from the head this build
   replaced, which had it right. A self-referential canonical on a preview says "this URL is
   the authoritative one"; pointing it at the root says "the real site is over there", so if
   the preview ever does get crawled, its signal consolidates onto her actual site instead of
   competing with it. noindex is the lock; this is the belt. */
const CANON = LIVE;

/* Keep this in step with mountScene()'s own markup — the runtime path builds exactly this,
   and scene.js skips rebuilding when it finds .obj already present. */
const scene = () => `${GRID_DEFS}
    <rect class="gridbg" x="-800" y="-800" width="4400" height="4000" fill="url(#bp50)"/>
    <g id="camg"><g class="art" id="scene">${buildScene({ copy: { monitor: SECTIONS.method.deep } })}</g></g>
    <g class="sheet" id="furniture">${sheetFurniture(2400, 1500, { words: KEYWORDS })}</g>`;

const TITLE = 'Saloni Kansal — Tech Risk &amp; Audit, moving into Product';
const DESC = 'Saloni Kansal — tech risk &amp; IT audit consultant moving into product and '
  + 'design. A method I actually use, the work behind it, and the mountains in between.';
const SOCIAL = 'Tech risk &amp; IT audit, heading into product and design. I find where '
  + 'systems break — then design the replacement.';

const head = () => `<title>${TITLE}</title>
<meta name="description" content="${DESC}"/>${PUBLISH ? '' : `
<!-- PREVIEW BUILD — canonical points at the live site; this copy must never be indexed.
     On merge: run \`node tools/build.mjs --publish\` and drop the Disallow in robots.txt. -->`}
<link rel="canonical" href="${CANON}"/>
<meta name="author" content="Saloni Kansal"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${SITE}"/>
<meta property="og:title" content="${TITLE}"/>
<meta property="og:description" content="${SOCIAL}"/>
<meta property="og:image" content="${SITE}assets/og-cover.png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="Saloni Kansal — tech risk &amp; audit, heading into product"/>
<meta property="og:site_name" content="Saloni Kansal"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${TITLE}"/>
<meta name="twitter:description" content="${SOCIAL}"/>
<meta name="twitter:image" content="${SITE}assets/og-cover.png"/>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Saloni Kansal",
  "url": "${CANON}",
  "jobTitle": "Tech Risk & IT Audit Consultant",
  "worksFor": { "@type": "Organization", "name": "EY" },
  "address": { "@type": "PostalAddress", "addressLocality": "Gurugram", "addressCountry": "IN" },
  "description": "Tech risk and IT audit consultant moving into product and design.",
  "sameAs": [
    "https://www.linkedin.com/in/saloni-kansal/",
    "https://github.com/saloship",
    "https://dribbble.com/saloship",
    "https://www.instagram.com/saloni_falls/"
  ]
}
</script>`;

const src = await readFile(join(ROOT, 'lab.html'), 'utf8');
let out = src;
const fail = m => { console.error(`\n  ✗ ${m}\n`); process.exit(1); };

/* --- 1. the drawing, inlined ---------------------------------------------- */
const STAGE = /(<svg id="stage"[^>]*>)\s*(<\/svg>)/;
if (!STAGE.test(out)) fail('could not find an empty <svg id="stage"> in lab.html');
const svg = scene();
out = out.replace(STAGE, (_, open, close) => `${open}${svg}${close}`);

/* --- 2. the writing, inlined ---------------------------------------------
   The bigger of the two omissions. Before this the built page carried a thousand-path
   drawing and not one word: every panel was assembled by the module at runtime, so
   anything that does not run JavaScript — a link-preview scraper, a text-only crawler,
   a reader with scripts blocked — got a title and an empty body. On a site whose whole
   purpose is to be believed, the writing is the part that has to survive.

   Rendered from the same module lab.html uses, so the two cannot drift apart. */
const COPY = /(<main id="copy"[^>]*>)\s*(<\/main>)/;
if (!COPY.test(out)) fail('could not find an empty <main id="copy"> in lab.html');
const panels = panelsHTML(SHOTS, SECTIONS);
out = out.replace(COPY, (_, open, close) => `${open}${panels}${close}`);

const FOOT = /(<footer id="foot"[^>]*>)\s*(<\/footer>)/;
if (FOOT.test(out)) out = out.replace(FOOT, (_, open, close) => `${open}${FOOTER}${close}`);

/* The warm sign-off needs no special handling any more: it is the `close` line on the connect
   panel, so panelsHTML carries it and it is inlined with the rest of the copy. */

/* --- 3. the real head ----------------------------------------------------- */
const NOINDEX = /<meta name="robots"[^>]*>\s*/;
if (!NOINDEX.test(out)) fail('no robots meta found — has the head already been rewritten?');
if (PUBLISH) out = out.replace(NOINDEX, '');

const OLDTITLE = /<title>[^<]*<\/title>/;
if (!OLDTITLE.test(out)) fail('no <title> found');
out = out.replace(OLDTITLE, head());

/* the dev read-out has no business on the published page */
out = out.replace(/<div id="hud"><\/div>\s*/, '');

/* --- 4. a real no-JS message --------------------------------------------- */
/* Both the drawing and the copy are inlined, so without JavaScript the visitor genuinely
   does see the desk and read everything — what they lose is the camera, the highlighting
   and the detail views. Say that, rather than leaving them wondering what broke. */
out = out.replace('</body>', `<noscript>
  <div style="position:fixed;left:0;right:0;bottom:0;z-index:20;padding:12px 16px;
              background:#f2f5f9;color:#132437;font:13px/1.5 system-ui,sans-serif">
    JavaScript is off, so the drawing is not interactive — the scene and the writing are
    all here, but the camera, the highlighting and the detail views need it.
  </div>
</noscript>
</body>`);

await writeFile(join(ROOT, 'index.html'), out, 'utf8');

const kb = n => (n / 1024).toFixed(0) + 'kB';
const paths = (svg.match(/<path/g) || []).length;
const words = panels.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
console.log(`\n  index.html written from lab.html`);
console.log(`    drawing inlined   ${paths} paths, ${kb(svg.length)}`);
console.log(`    copy inlined      ${SHOTS.length} sections, ${words} words readable with no JS`);
console.log(`    page total        ${kb(out.length)}`);
console.log(`    head              real title, description, OG, Twitter, Person JSON-LD`);
console.log(`    canonical         ${CANON}${PUBLISH ? '' : '  (live site, not this preview)'}`);
console.log(`    og:url / assets   ${SITE}`);
console.log(`    robots            ${PUBLISH ? 'indexable — PUBLISH build' : 'noindex kept — preview build'}`);
console.log(`    removed           dev read-out`);
console.log(`    added             noscript notice`);
if (!PUBLISH) console.log(`\n    run with --publish for the live head (indexable, canonical at the root)\n`);
else console.log(`\n    PUBLISH BUILD — also clear the Disallow in robots.txt before shipping\n`);
