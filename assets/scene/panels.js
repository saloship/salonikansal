/* ===========================================================================
   panels.js — the copy panels, as markup
   ---------------------------------------------------------------------------
   This was inline in lab.html and therefore ran only in the browser, which meant
   the built page shipped a 1000-path drawing and NOT ONE WORD of text: every
   panel was assembled by the module at runtime. Anything that does not execute
   JavaScript — a social scraper generating a link preview, a text-only crawler, a
   reader with scripts blocked — saw a page with a title and no body.

   For a site whose whole job is to be trusted, the writing is the part that must
   survive. So it lives here, in one exported function, called from two places:

     · tools/build.mjs  — at build time, into the served HTML
     · lab.html         — at runtime, only when the HTML arrived empty

   One definition, so the pre-rendered and the runtime markup cannot drift apart.
   =========================================================================== */

/* Sections whose deep content is ALSO drawn on a device in the scene. On desktop the
   object carries it and the panel keeps out of the way — the six audit steps were
   appearing twice, once on the monitor and once in the card. Under 760px the monitor
   is a few hundred pixels wide and unreadable, so the panel takes it back. One copy
   per viewport, never none and never two. */
export const ON_OBJECT = new Set(['method']);

const pad = n => String(n).padStart(2, '0');

/* Exported because the contact sheet builds its own links and must decide `target=_blank`
   by the same rule. Two copies of "what counts as leaving the site" is one too many. */
export const external = h => /^(https?:|mailto:)/.test(h);

/* A link with a `shot` is a jump within the page, which needs the camera, so it is a
   button. Everything else is a real href and works with no script at all. */
const linkHTML = l => l.shot !== undefined
  ? `<button class="lnk" data-goto="${l.shot}">${l.label}</button>`
  : `<a class="lnk" href="${l.href}"${l.download ? ' download' : ''}` +
    `${external(l.href) ? ' target="_blank" rel="noopener"' : ''}>${l.label}</a>`;

/* `d` (date or kicker), `r` (role and employer) and `learned` are the fields the content
   audit found missing — the dates and employers are the load-bearing credibility, and the
   learned lines are what separate having done the work from having read about it. */
const deepHTML = (d, onObject) => `<div class="deep${onObject ? ' on-object' : ''}">
  ${d.title ? `<p class="dtitle">${d.title}</p>` : ''}
  <dl>${d.items.map(i => `
    ${i.d ? `<dt class="dmeta">${i.d}</dt>` : ''}
    <dt>${i.k}</dt>
    ${i.r ? `<dd class="drole">${i.r}</dd>` : ''}
    <dd>${i.v}</dd>
    ${i.learned ? `<dd class="dlearn">Learned: ${i.learned}</dd>` : ''}`).join('')}</dl>
  ${d.lessons ? `<ul class="lessons">${d.lessons.map(l => `<li>${l}</li>`).join('')}</ul>` : ''}
  ${d.note ? `<p class="dnote">${d.note}</p>` : ''}
  ${d.link ? `<p class="dnote"><a href="${d.link.href}">${d.link.label} →</a></p>` : ''}
</div>`;

/* One viewport per shot, in the shot list's own order. The header field carries the sheet
   reference so the panel reads as part of the drawing rather than an overlay sitting on it.

   Full content, inline and open — no disclosure, no dialog. A section is as tall as it needs
   to be and the camera holds still while you read it, so there is nothing to click. Making
   the reader open a panel on every scroll was the flow-breaking part, and it was only ever
   there because the old scroll model capped a section at one viewport. */
export function panelsHTML(SHOTS, SECTIONS) {
  return SHOTS.map(s => {
    const sec = SECTIONS[s.id] || {};
    const c = sec.panel;
    /* data-side comes straight from the shot, so the panel and the camera bias that clears
       room for it are driven by ONE declaration. They used to be set independently, which is
       why the panels ended up pinned to a single side: any other arrangement collided. */
    const side = ` data-side="${s.side || 'l'}"`;
    if (!c) return `<section data-shot="${s.n}"${side}></section>`;
    return `<section data-shot="${s.n}"${side}>
    <div class="card">
      <div class="tag">
        <span class="eyebrow">${c.eyebrow}</span>
        <span class="ref">SK-01 · ${pad(s.n)}/${pad(SHOTS.length)}</span>
      </div>
      <h2>${c.head}</h2>
      <p>${c.body}</p>
      ${c.links ? `<div class="links">${c.links.map(linkHTML).join('')}</div>` : ''}
      ${c.close ? `<p class="cl">${c.close}</p>` : ''}
      ${sec.deep ? deepHTML(sec.deep, ON_OBJECT.has(s.id)) : ''}
    </div>
  </section>`;
  }).join('');
}
