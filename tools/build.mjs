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

/* ONE HOME, under her own name. This used to be two URLs — a LIVE root and a /site-v2/
   PREVIEW — because the drawing was a candidate to replace a site that already existed at
   the root, so a build of it had to be publishable without competing with the incumbent for
   her name. That is settled: this is the site, it is published at /salonikansal/, and the
   preview URL and the live URL are therefore the same URL.
   Which makes the canonical self-referential, and correctly so. It pointed at the root while
   the root was the real site; leaving it there now would tell Google the authority for this
   page is the OLD site, which is the exact opposite of the intent. */
const PUBLISH = process.argv.includes('--publish');
const SITE = 'https://saloship.github.io/salonikansal/';
const CANON = SITE;

/* The only difference --publish makes now is whether crawlers are allowed in. It still has to
   be a deliberate flag rather than the default, because `node tools/build.mjs` gets run a
   dozen times while working on the drawing and none of those runs should decide indexing. */

/* Keep this in step with mountScene()'s own markup — the runtime path builds exactly this,
   and scene.js skips rebuilding when it finds .obj already present. */
const scene = () => `${GRID_DEFS}
    <rect class="gridbg" x="-800" y="-800" width="4400" height="4000" fill="url(#bp50)"/>
    <g id="camg"><g class="art" id="scene">${buildScene({ copy: { monitor: SECTIONS.method.deep } })}</g></g>
    <g class="sheet" id="furniture">${sheetFurniture(2400, 1500, { words: KEYWORDS })}</g>`;

const TITLE = 'Saloni Kansal — Tech Risk &amp; Audit, moving into Product';
/* The second half used to be a table of contents for the page — "a method I actually use, the
   work behind it, and the mountains in between". On the page that line is intriguing because
   the next sentence explains it; in a search result it is a riddle, and a riddle is not what
   makes someone click. EY, Gurugram and the two specifics she can actually be searched for go
   there instead. "The mountains in between" survives, because it is the half that sounds like
   a person rather than a directory entry. 156 characters. */
const DESC = 'Saloni Kansal — tech risk &amp; IT audit consultant at EY in Gurugram, moving '
  + 'into product and design. ITGC/ITAC, ISO 27001, and the mountains in between.';
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
<!-- These MUST match the file on disk. They said 1200 x 630 and the file is 1552 x 784 — the
     card is authored at 1200 x 630 and captured through the browser, which renders at device
     pixel ratio, so the asset comes out larger than its design size. Bigger is better here
     (it survives a retina timeline), but a declared size that disagrees with the real one is
     how a scraper ends up laying out a space the image does not fill. Re-render with
     tools/og-card.html and put the captured numbers here. -->
<meta property="og:image" content="${SITE}assets/og-cover.png"/>
<meta property="og:image:width" content="1552"/>
<meta property="og:image:height" content="784"/>
<meta property="og:image:alt" content="Saloni Kansal — tech risk &amp; audit, heading into product"/>
<meta property="og:site_name" content="Saloni Kansal"/>
<meta property="og:locale" content="en_IN"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${TITLE}"/>
<meta name="twitter:description" content="${SOCIAL}"/>
<meta name="twitter:image" content="${SITE}assets/og-cover.png"/>
<meta name="twitter:image:alt" content="Saloni Kansal — tech risk &amp; audit, heading into product"/>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Saloni Kansal",
  "url": "${CANON}",
  "image": "${SITE}assets/og-cover.png",
  "email": "mailto:salonikansal.in@gmail.com",
  "jobTitle": "Tech Risk & IT Audit Consultant",
  "worksFor": {
    "@type": "Organization",
    "name": "EY",
    "legalName": "Ernst & Young",
    "sameAs": "https://www.ey.com/"
  },
  "hasOccupation": {
    "@type": "Occupation",
    "name": "Tech Risk & IT Audit Consultant",
    "occupationLocation": { "@type": "City", "name": "Gurugram" },
    "skills": "ITGC and ITAC testing, ISO 27001 policy development, cybersecurity and compliance review"
  },
  "alumniOf": {
    "@type": "CollegeOrUniversity",
    "name": "Bharati Vidyapeeth's College of Engineering (BVCOE), New Delhi",
    "parentOrganization": {
      "@type": "CollegeOrUniversity",
      "name": "Guru Gobind Singh Indraprastha University"
    }
  },
  "address": { "@type": "PostalAddress", "addressLocality": "Gurugram", "addressCountry": "IN" },
  "nationality": { "@type": "Country", "name": "India" },
  "description": "Tech risk and IT audit consultant moving into product and design.",
  "knowsAbout": [
    "IT Audit", "IT General Controls (ITGC)", "IT Application Controls (ITAC)",
    "ISO/IEC 27001", "Technology Risk", "Governance, Risk and Compliance (GRC)",
    "Cybersecurity Compliance", "Robotic Process Automation controls",
    "Software Asset Management", "UI/UX Design", "Product Design",
    "Front-end Development"
  ],
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

/* --- 5. robots.txt and sitemap.xml, written BY the build --------------------
   The noindex meta was one of two locks and the only automatic one: robots.txt had its own
   `Disallow: /` and the build merely PRINTED a reminder to go and clear it by hand. A manual
   step in a launch checklist is a step that gets missed, and the failure here is silent — the
   site goes live, ranks for nothing, and nothing anywhere says why. Both locks now turn with
   the same flag.

   The sitemap is generated for the same reason: four URLs is a file anyone could hand-write
   once and then forget to update, and a stale sitemap is worse than none. */
const PAGES = ['', 'ideas.html', 'diaries/'];

if (PUBLISH) {
  await writeFile(join(ROOT, 'robots.txt'),
    `# Published site. ${SITE}\n` +
    `User-agent: *\n` +
    `Allow: /\n\n` +
    `Sitemap: ${SITE}sitemap.xml\n`, 'utf8');

  await writeFile(join(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    PAGES.map(p => `  <url><loc>${SITE}${p}</loc></url>\n`).join('') +
    `</urlset>\n`, 'utf8');
} else {
  /* A preview build puts the locks BACK, rather than leaving whatever the last publish wrote.
     Otherwise one --publish silently makes every later plain build indexable too. */
  await writeFile(join(ROOT, 'robots.txt'),
    `# Preview build. Not for indexing — the published site is ${SITE}\n` +
    `User-agent: *\n` +
    `Disallow: /\n`, 'utf8');
}

const kb = n => (n / 1024).toFixed(0) + 'kB';
const paths = (svg.match(/<path/g) || []).length;
const words = panels.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
console.log(`\n  index.html written from lab.html`);
console.log(`    drawing inlined   ${paths} paths, ${kb(svg.length)}`);
console.log(`    copy inlined      ${SHOTS.length} sections, ${words} words readable with no JS`);
console.log(`    page total        ${kb(out.length)}`);
console.log(`    head              real title, description, OG, Twitter, Person JSON-LD`);
console.log(`    canonical         ${CANON}  (self-referential)`);
console.log(`    og:url / assets   ${SITE}`);
console.log(`    robots meta       ${PUBLISH ? 'removed — indexable' : 'noindex kept — preview build'}`);
console.log(`    robots.txt        ${PUBLISH ? 'Allow: / + Sitemap:' : 'Disallow: /'}`);
if (PUBLISH) console.log(`    sitemap.xml       ${PAGES.length} URLs`);
console.log(`    removed           dev read-out`);
console.log(`    added             noscript notice`);
if (!PUBLISH) console.log(`\n    run with --publish to make it indexable — that rewrites robots.txt`
  + ` and writes sitemap.xml too, so there is no manual step left\n`);
else console.log(`\n    PUBLISH BUILD — robots.txt and sitemap.xml written; nothing left to do by hand\n`);
