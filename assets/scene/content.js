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
      head: 'Living between <em>control</em> and <em>chaos</em>.',
      body: 'Tech risk today, product next — with design and the mountains in between. I find where systems break, then design the replacement.',
      links: [
        { label: 'See how I work', shot: 4 },
        { label: 'Say hello', shot: 8 },
        { label: 'Download CV', href: 'assets/Saloni-Kansal-CV.pdf', download: true }
      ]
    }
  },

  me: {
    panel: {
      eyebrow: 'A little about me',
      head: 'I’ve never been just <em>one thing</em>.',
      /* Cut from 233 characters to 121. On mobile the panel types character by character
         against scroll position, so length IS scroll distance — this was the longest body in
         the file by more than 2x and the heaviest attention cost in it. The clause that went
         ("the same me under each one") is carried better by the deep title and note below. */
      body: 'Tech risk is the day job, and I actually enjoy it. Design is where I tinker after hours, the mountains where I switch off.'
    },
    deep: {
      on: 'sketchpad', label: 'Three hats',
      /* v1's actual thesis, restored. My replacement — "The same person, three
         problems" — described the layout instead of making the argument. */
      title: 'Where the three overlap is where I do my best work',
      items: [
        { d: 'At work', k: 'Tech risk & audit', v: 'I read how systems are built, and find where they break.' },
        { d: 'Can’t sit still', k: 'Design & product', v: 'Half my notebooks are wireframes for apps that don’t exist yet — and seven of them are written up. One is built.' },
        { d: 'Rather be outside', k: 'Mountains & travel', v: 'A free weekend, and I’m on a trail in the Himalayas.' }
      ],
      /* Her CV's own summary line, which is sharper than anything either site had. The tools
         follow it because there was no tools list anywhere on the web — a hiring manager
         scanning for a stack found nothing at all. */
      note: 'Comfortable moving between an audit workpaper, a wireframe, and a build. Figma, JavaScript, HTML/CSS, Tailwind, Three.js.',
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
      head: 'The short version.',
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
          v: 'Auditing how enterprise systems are controlled — ITGC/ITAC testing, cybersecurity and compliance reviews, and IT policies written from scratch to ISO 27001.',
          learned: 'Real systems are messier than any framework expects.' },
        { d: '2022 — 2024', k: 'UI / UX & Graphic Design',
          r: 'Digital Paani · Zobyt Technologies · Stych (Founder’s Office)',
          /* "20+ technical graphics and animations" is from her CV and was on neither site —
             a quantified output where everything else in this chapter was a category. */
          v: 'Interfaces, user flows and 20+ technical graphics and animations from scratch. Research, and brands built from nothing. Front-end in HTML/CSS/JS alongside design and product. Still how I think.',
          learned: 'You design for the person stuck inside the system, not the system.' },
        { d: '2020 — 2024', k: 'B.Tech, Information Technology',
          r: 'Chairperson, ACM Chapter · Smart India Hackathon 2024 Finalist',
          /* 85.57% is on the CV and appeared on neither site. For an early-career profile the
             institution and the mark are trust content, not vanity. */
          v: 'BVCOE, New Delhi (GGSIPU), 85.57% aggregate. Led the ACM student chapter — a 40+ member body, 10+ events a year, sponsors and logistics, and the annual coding symposium.',
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
      note: 'Step six matters most. An ISO 27001 build became a control-to-policy-to-evidence mapping that made later reviews quicker; testing templates and a gap tracker the team reused.'
    }
  },

  work: {
    panel: {
      eyebrow: 'The work',
      head: 'What I do, in the language of the field.',
      /* Was "the headline and the keywords a recruiter is scanning for" — which is me
         explaining the page's own strategy to the reader. Nobody talks like that about their
         own work, and naming the tactic out loud undercuts it. This says the same thing as
         her: four real engagements, names kept out, ask for the detail. */
      body: 'Four engagements at EY, with client names kept out of it. These are the short versions — ask me for the long one and I’ll happily talk you through it.'
    },
    deep: {
      on: 'laptop', label: 'Four engagements',
      title: 'Selected work',
      /* Scope, not just keywords. A keyword is unassessable; "104 controls in a
         three-week window" is a competence. These numbers are on her CV and were on
         neither version of the site — SHE SHOULD VERIFY THE WORDING. */
      items: [
        { k: 'Policy from Zero', v: 'A full IT policy set written from scratch to ISO 27001 · control-to-policy-to-evidence mapping' },
        { k: 'SAM Governance Audit', v: 'Software asset management · contributed to the governance workstream' },
        { k: 'ITGC Testing & Templates', v: 'ITGC/ITAC across enterprise applications · testing templates and a gap tracker the wider team reused' },
        { k: 'RPA Controls Audit', v: '104 controls delivered within a three-week window · automation controls' }
      ],
      /* v1 said the case studies were coming. Deleting that removed a competence
         signal — she knows four keyword rows are not a portfolio — and it removed the
         only route to ideas.html, which has seven design projects in it. */
      note: 'Full case studies — the situation, the approach, what I built — are being written. Ask me for one. Meanwhile a pile of product and design concepts lives on its own page.',
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
      eyebrow: 'The person behind the work',
      head: 'Beyond the <em>frameworks</em>.',
      body: 'Between meetings and assessments, I disappear into the mountains. Trekking taught me things no management book did — and it’s where I think best.'
    },
    deep: {
      on: 'map', label: 'From the trail',
      title: 'Collecting stories',
      items: [
        { k: 'Macleodganj — Triund', v: 'Jul 2024 · 2850m' },
        { k: 'Chopta & Tungnath', v: 'May 2024 · 3680m' },
        { k: 'Jibhi', v: 'Mar 2024' },
        { k: 'Kheerganga trek', v: 'Kasol' }
      ],
      /* v1 had these on the ridge illustration, and they are the only lines that turn
         trekking into transferable judgement — without them the section is a hobby. */
      lessons: [
        'How to find footholds when there’s no clear path forward.',
        'How to trust your instincts when the data runs out.',
        'How to know when to pivot, and when to commit.'
      ],
      note: 'Also on the map: Jaipur’s palaces, Kerala’s tea country in Munnar, and every emerald lake I could hike to.',
      link: { label: 'Read the full diaries', href: 'diaries/' }
    }
  },

  connect: {
    panel: {
      eyebrow: 'Let’s build something meaningful',
      head: 'Bringing clarity <em>in chaos</em>.',
      body: 'Up for a good conversation — risk, product, design, travel, or a team that needs a few hats worn at once. If that’s you, say hi.',
      /* The warm close, folded INTO this card rather than living in a section of its own below
         it. This card is now the footer, so the page ends here — and the line is what makes it an
         ending rather than a stop: it returns to the hero's "control and chaos", so the last
         thing read is where the first thing started. */
      close: 'Still somewhere between <em>control</em> and <em>chaos</em> — and always up for a good conversation.',
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
export const FOOTER = 'Made by Saloni Kansal · with ♥, somewhere between control and chaos';
