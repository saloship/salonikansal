# Content brief — salonikansal.in (v2, "The Desk")

**Subject:** Saloni Kansal. Associate Consultant, Tech Risk — EY India, Digital Risk, Gurugram. Previously UI/UX and graphic design across three employers, one of them a founder's office. B.Tech IT, BVCOE New Delhi (GGSIPU). Chairperson of her university's ACM chapter. Smart India Hackathon 2024 finalist. Serious Himalayan trekker.

**Deliverable:** the string values inside `site-v2/assets/scene/content.js`. Nothing else. There is no page to lay out and no headings to invent — the eight sections, the field names and the character budgets are fixed by the build. Write to the spec in §4 and the copy drops in without a single change to the markup.

**Why this brief exists.** Saloni's own verdict on the current copy, and the whole assignment:

> "I myself could not get me to read that all is written, it could not catch my attention let alone retain it."

> "the content is so trimmed that it will not easily make sense to people as to what I have to show, I have done… to me [it] feels not trustful. I want to gain people's trust on me from this."

Two distinct failures, and they need different fixes:

- **Failure A — thin.** Claims arrive without instances, so a stranger cannot assess any of them and concludes there is nothing behind them. Fix: facts, in the long-form surfaces.
- **Failure B — flat.** Nothing on the first screen creates a reason to reach the second. Fix: specificity and stakes, in the short surfaces.

Fixing A by writing more does not fix B; fixing B by writing tighter is what caused A. The site already separates the two jobs — the surfaces are described in §3. Match copy to surface and both failures close.

---

## 1. Purpose & audience

**What the site is for:** to convert a stranger's curiosity into a conversation — an email, a LinkedIn message, or a CV download followed by one. It is not a case-study archive and it does not have to be. It has to be believable and it has to be finishable.

**Reader A — the forty-second scan.** A hiring manager, a recruiter, or a client with a tab open. On mobile as often as desktop. They will read the hero, one or two panels in the middle, and the last one. They will not tap an object. They are answering four questions in this order:

1. What is she, exactly?
2. Is she any good — what has she actually delivered?
3. Is she the kind of person I want in a room?
4. How do I reach her, and is she available?

Success: they leave with her role, her employer, one number, one artefact other people used, and a route to her inbox. Everything in the **panel layer** (`panel.eyebrow`, `panel.head`, `panel.body`) exists for this reader, and that layer must work read alone, in order, with nothing else on the page.

**Reader B — the committed reader.** Someone who has already decided she is interesting: a manager who liked the CV, a design lead, a founder. They will tap the monitor, the laptop, the notebooks, the sketchpad and the map. They want dates, employers, scope, numbers, and evidence of judgement. They are trying to work out whether she can do the work unsupervised.

Success: they arrive at the last section with a **specific** question — "tell me about the RPA audit", "can I see the policy mapping" — rather than a general good impression. Everything in the **detail layer** (`deep.*`) exists for this reader.

**A third reader worth writing for:** the person forwarding the link, and the search snippet. That is what the permanently visible `KEYWORDS` schedule and the `<meta name="description">` do. Six keyword slots is the entire ATS surface of this site; treat them as expensive.

**Tone of the ask.** She is two years into a Big Four tech risk role and openly moving toward product. The site must not apologise for the pivot and must not oversell it. The strongest version of her story is that the three things are one skill — which is exactly what her own CV line says, and the site has never said as well.

---

## 2. The attention problem, diagnosed

Nine mechanisms, each with the real text. These are the things to fix; "make it punchier" is not one of them.

### 2.1 Meta-copy — sentences about the copy instead of copy

> **`work.panel.body`:** "Real EY engagements, client names anonymised — the headline and the keywords a recruiter is scanning for."

This sentence spends 105 characters describing what the next screen contains, tells the reader they are being optimised at, and states no fact. The reader's question was "what have you done"; the answer given is "you are about to see keywords."

Same mechanism, v1:

> "A detailed portfolio — the situation, the approach, what I built — is in the works."

Both sentences would disappear entirely if replaced by one engagement stated plainly. **Rule: no sentence may describe the site. Every sentence must be the content.**

### 2.2 Headings that name a layout slot instead of making a claim

> `journey.panel.head`: **"The short version."**
> `work.panel.eyebrow`: **"The work"**
> `statement.panel.eyebrow`: **"Statement"**
> `me.panel.eyebrow`: **"A little about me"**
> `beyond.panel.eyebrow`: **"The person behind the work"**

Every one of these could sit unchanged on any portfolio ever built. They tell the reader where they are, which the reader already knows from the drawing, and they burn the largest type on the screen doing it.

The counter-example is on the same site and it is hers:

> `method.panel.head`: **"The Cold-Start Audit."**

That is a heading that makes a claim, names a thing, and creates a question the next line answers. It is the only heading on the site that earns its size. **Test in §7.F.**

### 2.3 The numbers are all behind a tap, or absent

Of eight panels, exactly one contains a numeral (`journey`: "2020 B.Tech IT · 2022 UI/UX and product · 2024 tech risk at EY"). The strongest number she has —

> **"delivered a 104-control RPA controls audit within a three-week window"** (CV)

— appears once, inside `work.deep.items[3].v`, which only opens if the reader taps the laptop. Reader A never sees it. Neither version of the site put it in the visible layer. Same for "40+ member student body", "10+ events a year", "20+ technical graphics and animations", "85.57% aggregate", "seven concepts written up, one built".

**A number is the cheapest trust there is** — it is short, it is checkable, and it survives skim-reading. The panel layer is where they belong.

### 2.4 Hedges, stacked

> "Full case studies … **are being written.** Ask me for one."
> "**Contributed to** the governance workstream"
> "These **aren't finished** case studies"
> "**half-built**, fully thought about"
> "Not full case studies **(yet)**"
> "A detailed portfolio … **is in the works**"

Each is honest. Read together — and the reader does read them together — they establish a pattern in which every claim arrives with a disclaimer, and the reader's summary becomes *nothing here is finished.* This is the direct mechanical source of "feels not trustful."

Trust does not come from hedging. It comes from one specific claim a stranger can check. **Target: at most one hedge on the whole site, and it must sit in the same sentence as something finished.**

### 2.5 Claims that stop exactly where the interesting part starts

> `hero.panel.body`: "I find where systems break, then design the replacement."

Which system. What broke. What replaced it. The sentence has a shape but no content, and it is the second sentence a stranger reads.

> `journey.deep.items[0].learned`: "Real systems are messier than any framework expects."

True, and a truism until one messy real system is named. **Rule: every abstraction gets a concrete noun inside its own sentence — a framework, an application, a count, a date, a place.**

### 2.6 The list of three that contains nothing

> `me.panel.body`: "Tech risk is the day job, and I actually enjoy it. Design and building is where I tinker after hours. The mountains are where I switch off. Different hats — but it's the same me under each one, happiest when I'm untangling something."

233 characters, four sentences, and afterwards the reader knows the *shape* of her week and not one fact. It is also, at 264 characters of head + body, **the longest type-out on the site — 2.1× the shortest** (`journey`, 124). On mobile that is 264 keystrokes of scrolling to be told she has hobbies. This is the single worst attention cost in the file and it is measurable.

Compare the line two fields away, which does the same job and does it properly:

> "Half my notebooks are wireframes for apps that don't exist yet — **and seven of them are written up. One is built.**"

Charm, then a countable. That sentence is the model for the whole rewrite.

### 2.7 The first screen answers none of the reader's four questions

v1 hero, in order: the name at display size, then "Living between control and chaos.", then "Tech risk today, product next — with design and the mountains in between."

"Living between control and chaos" is a good line — it is hers, the footer closes on it, and it should survive. But it is a *second* line. It establishes a mood where a stranger needed a role. And `hero.panel.eyebrow` currently spends its 31 characters on "Saloni Kansal · Gurugram, India" — the name, which is already the browser tab, the page title, the drawing's title block (`DRAWN: S. KANSAL`) and the footer. That is the most-read line on the site spent on the least surprising fact.

### 2.8 Nothing is ever promised, so nothing is ever awaited

Retention on a scroll-driven page is an open loop: something said early that only gets closed later. Sections 1–3 pose no question. The one genuine hook — a named method — arrives at section 4, past where Reader A has left. One number or one open question in the hero body changes the whole shape of the read.

### 2.9 Her travel writing is better than her professional writing

From `diaries/index.html`:

> "Two nights covers the main spots — stretch to four to do every trek without rushing."
> "go slow, and let the valley set the pace."
> "I went in late March, so it was cold — but only at night, perfect to explore by day and sit around a bonfire in the evening."
> "Six journeys, mostly uphill"

Dated, specific, opinionated, useful to a stranger. Then compare `work.panel.body`. **The professional sections must be written to the standard she already hits when writing about Jibhi.** That is not an outside style rule imposed on her — it is her own best register, applied to the half of the site that currently lacks it.

---

## 3. Voice

Derived from her own strongest existing lines. Every quote below is real and already in the files.

**The template for the entire site** — from her CV summary, and still the best sentence she has written about herself:

> "Comfortable moving between an audit workpaper, a wireframe, and a build."

Three concrete objects, no adjectives, no claim to be a unicorn; the reader does the inferring. Note it is currently buried in `me.deep.note`, where only a reader who taps the sketchpad will find it.

**Keep, unchanged:**

> "Living between control and chaos." — the positioning line; the footer already pays it off.
> "Systems are predictable. Humans are not." — the best head on the site.
> "Every control assumes someone will follow it. Designing for the one who won't is the job."
> "So the next person starts warm, not cold." — a value stated as a consequence, not an adjective.
> "You design for the person stuck inside the system, not the system." — an opinion with a target.
> "Risk hides at the seams and decision points."
> "Half my notebooks are wireframes for apps that don't exist yet — and seven of them are written up. One is built."

**The rules those lines imply:**

- First person. Present tense for what she does, past for what she delivered.
- 6–14 words average. One idea per sentence. Read every line aloud; if it cannot be said in one breath, cut it.
- Concrete nouns from her actual working world: *workpaper, walkthrough, hand-off, gap tracker, control, policy, wireframe, ridge, foothold*. These do more than any adjective and they signal domain membership to a specialist.
- Contractions on. Dry humour permitted once or twice per page, never in the same sentence as a claim.
- Em-dash as a turn, not as filler. No exclamation marks. No rhetorical questions.
- British/Indian professional spelling as already used (*anonymised, colour*). Keep the typographic apostrophe (`’`) — the file already uses it.

**Do / Don't, with real text:**

| Don't | Why | Do instead |
|---|---|---|
| "Real EY engagements, client names anonymised — the headline and the keywords a recruiter is scanning for." | Describes the copy; states nothing | Name the sector and the scale of one engagement, anonymised |
| "Full case studies … are being written. Ask me for one." | Promises what does not exist | Either "One is written up in full — ask and I'll send it" (only if true), or say nothing |
| "Contributed to the governance workstream of a SAM audit" | CV-honest, reads as a disclaimer on a portfolio | Say what she owned, with a count |
| "Each chapter still shows up in how I work." | Asserts a link and never shows it | Show it once, concretely: which chapter, doing what |
| "The short version." as a heading | Names the slot | A heading that is a claim, e.g. one built on "four years, three jobs, one thread" |
| "Different hats — but it's the same me under each one, happiest when I'm untangling something." | Four clauses, no fact, longest type-out on the site | Cut to one clause and hang a countable off it |
| "I find where systems break, then design the replacement." | Claim with no instance | Same sentence with one named system or one number |
| Adjectives: *meaningful, seamless, passionate, innovative, end-to-end, leverage, drive value* | None survive the read-aloud test | Nouns and numbers |

**Two words to watch.** *Clarity* and *chaos* are hers and she should keep them — but they appear in the hero, the statement and the connect head. Three uses is a motif; four is a tic. Budget: two.

---

## 4. Section-by-section spec

### 4.0 The surfaces, and how they divide the labour

Three layers, three jobs. Getting copy into the wrong one is what produced both failure modes.

| Layer | Field | Desktop | Mobile | Job |
|---|---|---|---|---|
| **Panel** | `panel.eyebrow` / `.head` / `.body` / `.links` | Floating sheet, upper-left, fixed width | The one stuck panel, **typed out character by character, coupled to scroll** | Attention. Reader A. Must work read alone, in order. |
| **Detail** | `deep.title` / `.items[]` / `.note` / `.lessons` / `.link` | Rendered inline in the panel below the body at 13px, **and** in the dialog when the object is tapped | Dialog only — the panel never shows it | Trust. Reader B. Depth goes here and only here. |
| **Schedule** | `KEYWORDS` | Permanently visible, outside the camera, legible at every zoom | Same | Scan and search. Six slots. |

**Verified mechanics the writer cannot guess:**

1. **Eight sections, fixed order, one viewport each:** `hero → me → journey → method → work → statement → beyond → connect` (`shots.js`). No section can be added, removed or reordered by copy.
2. **The desktop panel is `width:min(56ch,46vw)` with 30px side padding.** That is a text column of roughly **52 characters at 1024–1200px** and 60–62 at 1440px+. **Write to 52.** The width never grows. (The panel's *height* does grow, because the `deep` block renders inline beneath the body — but that block is a different register at 13px, and a mobile reader never sees it there.)
3. **Mobile types the panel out.** `#tw` is one fixed panel; the character count shown is a *function of scroll position*, spread across the first 62% of the section. **Characters are literally scroll distance.** A long head is a slow reveal — it must land in **30–40 characters** or it reads as interminable. Body: ~41 characters per line in a ~326px column, about four lines of room. Total head + body: **140–190 characters, hard cap 200.**
4. **`panel.body` is written with `textContent` on mobile and `innerHTML` on desktop.** Any tag in `body` renders on desktop and **prints literally as `<em>` on a phone.** Same for `panel.eyebrow` and `deep.title`. Markup is permitted **only in `panel.head`** (`<em>` for the yellow highlighter, `<br>` for a line break) because the head types as stripped plain text and is swapped for real markup once complete. **Consequence: every head must read correctly with tags removed and `<br>` replaced by a space.** Use real characters (`—`, `·`, `’`), never HTML entities — `&amp;` would print literally on mobile.
5. **Long-form lives on objects.** `sketchpad → me`, `notebooks → journey`, `monitor → method`, `laptop → work`, `map → beyond`. Tapping opens a dialog: `deep.title` + a list of `items[]`, each with optional `d` (date or kicker), `k` (heading), `r` (role/employer), `v` (body), `learned` (rendered as "Learned: …"), then optional `lessons[]`, `note`, and one `link`.
6. **The monitor is a hard-capacity surface.** `method.deep` is drawn as real SVG text on the screen. Vertical space available: 256 world mm. Current content — title, 6 items, and a 183-character note wrapping at 78 characters into 3 lines — consumes **255.2 mm.** There is 0.8 mm of headroom. **A seventh item is impossible; a fourth line of note overflows off the top of the screen.** Note cap: **234 characters.** Item `k` and `v` are drawn with *no* wrapping at all — keep each to **≤ 55 characters** or it runs off the screen edge.
7. **The `deep` text is read twice on desktop** (inline in the panel, then again in the dialog). It must therefore never reference its own position — no "as above", no "below".

**Global budgets** (measured against the current file; "now" = longest current value):

| Field | Budget | Hard cap | Now |
|---|---|---|---|
| `panel.eyebrow` | 26 | 34 — shares a row with the `SK-01 · 04/08` stamp, which cannot wrap | 32 (`connect`) |
| `panel.head` | 30–40 | 46 | 40 (`work`, `statement`) |
| `panel.body` | 110–170 | 180 | 233 (`me`) ⚠ |
| `panel.head` + `body` | 140–190 | 200 | 264 (`me`) ⚠ |
| `panel.links[].label` | 22 | 28 | 30 (`connect` email row) |
| `deep.title` | 40 | 50 | 50 (`me`) |
| `deep.label` | 18 | 22 — internal name; only surfaces if `title` is absent | 16 |
| `items[].d` | 20 | 30 | 20 |
| `items[].k` | 30 | 34 (**55 for `method`** — no wrap on the monitor) | 30 |
| `items[].r` | 55 | 62 — one line | 62 (`journey`) |
| `items[].v` | 110–170 | 180 (**55 for `method`** — no wrap) | 169 |
| `items[].learned` | 55 | 70 | 66 |
| `deep.note` | 160 | 200 (**234 for `method`**) | 183 |
| `lessons[]` | 55 | 65 — one line each | 57 |
| `KEYWORDS` joined | **64 total including the `  ·  ` separators** — the SCHEDULE rule above it is 620 units wide | — | 74 ⚠ already overruns the rule |
| `NAV[]` | 16 | 18 — `white-space:nowrap` in the rail | 15 |
| `FOOTER` | 80 | 90 | 74 |

⚠ = currently over budget. Three fixes are mandatory regardless of anything else in this brief: cut `me.panel.body`, cut `connect.panel.eyebrow`, shorten the keyword string.

---

### 4.1 `hero` — shot 1, whole sheet, nothing lit

**Job:** answer "what is this person and why keep scrolling" on one screen, and plant one number.
**Believe after it:** *She is a tech risk consultant at a Big Four in India who also designs and builds, and this page has evidence.*

| Surface | Budget | Current |
|---|---|---|
| `panel.eyebrow` | 26 | "Saloni Kansal · Gurugram, India" (31) |
| `panel.head` | 30–40, `<em>` allowed | "Living between \<em\>control\</em\> and \<em\>chaos\</em\>." (33 plain) |
| `panel.body` | 110–170, plain text | 130 |
| `panel.links` | 3 chips, ≤22 each | "See how I work" → shot 4 · "Say hello" → shot 8 · "Download CV" (PDF) |
| no `deep` | — | — |

**Facts available:** Associate Consultant — Tech Risk, EY India, Digital Risk, Gurugram, 2024–present. ITGC/ITAC, ISO 27001, cybersecurity and compliance reviews. "Comfortable moving between an audit workpaper, a wireframe, and a build." Three design employers before EY. The 104-control / three-week number.

**Direction:** keep the head. Rewrite the eyebrow to carry the *role*, not the name — the name is in the tab, the footer and the drawing's title block. Rewrite the body so a **checkable fact lands in the first eight words**; "Tech risk today, product next" is currently a plan, and a plan is not a credential. The second sentence is the right place for the one number that makes a stranger keep scrolling.

**Missing facts:** none. This section is fully writable today.

---

### 4.2 `me` — shot 2, three clusters light in turn; detail on the **sketchpad**

**Job:** convert "three interests" into "one skill".
**Believe after it:** *the mix is a capability, not indecision.*

| Surface | Budget | Current |
|---|---|---|
| `panel.eyebrow` | 26 | "A little about me" (17) — a slot label |
| `panel.head` | 30–40 | "I’ve never been just \<em\>one thing\</em\>." (31) |
| `panel.body` | **cut to ≤170** | **233 ⚠ — the worst offender in the file** |
| `deep.title` | 40 | "Where the three overlap is where I do my best work" (50) |
| `deep.items[0]` | `d` ≤20, `k` ≤30, `v` ≤170 | "At work" / "Tech risk & audit" / 56 |
| `deep.items[1]` | same | "Can’t sit still" / "Design & product" / 112 |
| `deep.items[2]` | same | "Rather be outside" / "Mountains & travel" / 52 |
| `deep.note` | 160 | the CV line (72) |
| `deep.link` | 22 | "The sketchbook — 7 concepts" → `ideas.html` (26) |

**Facts available:** seven concepts written up and one built (the Figma automation plugin, real and shippable); 20+ technical graphics and animations (CV, on neither version of the site); Figma, JS, HTML/CSS, Tailwind, Three.js; three design employers; ACM chair; SIH 2024 finalist.

**Direction:** the panel body must lose 60+ characters and gain one countable. Items 1 and 3 currently end on a sentiment; item 2 ends on "seven of them are written up. One is built." Make all three end that way — one number or one named thing each. `deep.note` holds her best sentence; leave it exactly as it is.

**Missing facts:** which single concept is worth naming in the panel; whether "one is built" should point explicitly at the Figma plugin (recommended — a built thing beats a written-up thing, and it is on GitHub).

---

### 4.3 `journey` — shot 3, the notebook stack; detail on the **notebooks**

**Job:** prove continuity and time-on-task; establish that the design years were work, not a hobby.
**Believe after it:** *she has four years of documented history at named places, and the design half is real.*

This is the trust engine of the site — the only `deep` block with the full field set (`d`, `k`, `r`, `v`, `learned`). Dates and employer names are the load-bearing wall; a reader cannot tell four months from fourteen years without them.

| Surface | Budget | Current |
|---|---|---|
| `panel.head` | 30–40 | "The short version." (18) — **slot label, replace** |
| `panel.body` | 110–170 | 106 — already carries the three dates; keep that pattern |
| `deep.items[0]` | `d`/`k`/`r`≤62/`v`≤170/`learned`≤70 | "2024 — now" / "Tech Risk Consulting" / "Associate Consultant · EY India, Digital Risk" (45) / 156 / 52 |
| `deep.items[1]` | same | "2022 — 2024" / "UI / UX & Graphic Design" / "Digital Paani · Zobyt Technologies · Stych (Founder’s Office)" (61) / 169 / 66 |
| `deep.items[2]` | same | "2020 — 2024" / "B.Tech, Information Technology" / "Chairperson, ACM Chapter · Smart India Hackathon 2024 Finalist" (62 — at the cap) / 151 / 49 |

**Facts available:** all three date ranges. EY India · Digital Risk. **Three** design employers — Digital Paani, Zobyt Technologies, Stych (Founder's Office); v1 listed only two, and the founder's office is the most interesting of the three and has never had a sentence of its own anywhere. BVCOE New Delhi (GGSIPU), 85.57% aggregate. ACM chair 2022–2023: 40+ member body, 10+ events a year, sponsors and logistics, the annual coding symposium. SIH 2024 finalist.

**Fix a live inconsistency:** v1 says "30+ volunteers", v2 says "40+ member body", the CV says "40+ member student body". Pick one and use it everywhere. A reader who cross-checks LinkedIn will see whichever number is wrong.

**Missing facts — highest-value gap on the site:**
- **Month-level dates and the nature of the three design roles.** Three employers in 24 months invites the wrong inference. If any were internships or contracts, one clause saying so removes the doubt completely and costs nothing.
- One sentence about what a founder's office actually meant day to day at Stych.
- Decide whether 85.57% appears at all. Recommendation: in `items[2].r` or `.v`, never in the panel.
- What the SIH 2024 entry *was*. "Finalist" is a label; one clause naming the problem is worth more than the label.

---

### 4.4 `method` — shot 4, the workpapers square up into the control table; detail on the **monitor**

**Job:** show a mind, not a CV. This is the site's strongest asset and the only section with a real hook.
**Believe after it:** *she has a repeatable way of working, and it produced artefacts other people now use.*

| Surface | Budget | Current |
|---|---|---|
| `panel.eyebrow` | 26 | "★ A method I actually use" (25) — **keep**; it pre-empts "did you invent this for the portfolio?" in five words |
| `panel.head` | 30–40 | "The \<em\>Cold-Start\</em\> Audit." (21) — **keep** |
| `panel.body` | 110–170 | 142 |
| `deep.title` | 40 | "The Cold-Start Audit" (20) |
| `deep.items[0..5]` | **`k` ≤55, `v` ≤55, no wrapping, exactly 6 items** | "01 · Map the actuals" / "What really happens, not what the document says." … through "06 · Leave a template" / "So the next person starts warm, not cold." |
| `deep.note` | **≤234 — the monitor is at 255.2 of 256 mm** | 183 |

**Facts available:** the six steps. A reusable **control-to-policy-to-evidence mapping** "that made later reviews quicker". **Testing templates and a gap tracker the wider team reused.** An ISO 27001 policy set written from scratch.

**Direction:** the six steps are verbs anyone could have written; `deep.note` is the only line proving they produced anything, which is why it sits on the same screen one rule below them. Do not move it and do not weaken it. The panel body's "sometimes I get handed something no one has audited before" is the site's best hook and is currently **unattached to any real engagement**.

**Missing fact — the single highest-leverage answer she can give:**
- **Was the RPA controls audit a genuine cold start?** If yes, the method section and the strongest number on the CV lock together — "104 controls, three weeks, nothing to start from" — and the whole page changes character. She must confirm this rather than have it assumed.
- "shared around the team" — how many people, or which team, if she is allowed to say.

---

### 4.5 `work` — shot 5, projects as clean screens; detail on the **laptop**

**Job:** put the field's vocabulary and the *scale* of her engagements where a specialist can assess them.
**Believe after it:** *she has run four real engagements against a named framework, at a scale I can judge.*

| Surface | Budget | Current |
|---|---|---|
| `panel.eyebrow` | 26 | "The work" (8) — slot label |
| `panel.head` | 30–40 | "What I do, in the language of the field." (40) |
| `panel.body` | 110–170 | 105 — **meta-copy, rewrite entirely (see §2.1)** |
| `deep.title` | 40 | "Selected work" (13) |
| `deep.items[0..3]` | `k` ≤30, `v` ≤170 | "Policy from Zero" / 94 · "SAM Governance Audit" / 68 · "ITGC Testing & Templates" / 100 · "RPA Controls Audit" / 71 |
| `deep.note` | 160 | 169 — **currently promises case studies that do not exist** |
| `deep.link` | 22 | "The concepts & experiments" → `ideas.html` (26) |

**Facts available (all four rows are on the CV):** ISO 27001 policy set from scratch plus the control-to-policy-to-evidence mapping; SAM audit governance workstream; ITGC/ITAC across enterprise applications plus testing templates and a gap tracker the wider team reused; **104 controls delivered in a three-week window** on the RPA audit. Note that the numbers now in `work.deep` were lifted from the CV during the v2 build and **she has not yet verified the wording** — she must.

**Missing facts — this is the section most starved of them:**
- **Sector and size per engagement, anonymised.** "A listed Indian manufacturer, ~8,000 users" makes a row assessable; a bare keyword does not.
- **Which applications and platforms she may legally name** — SAP, Oracle, Workday, ServiceNow, and the RPA tool (UiPath / Automation Anywhere / Blue Prism). These are the most-searched words in her field and **not one of them appears anywhere on the site or the CV.** Whatever confidentiality allows.
- Counts: how many policies in the ISO 27001 set; how many applications in ITGC scope; how many controls tested in total.
- **Her role per row, stated plainly:** owned / co-owned / contributed. "Contributed to the governance workstream" is currently the weakest verb on the site; if that is genuinely the honest verb for the SAM row, that row should sit last.
- **One case study, written** — or the note's promise changes. Pick the engagement, confirm she can publish it, and either link it or delete the promise. Nothing may promise content that does not exist at publish.

---

### 4.6 `statement` — shot 6, hard pull back, nothing lit

**Job:** one line that stays with the reader, and a point of view that bridges audit to product.
**Believe after it:** *she thinks about the human inside the system — which is unusual for an auditor and is exactly why the product move makes sense.*

| Surface | Budget | Current |
|---|---|---|
| `panel.eyebrow` | 26 | "Statement" (9) — **the weakest word on the site; it labels the furniture** |
| `panel.head` | 30–40, `<br>` allowed | "Systems are predictable.\<br\>Humans are \<em\>not\</em\>." (40) — **do not touch** |
| `panel.body` | 110–170 | 89 |
| no `deep` | — | this is a pure attention beat |

**Direction:** the only change needed is the eyebrow — use its 26 characters to attribute the belief to experience rather than to name the section. The head is the best-written thing on the site. The body ("Every control assumes someone will follow it. Designing for the one who won't is the job.") is second-best; leave it.

**Do not explain the animation.** At this section the workpapers that assembled into the control table come apart again. The copy must not narrate that; the reader either sees it or does not, and a sentence pointing at it kills it.

**Missing facts:** none.

---

### 4.7 `beyond` — shot 7, the map contours stand into a ridgeline; detail on the **map**

**Job:** make her memorable, and turn trekking into transferable judgement rather than a hobby line.
**Believe after it:** *the judgement in the method section came from somewhere real, and I want to talk to this person.*

| Surface | Budget | Current |
|---|---|---|
| `panel.eyebrow` | 26 | "The person behind the work" (26) |
| `panel.head` | 30–40 | "Beyond the \<em\>frameworks\</em\>." (22) |
| `panel.body` | 110–170 | 145 |
| `deep.title` | 40 | "Collecting stories" (18) |
| `deep.items[0..3]` | `k` ≤30, `v` ≤170 | "Macleodganj — Triund" / "Jul 2024 · 2850m" · "Chopta & Tungnath" / "May 2024 · 3680m" · "Jibhi" / "Mar 2024" · "Kheerganga trek" / "Kasol" |
| `deep.lessons[0..2]` | 3 × ≤55, one line each | 57 / 51 / 46 |
| `deep.note` | 160 | 106 |
| `deep.link` | 22 | "Read the full diaries" → `diaries/` |

**Facts available:** Triund 2,850 m, Jul 2024. Tungnath/Chandrashila 3,680 m, May 2024. Deoriatal 2,438 m. Jibhi, Mar 2024. Kheerganga 2,850 m, Kasol — dated **July 2022** in the diaries. Jaipur Jan 2024, Kerala/Munnar Mar 2022. Six journeys total, and the diaries' own line "Six journeys, mostly uphill" is the best travel sentence she has.

**Fix:** item 4 has a place where a date should be (`k`: "Kheerganga trek", `v`: "Kasol") while items 1–2 carry date + altitude. Inconsistency in the one place on the site that uses numbers is expensive. **Give all four items the same `date · altitude` shape** — the diaries already hold the data.

**Direction:** the three `lessons` are the load-bearing lines of this section — they are the only thing turning trekking into an argument about her judgement. Right now they are generic enough to be fortune cookies ("How to trust your instincts when the data runs out."). **Anchor each to the trek that taught it.** Three edits of ~55 characters each convert the section from hobby to evidence.

**Missing facts:** which trek taught which lesson; whether she wants a countable ("six journeys", a total altitude, a number of summits).

---

### 4.8 `connect` — shot 8, the desk resolved, lamp on

**Job:** convert. This panel is also reused as the contact dialog when "Say hello" is clicked, so its `links` do double duty.
**Believe after it:** *there is a specific thing I can ask her for, and a person who will reply.*

| Surface | Budget | Current |
|---|---|---|
| `panel.eyebrow` | **cut to ≤26** | "Let’s build something meaningful" (32 ⚠) — and "meaningful" is a §3 banned adjective |
| `panel.head` | 30–40 | "Bringing clarity \<em\>in chaos\</em\>." (26) |
| `panel.body` | 110–170 | 128 |
| `panel.links` | 6 chips, ≤22 each | email · LinkedIn · GitHub · Dribbble · Instagram · CV (PDF) |

**Direction:** the body currently offers "a good conversation — risk, product, design, travel, or a team that needs a few hats worn at once", which hands the reader five options and makes deciding their job. **Name one or two things to ask for**, and give the reader a sentence they can copy into an email. One concrete offer beats five vague ones.

**Missing facts:**
- **Is she open to work, and to what?** Full-time product roles, freelance design, audit contracts, or none of the above — the site never says, so a reader who wants to hire her cannot tell whether to bother. One clause fixes it.
- A response-time promise, if she will honour it ("I reply within a day").
- Whether the personal Instagram handle (`@saloni_falls`) belongs on a professional page, and whether Dribbble is current enough to link. A dead link is a trust cost.

---

### 4.9 Copy that lives outside `content.js`

Small, permanent, and easy to forget. Flag any change here separately, because it is a code edit rather than a data edit:

- `KEYWORDS` (in `content.js`, but rendered onto the sheet): `IT AUDIT · ISO 27001 · ITGC · ITAC · PRODUCT · DESIGN · TREKKING`.
- `NAV`: Home · Me · Journey · How I work · Things I’ve made · Statement · Life & stories · Say hello. Hers, and better than the build's own shot names — keep.
- `FOOTER`: "Made by Saloni Kansal · with ♥, somewhere between control and chaos".
- `lab.html`, hard-coded: the mobile hint line "TAP ANY OBJECT TO JUMP TO ITS SECTION · ⊕ MORE MARKS EXTRA DETAIL"; the contact dialog title "Say hello"; the jump sheet's "Jump to"; the object markers "MORE" and "GO".
- `sheet.mjs`, hard-coded drawing furniture: the sheet title "WORKSTATION — GENERAL ARRANGEMENT"; `DRAWN: S. KANSAL`; the bill of materials descriptions ("CONTROL MATRIX — DISPLAY", "WORKPAPERS, LOOSE", "SKETCHPAD, OPEN", "NOTEBOOKS, DATED", "MAP, PART FOLDED", "BINOCULARS 8×42", "PAINT SET, TRAVEL", "WHITEBOARD — LANDSCAPE MAP"); the revision table; the four general notes.
- `<title>`, `<meta name="description">` and the Open Graph title/description — currently "Tech risk & IT audit, heading into product and design. I find where systems break — then design the replacement." This is the forwarded-link and search-result surface and it needs the same number treatment as the hero.

---

## 5. The trust inventory

Everything concrete she has, where it comes from, and where it belongs. **Nothing in this table needs to be invented — only placed.**

| Asset | Source | Belongs in | Status |
|---|---|---|---|
| Associate Consultant — Tech Risk, EY India · Digital Risk, 2024–present | CV, site | `journey.deep.items[0].r`; **and the hero body** | On site |
| **104-control RPA controls audit within a three-week window** | CV | `work.deep.items[3].v` ✓; **candidate for `method.panel.body` and the hero** | Added in v2, **wording unverified by her** |
| **Reusable control-to-policy-to-evidence mapping** "that made later reviews quicker" | CV | `method.deep.note` ✓ + `work.deep.items[0].v` ✓ | The best single proof of her step six |
| **Testing templates + a gap tracker the wider team reused** | CV | `method.deep.note` ✓ + `work.deep.items[2].v` ✓ | Strongest evidence that her work outlives the engagement |
| ISO 27001 IT policy set written from scratch | CV, site | `work.deep.items[0]` ✓, `journey.deep.items[0].v` ✓, `KEYWORDS` ✓ | On site |
| ITGC/ITAC across enterprise applications; cybersecurity & compliance reviews; gap analysis | CV, site | `work.deep.items[2]` ✓, `journey.deep.items[0].v` ✓, `KEYWORDS` ✓ | On site |
| SAM audit — governance workstream | CV, site | `work.deep.items[1]` | Weakest verb of the four; needs a scale number or it goes last |
| **Three** design employers: Digital Paani · Zobyt Technologies · **Stych (Founder's Office)** | CV | `journey.deep.items[1].r` ✓ | Third employer absent from v1; the founder's office has never had a sentence anywhere |
| 20+ technical graphics and animations | CV only | `journey.deep.items[1].v` or `me.deep.items[1].v` | **On neither version of the site** |
| Front-end implementation: HTML/CSS/JS, Tailwind, **Three.js**, Figma, research, rapid prototyping | CV | `journey.deep.items[1].v`, `me.deep`, `KEYWORDS` | Partial. Three.js is what this site is built with — say so if true |
| B.Tech IT, BVCOE New Delhi (GGSIPU), 2020–2024 | CV, v2 | `journey.deep.items[2]` ✓ | Institution added in v2 |
| 85.57% aggregate | CV only | `journey.deep.items[2].r` or `.v` | **Nowhere on the site — decide** |
| ACM Student Chapter Chairperson 2022–2023 · 40+ members · 10+ events/year · sponsors & logistics · annual coding symposium | CV, site | `journey.deep.items[2].r` + `.v` ✓ | **Number conflict: 30+ vs 40+** |
| Smart India Hackathon 2024 finalist | CV, site | `journey.deep.items[2].r` ✓ | Label only — never says what the entry was |
| 7 concepts written up, 1 built (Figma automation plugin) | `ideas.html` | `me.deep.note` + `.link` ✓, `work.deep.link` ✓ | The "one is built" is the most checkable claim on the site |
| Treks with dates and altitudes: 2,850 m · 3,680 m · 2,438 m; six journeys | site + diaries | `beyond.deep.items` ✓ + `lessons` | Item 4 missing its date/altitude |
| Contact: salonikansal.in@gmail.com · LinkedIn · GitHub `saloship` · Dribbble · Instagram · CV PDF · saloship.github.io | CV, site | `connect.panel.links` ✓ | Complete |

**Not in the inventory, and each one is a trust asset she does not currently have:** any certification; any named application or platform; sector and scale per engagement; one finished case study; **one sentence of corroboration from another human.** Nothing on the site is vouched for by anyone but her — that is the largest single trust gap, and it costs one sentence to close.

---

## 6. What she still needs to write or decide

Only she can answer these. Each is one or two sentences of input, and each has a named destination.

1. **Certifications** — held or in progress? ISO 27001 LA/LI, CISA, CIA, ISACA membership, internal EY badges. Even "CISA — sitting it in November" is a trust asset. → `KEYWORDS` + `journey.deep.items[0].r`
2. **Named platforms and applications** she may legally list (SAP / Oracle / Workday / ServiceNow / the RPA tool). Currently zero appear anywhere. → `work.deep.items[].v`, `KEYWORDS`
3. **Sector and scale per engagement**, anonymised — industry, rough user or entity count. → `work.deep.items[].v`
4. **Was the RPA audit a genuine cold start?** If yes, say so — it welds the method to the best number. → `method.panel.body`
5. **One case study: which, and can it be published?** If not, the note's promise must go. → `work.deep.note` (+ a new page)
6. **Her role per engagement** — owned / co-owned / contributed, one word each. → `work.deep.items[]`
7. **The three design roles**: month-level dates, and whether any were internships or contracts. Plus one sentence on what the founder's office at Stych actually involved. → `journey.deep.items[1]`
8. **Which trek taught which lesson.** → `beyond.deep.lessons`
9. **Is she open to work, and to what kind?** Plus a response-time promise if she'll honour it. → `connect.panel.body`
10. **Two judgement calls:** does 85.57% go on the site? Does the personal Instagram belong on it? → `journey.deep.items[2]`, `connect.panel.links`
11. **One line of corroboration** she is allowed to quote — a manager on the gap tracker being reused, a colleague, a client. Nothing on the site is currently vouched for by anyone else. → `method.deep.note` or `work.deep.note`
12. **The keyword schedule has six slots and ~64 characters total.** Is TREKKING occupying a slot that a certification or a platform name should have? (TREKKING is also doing brand work, so this is a real trade-off, not a cleanup.)
13. **Which single number goes in the hero.** There is room for exactly one.

---

## 7. Acceptance criteria

Testable. Run them against the finished `content.js` before anyone looks at the page.

**A. Budgets.** Every field measured with a character count, not eyeballed, against the §4.0 table. Three mandatory reductions: `me.panel.body` from 233 → ≤170; `connect.panel.eyebrow` from 32 → ≤26; the `KEYWORDS` joined string from 74 → ≤64.

**B. Markup discipline.** No tags in any `panel.eyebrow`, `panel.body`, or `deep.title` — these render via `textContent` on mobile and would print literally. Tags only in `panel.head`, only `<em>` and `<br>`. Every head must read correctly with tags stripped and `<br>` swapped for a space. No HTML entities anywhere; real characters only. `method.deep.items[]` must be plain text — the monitor escapes markup.

**C. The forty-second test.** Read only the eight panels (eyebrow + head + body), in order, nothing else. The reader must be able to state, unprompted: **her role and employer · one number · one thing she made that other people used · one way to reach her.** If any of the four is missing, the panel layer has failed no matter how well it reads.

**D. The number test.** At least **five of eight** panels contain a numeral. Currently: one.

**E. The instance test.** No abstraction stands alone. Scan for *systems, processes, impact, clarity, meaningful, untangling, chaos* — each occurrence must have a checkable neighbour (a framework, an application, a count, a date, a place) **inside its own sentence**.

**F. The slot-label test.** No `head` or `eyebrow` may be a name for its own section. Could it appear unchanged on a stranger's portfolio? "The short version." / "The work" / "Statement" / "A little about me" fail. "The Cold-Start Audit" passes. Zero failures allowed.

**G. The apology test.** Count the hedges across the whole site — *in the works, are being written, aren't finished, half-built, contributed to, (yet), coming soon*. **At most one**, and it must share a sentence with something finished.

**H. The stranger-check test.** At least **three** claims a reader could verify without asking her: employer and dates against LinkedIn, the ACM chairpersonship, the SIH finalist listing, the GitHub repo, the built Figma plugin.

**I. Typing rhythm.** Every section's `head` + `body` between 140 and 200 characters, and **no section more than 1.4× the shortest.** Currently 264 vs 124 = 2.1×.

**J. Consistency.** Every number appears once and identically across `content.js`, the CV, and LinkedIn. The 30+/40+ volunteer conflict is a live failure. Every role has a date range; every trek has a date and, where known, an altitude.

**K. Read-aloud.** Any sentence that cannot be said in one breath is cut. Any adjective whose removal does not change the meaning is cut.

**L. The specialist test.** An IT audit manager reads `work.deep` and `method.deep` and can say what she would be able to do unsupervised in week one. A design lead reads `me.deep` and `journey.deep` and can say whether she can ship a screen. If either has to guess, the facts from §6 are still missing.

**M. No unkept promises.** No surface may point at content that does not exist at the moment of publish. That currently includes `work.deep.note` ("Full case studies … are being written") and every "(yet)" on `ideas.html`.

**N. The reason-to-scroll test.** Something in the hero body is unresolved at the end of the hero and resolved later on the page. If sections 2 through 8 could be deleted without leaving a question unanswered, the hero has no hook.
