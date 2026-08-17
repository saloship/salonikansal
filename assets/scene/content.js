/* ===========================================================================
   THE COPY — carried over from v1, held as data rather than markup
   ---------------------------------------------------------------------------
   One entry per shot, keyed to the shot ids in shots.js.

   `panel` is what the foreground sheet shows: a summary, deliberately short. The
   panel must never grow to fit long content.

   `deep` is the rest, and it belongs to an OBJECT rather than to the panel — the
   engagements live on the laptop, the six audit steps on the monitor, the trips on
   the map. That keeps the drawing load-bearing instead of decorative: the desk is
   the route to depth, not a backdrop behind it.
   =========================================================================== */

export const SECTIONS = {
  hero: {
    panel: {
      eyebrow: 'Saloni Kansal · Gurugram, India',
      /* THE MOTIF STAYS IN THE H1. A content review argued for promoting the body's second
         sentence here, because "Living between control and chaos" is a mood rather than a
         capability and carries none of her search terms. Both halves of that are true, and
         it is still the wrong trade: this line is hers, it is not a phrase anyone else is
         using, and the page is built as a loop that opens on it and closes on it. What was
         genuinely wrong was that the motif then appeared FOUR times — here, the contact
         heading, the sign-off and the footer. Twice is a refrain; four times is a tic. It now
         opens the page and closes it, and appears nowhere in between. */
      head: 'Living between <em>control</em> and <em>chaos</em>.',
      /* EY and "IT audit" moved into the first clause. The strongest trust token she owns was
         nowhere in the first thing anyone reads, and "tech risk" alone is the vaguer half of
         what she does. Costs 15 characters, which on mobile is 15 characters of scroll. */
      body: 'IT audit and tech risk at EY today, product next — with design and the mountains in between. I find where systems break, then design the replacement.',
      links: [
        { label: 'See how I work', shot: 4 },
        { label: 'Say hello', shot: 8 },
        { label: 'Download CV', href: 'assets/Saloni-Kansal-CV.pdf', download: true }
      ]
    }
  },

  me: {
    panel: {
      /* "A little about me" was a label from a template — the one eyebrow of eight doing no
         work. */
      eyebrow: 'Three things I do, one of them for money',
      /* "I've never been just one thing" is the genre's most-used opening line: every
         portfolio belonging to someone with three interests starts there, so a reader has met
         it before and it tells them nothing. Same claim, made with two nouns instead of an
         abstraction — and it sets up the body rather than restating it. */
      head: 'Auditor by day. <em>Wireframes</em> by night.',
      /* Cut from 233 characters to 121. On mobile the panel types character by character
         against scroll position, so length IS scroll distance — this was the longest body in
         the file by more than 2x and the heaviest attention cost in it. The clause that went
         ("the same me under each one") is carried better by the deep title and note below. */
      /* "I actually enjoy it" stays exactly as it is — it pre-empts the reader's assumption
         that audit is the thing she is escaping, and it is the most human clause in the file.
         "Tinker" went: two lines further down the same section says seven concepts written up
         and one built, and someone who has shipped a product does not tinker. */
      body: 'Tech risk is the day job, and I actually enjoy it. Design is where I go after hours, the mountains where I switch off.'
    },
    deep: {
      on: 'sketchpad', label: 'Three hats',
      /* v1's actual thesis, restored. My replacement — "The same person, three
         problems" — described the layout instead of making the argument. */
      /* Made falsifiable. "Where the three overlap is where I do my best work" is the
         intersection-of-skills claim every generalist makes and almost none of them evidence,
         and a reader's honest response is "so what?". The overlap has actual evidence one
         section along — the Cold-Start Audit is product thinking applied to audit work — so
         naming it that way turns the claim into a promise the page keeps. */
      title: 'The overlap has a name: I audit like a product designer',
      items: [
        { d: 'At work', k: 'Tech risk & audit', v: 'I read how systems are built, and find where they break.' },
        { d: 'Can’t sit still', k: 'Design & product', v: 'Half my notebooks are wireframes for apps that don’t exist yet — and seven of them are written up. One is built.' },
        { d: 'Rather be outside', k: 'Mountains & travel', v: 'A free weekend, and I’m on a trail in the Himalayas.' }
      ],
      /* Her CV's own summary line, which is sharper than anything either site had. The tools
         follow it because there was no tools list anywhere on the web — a hiring manager
         scanning for a stack found nothing at all. */
      /* Was "Comfortable moving between an audit workpaper, a wireframe, and a build" — lifted
         from the CV, and the one place on the page that stops sounding like her and starts
         sounding like a summary field. It also hedges: "comfortable moving between" is a
         claim about her feelings, where the same fact stated as a week's work is a claim about
         her output. The stack list stays; it was the only place on the whole web a hiring
         manager could find one. */
      note: 'Same week, I’ll write an audit workpaper, a wireframe, and the code that runs it. Figma, JavaScript, HTML/CSS, Tailwind, Three.js.',
      link: { label: 'The sketchbook — 7 concepts', href: 'ideas.html' }
    }
  },

  journey: {
    panel: {
      eyebrow: 'How I got here',
      /* The dates go on the one guaranteed-visible surface. The previous body here
         was filler — "three chapters, in order" — standing exactly where the facts
         should have been. A reader cannot tell four months from fourteen years
         without a date, and dates are the load-bearing wall of credibility. */
      /* "The short version." described the format of what followed instead of carrying an idea,
         which made it the one heading on the page a reader could skip with nothing lost — the
         single thing a heading must never be. The route itself is the interesting part: almost
         nobody arrives in audit from design. */
      head: 'IT, then design, then <em>risk</em> — in four years.',
      /* Said out loud rather than tabulated. The facts are identical — 2020, 2022, 2024, the
         degree, the discipline, the employer — but a row of dates separated by middots is a
         CV field, and this page is meant to sound like her talking. The dates stay because
         they are the load-bearing credibility; they just stopped being a data string. */
      body: 'I started out in IT in 2020, spent 2022 designing interfaces, and landed in tech risk at EY in 2024. All three still show up in how I work.'
    },
    deep: {
      on: 'notebooks', label: 'The long version',
      title: 'How I got here',
      /* `d` = dates, `r` = role and employer, `learned` = the judgement line. All
         three were in v1 and all three were lost in the compression; they are what
         separate someone who has done the work from someone who has read about it. */
      items: [
        { d: '2024 — now', k: 'Tech Risk Consulting',
          r: 'Associate Consultant · EY India, Digital Risk',
          /* ITGC/ITAC glossed on first use. Every acronym on this page is correct for an audit
             reader and opaque to the product reader she is explicitly trying to reach, and one
             clause is the whole cost of keeping both. */
          v: 'Auditing how enterprise systems are controlled — ITGC/ITAC testing, which is the controls deciding who can change what in an enterprise system. Cybersecurity and compliance reviews, and IT policies written from scratch to ISO 27001.',
          learned: 'Real systems are messier than any framework expects.' },
        /* "(alongside the degree)" because these dates sit directly above a 2020—2024 B.Tech,
           and a careful reader notices three employers inside a full-time degree and wonders
           whether the dates are padded. They are not, and it is the more impressive reading —
           it just has to be said rather than inferred. */
        { d: '2022 — 2024 (alongside the degree)', k: 'UI / UX & Graphic Design',
          r: 'Digital Paani · Zobyt Technologies · Stych (Founder’s Office)',
          /* "20+ technical graphics and animations" is from her CV and was on neither site —
             a quantified output where everything else in this chapter was a category. */
          /* Was four verbless fragments in a row, which reads as a CV bullet cut into pieces.
             Same facts as sentences, and "Still how I think" — a conclusion the fragments had
             not earned — becomes the clause that earns it. */
          v: 'I designed interfaces and user flows, built brands from nothing, and drew 20+ technical graphics and animations. I shipped the front-end too, in HTML/CSS/JS — which is why I still sketch before I write anything.',
          learned: 'You design for the person stuck inside the system, not the system.' },
        { d: '2020 — 2024', k: 'B.Tech, Information Technology',
          r: 'Chairperson, ACM Chapter · Smart India Hackathon 2024 Finalist',
          /* 85.57% is on the CV and appeared on neither site. For an early-career profile the
             institution and the mark are trust content, not vanity. */
          /* "sponsors and logistics" cut: it is the least interesting thing about running a
             chapter and it was the only weak item in an otherwise concrete list. */
          v: 'BVCOE, New Delhi (GGSIPU), 85.57% aggregate. Led the ACM student chapter — a 40+ member body, 10+ events a year, and the annual coding symposium.',
          learned: 'Leading people is nothing like leading a process.' }
      ]
    }
  },

  method: {
    panel: {
      /* v1's badge, restored. It pre-empts the exact suspicion a reader has about a
         named framework on a personal site — did you invent this for the portfolio?
         — and answers it in five words. "How I work" is just a section header. */
      eyebrow: '★ A method I actually use',
      head: 'The <em>Cold-Start</em> Audit.',
      body: 'Sometimes I get handed something no one has audited before — no template, no map. I kept taking the same path through it, so I gave it a name.'
    },
    deep: {
      on: 'monitor', label: 'All six steps',
      title: 'The Cold-Start Audit',
      items: [
        { k: '01 · Map the actuals', v: 'What really happens, not what the document says.' },
        { k: '02 · Find the hand-offs', v: 'Risk hides at the seams and decision points.' },
        { k: '03 · Risks, bottom-up', v: 'Built from the process, not a checklist.' },
        { k: '04 · Pressure-test', v: 'Walkthroughs to check the map is true.' },
        { k: '05 · Controls & proof', v: 'What good looks like, and what evidences it.' },
        { k: '06 · Leave a template', v: 'So the next person starts warm, not cold.' }
      ],
      /* The outcome sits on the SAME screen as the steps, one rule below. Six steps
         are verbs anyone could write; this is the only line proving they produced
         anything, and v1 had it. Detached from the method it would read as a boast. */
      /* Rewritten shorter, not extended: the screen has 3 wrapped lines for this and was
         using all 3. Adding the CV's reason the mapping mattered — that it made later
         reviews quicker — had to be paid for by cutting elsewhere. 172 chars from 181. */
      /* Two fixes inside the character budget. A build does not "become" a mapping — it
         PRODUCES one, and the category error made the sentence read as though the deliverable
         and the engagement were the same thing. And "the team reused" was past tense and the
         vaguest word in a section built on specifics; "still in use" is present tense and
         says the thing step six actually claims, which is that the artefact outlived her. */
      note: 'Step six matters most. An ISO 27001 build left behind a control-to-policy-to-evidence map that made later reviews quicker; its templates and gap tracker are still in use.'
    }
  },

  work: {
    panel: {
      eyebrow: 'The work',
      /* NDA. This said "Four engagements at EY", which put a count of client engagements under
         her employer's name in a display heading — and she cannot discuss the work publicly.
         The rows below already keep client names out; a heading that attributes and counts them
         undoes that carefulness in the largest type on the section.
         So the heading names her OUTPUTS instead, which are hers to describe: controls, policy
         sets, templates. It also happens to be the better heading — it echoes step six of the
         method, "leave a template", so the two sections point at each other. The earlier version
         of this line ("What I do, in the language of the field") had its own problem: it was
         meta-commentary telling the reader to lower their expectations, immediately above the
         items that most need believing. */
      head: 'Controls, policies, and the <em>templates</em> left behind.',
      /* Was "the headline and the keywords a recruiter is scanning for" — which is me
         explaining the page's own strategy to the reader. Nobody talks like that about their
         own work, and naming the tactic out loud undercuts it. This says the same thing as
         her: four real engagements, names kept out, ask for the detail. */
      /* The count moved up into the heading, so repeating it here was redundant. The ask stays
         — but only here: it also sat in the note below, and the same hedge twice in one section
         reads as an apology rather than an invitation. */
      body: 'Client names kept out of it. These are the short versions — ask me for the long one and I’ll happily talk you through it.'
    },
    deep: {
      on: 'laptop', label: 'Four engagements',
      title: 'Selected work',
      /* Scope, not just keywords. A keyword is unassessable; "104 controls in a
         three-week window" is a competence. These numbers are on her CV and were on
         neither version of the site — SHE SHOULD VERIFY THE WORDING. */
      items: [
        { k: 'Policy from Zero', v: 'A full IT policy set written from scratch to ISO 27001 · control-to-policy-to-evidence mapping' },
        /* "Contributed to" is the weakest verb available and a reader downgrades the whole row
           on sight — three of these four name something she made and this one named something
           she was near. Dropped rather than replaced, because what she actually produced on
           this engagement is a fact only she has. SALONI: name the artefact here and this
           becomes the equal of the other three. */
        { k: 'SAM Governance Audit', v: 'Software asset management · governance workstream' },
        { k: 'ITGC Testing & Templates', v: 'ITGC/ITAC across enterprise applications · testing templates and a gap tracker the wider team reused' },
        /* "· automation controls" cut: it repeated "RPA Controls" from the row's own title and
           was there to hold a keyword. The number is the point of this row. */
        { k: 'RPA Controls Audit', v: '104 controls delivered within a three-week window' }
      ],
      /* v1 said the case studies were coming. Deleting that removed a competence
         signal — she knows four keyword rows are not a portfolio — and it removed the
         only route to ideas.html, which has seven design projects in it. */
      /* "Ask me for one" removed — the panel body above already asks, and twice in one section
         turns an invitation into an apology. The promise itself stays: the case studies are
         genuinely being written, and this is also the only route to ideas.html. */
      note: 'Full case studies — the situation, the approach, what I built — are being written. Meanwhile a pile of product and design concepts lives on its own page.',
      link: { label: 'The concepts & experiments', href: 'ideas.html' }
    }
  },

  statement: {
    panel: {
      eyebrow: 'Statement',
      head: 'Systems are predictable.<br>Humans are <em>not</em>.',
      /* My first attempt at this line was "every control I have ever written…was
         wrong somewhere". Honest, but on the page whose job is to establish
         competence a stranger reads "my controls are wrong". Same humility, moved
         off her work and onto the problem — so it now describes a skill. */
      body: 'Every control assumes someone will follow it. Designing for the one who won’t is the job.'
    }
  },

  beyond: {
    panel: {
      /* "The person behind the work" is portfolio furniture and slightly self-important; the
         section is about Saturdays, so the eyebrow may as well say so. */
      eyebrow: 'Off the clock',
      head: 'Beyond the <em>frameworks</em>.',
      /* "Taught me things no management book did" is the "no textbook prepared me for" shape —
         a construction rather than a sentence, and unfalsifiable until the lessons arrive a
         screen later. Kept the contrast, which is the narrative half, and swapped the straw man
         for the real one: frameworks are what she works inside all day, and it is the word in
         this section's own heading. */
      body: 'Between meetings and assessments, I disappear into the mountains. It’s where I think best, and where I learned more about judgement than any framework taught me.'
    },
    deep: {
      on: 'map', label: 'From the trail',
      title: 'Collecting stories',
      /* NEWEST FIRST, and every row carries a year. Both of those are the point. A date is the
         only line here a stranger can check, which is what makes this a record rather than a
         wish list — and with the newest trip at the top, a reader can tell at a glance that
         this is still happening. It read as abandoned before: every entry said 2024 while the
         drawing's own title block says 2026.
         ONE circuit is named, and only the one that was actually a circuit. Everything else was
         a separate trip, so those rows are places in a district with a year on them, never a
         route — writing them as a single journey is a small invention, and this is the section
         whose entire job is to be believed. Sethan sits on its own line rather than with the
         other Himachal places because it was a different year, which is exactly the kind of
         detail that gets flattened when rows are grouped for tidiness. */
      items: [
        { k: 'Kinnaur & Kullu', v: '2026 · Kalpa · Chitkul · Bijli Mahadev · Raghupur Fort' },
        { k: 'Sethan', v: '2025 · above Manali' },
        { k: 'The Uttarakhand circuit',
          v: '2025 · Dhanaulti · Mukteshwar · Nainital · Tehri Lake · Rishikesh · Dehradun' },
        { k: 'Macleodganj — Triund', v: 'Jul 2024 · 2850m' },
        { k: 'Chopta & Tungnath', v: 'May 2024 · 3680m' },
        { k: 'Jibhi', v: 'Mar 2024' },
        { k: 'Kheerganga trek', v: 'Kasol' }
      ],
      /* v1 had these on the ridge illustration, and they are the only lines that turn
         trekking into transferable judgement — without them the section is a hobby. */
      lessons: [
        'How to find footholds when there’s no clear path forward.',
        /* Was "How to trust your instincts when the data runs out." Generic-inspirational, and
           the worst of the three for an auditor to claim — a reader whose systems she is about
           to assess would rather she went and got more data. The judgement she actually
           exercises is the harder one, and it is the same skill in both jobs. */
        'How to tell a real signal from a story I want to be true.',
        'How to know when to pivot, and when to commit.'
      ],
      /* The trips that were not climbs live in the note rather than in the table. The table
         is the trekking record and the rows carry dates and altitudes; a city with neither
         sitting among them dilutes both. Named here, so nothing is left off the map. */
      /* The year attaches to Gokarna, Pune and Mumbai only. Jaipur and Munnar came over from v1
         with no date attached, and dating them by proximity is how a record quietly stops being
         one. */
      note: 'Also on the map: Gokarna, Pune and Mumbai in 2026 — plus Jaipur’s palaces, Kerala’s tea country in Munnar, and every emerald lake I could hike to.',
      link: { label: 'Read the full diaries', href: 'diaries/' }
    }
  },

  connect: {
    panel: {
      /* "Let's build something meaningful" is the most-used line on the internet's portfolios
         and it was the last eyebrow anyone read. This one says who the section is for. */
      eyebrow: 'Hiring, or just curious',
      /* RESTORED at Saloni's request — she likes this line, and it is hers to keep. My argument
         against it stands on the record and she has heard it: dozens of consultancies use the
         phrase verbatim, and it points the other way from the hero, which admits she is IN the
         mess rather than selling a cure for yours. Her call, and a line the author actually
         likes is worth more than one that merely survives an edit.
         The direct ask that briefly stood here moves into the body instead of being lost —
         the review's point was right that the contact section, the one place a request belongs,
         never actually made one. It reads better there anyway: headline states the disposition,
         body states the want. */
      head: 'Bringing clarity <em>in chaos</em>.',
      /* "a team that needs a few hats worn at once" — passive, and the hats end up wearing
         themselves. Otherwise the openness is the point, so it stays. */
      body: 'I’d like the next problem to be a product one — though I’m up for a good conversation either way: risk, product, design, travel, or a team that needs someone to wear a few hats at once.',
      /* The warm close, folded INTO this card rather than living in a section of its own below
         it. This card is now the footer, so the page ends here — and the line is what makes it an
         ending rather than a stop: it returns to the hero's "control and chaos", so the last
         thing read is where the first thing started. */
      /* The trailing clause went: "up for a good conversation" was already in the body of this
         same card, forty words earlier. It is a better ending without it — the line now stops
         rather than trailing off, and it is the second and last use of the motif, closing the
         loop the hero opens. */
      close: 'Still somewhere between <em>control</em> and <em>chaos</em>.',
      links: [
        { label: '✉ salonikansal.in@gmail.com', href: 'mailto:salonikansal.in@gmail.com?subject=Hi%20Saloni' },
        { label: 'LinkedIn ↗', href: 'https://www.linkedin.com/in/saloni-kansal/' },
        { label: 'GitHub ↗', href: 'https://github.com/saloship' },
        { label: 'Dribbble ↗', href: 'https://dribbble.com/saloship' },
        { label: 'Instagram ↗', href: 'https://www.instagram.com/saloni_falls/' },
        { label: 'Download CV (PDF) ↓', href: 'assets/Saloni-Kansal-CV.pdf', download: true }
      ]
    }
  }
};

/* v1 ran these as a marquee across the hero. They get their own SCHEDULE block on the
   drawing sheet, which is the one layer that sits outside the camera and is therefore
   on screen at every zoom — the marquee's actual job was to be permanently present.
   On a drawing, a schedule of parts is exactly what this is. */
export const KEYWORDS = ['IT AUDIT', 'ISO 27001', 'ITGC · ITAC', 'PRODUCT', 'DESIGN', 'TREKKING'];

/* v1's nav labels, in her voice. The shot titles ("Work", "Beyond") are the names I
   gave the sections while building; hers are what a reader should see. */
export const NAV = {
  hero: 'Home', me: 'Me', journey: 'Journey', method: 'How I work',
  work: 'Things I’ve made', statement: 'Statement',
  beyond: 'Life & stories', connect: 'Say hello'
};

/* Which section each object stands for. Every object carries a marker, so a reader can
   jump straight to the part of the story it belongs to instead of scrolling to find it. */
export const OBJECT_SECTION = {
  sketchpad: 'me', ipad: 'me',
  notebooks: 'journey', tickets: 'journey',
  monitor: 'method', papers: 'method', 'stickies-bezel': 'method',
  'stickies-wall': 'method', keyboard: 'method', whiteboard: 'method',
  /* The mouse belongs to WORK, not method, for a visibility reason rather than a semantic one.
     The parts list is fixed to the screen and blanks the right quarter of every shot; widening the
     method framing to stop the panel clipping the monitor's six audit steps pushed the mouse back
     under that table, so at its own section it could not be seen or tapped. At the work shot it
     sits clear on the left. Mouse beside the laptop is a fair grouping either way. */
  mouse: 'work',
  laptop: 'work', riser: 'work',
  /* The phone belongs to CONNECT, not to the work section. It is the object that means "reach me",
     its screen carries her socials, and tapping it opens the contact list rather than travelling
     to a section — see onObjectTap. */
  phone: 'connect',
  map: 'beyond', binoculars: 'beyond', palette: 'beyond', photo: 'beyond', plant: 'beyond',
  lamp: 'connect', mug: 'connect', bottle: 'connect', speaker: 'connect',
  headphones: 'connect', pens: 'connect'
};

/* The hero opens on "control and chaos" and v1's last line landed on it again. */
/* The warm close now lives on the connect panel as `close` — see SECTIONS.connect. It had its own
   full-height section below the drawing for a while; that read as the page stopping and then
   starting again, so it folded into the last card, which is the footer. */
/* The motif came off this line — it was the FOURTH use, arriving one line after the sign-off
   had just used it, which turned a refrain into a tic and made the page feel like it had one
   idea. The sign-off keeps it; a credit line is not where a motif wants to land. What goes
   there instead earns its place twice: a place and a year tell a reader checking whether this
   site is still current, and they are the two facts a search engine most wants in a footer. */
export const FOOTER = 'Made by Saloni Kansal · with ♥, in Gurugram · 2026';
