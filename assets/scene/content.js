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
      eyebrow: 'Saloni Kansal',
      head: 'Living between <em>control</em> and <em>chaos</em>.',
      body: 'Tech risk today, product next — with design and the mountains in between.',
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
      body: 'Tech risk is the day job, and I actually enjoy it. Design and building is where I tinker after hours. The mountains are where I switch off. Different hats — but it’s the same me under each one, happiest when I’m untangling something.'
    },
    deep: {
      on: 'sketchpad', label: 'Three hats',
      title: 'The same person, three problems',
      items: [
        { k: 'Tech risk & audit', v: 'I read how systems are built, and find where they break.' },
        { k: 'Design & product', v: 'Half my notebooks are wireframes for apps that don’t exist yet.' },
        { k: 'Mountains & travel', v: 'A free weekend, and I’m on a trail in the Himalayas.' }
      ]
    }
  },

  journey: {
    panel: {
      eyebrow: 'How I got here',
      head: 'The short version.',
      body: 'Three chapters, in order — and each one still shows up in how I work.'
    },
    deep: {
      on: 'notebooks', label: 'The long version',
      title: 'How I got here',
      items: [
        { k: 'Tech Risk Consulting', v: 'Auditing how enterprise systems are controlled — ITGC/ITAC testing, cybersecurity and compliance reviews, and IT policies written from scratch to ISO 27001.' },
        { k: 'UI / UX & Graphic Design', v: 'Interfaces and user flows from scratch, research, and brands built from nothing. Still how I think.' },
        { k: 'B.Tech, Information Technology', v: 'Ran the ACM student chapter — workshops, 30+ volunteers, and the annual coding symposium.' }
      ]
    }
  },

  method: {
    panel: {
      eyebrow: 'How I work',
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
      ]
    }
  },

  work: {
    panel: {
      eyebrow: 'The work',
      head: 'What I do, in the language of the field.',
      body: 'Real EY engagements, client names anonymised — the headline and the keywords a recruiter is scanning for.'
    },
    deep: {
      on: 'laptop', label: 'Four engagements',
      title: 'Selected work',
      items: [
        { k: 'Policy from Zero', v: 'ISO 27001 · IT Policy · Compliance' },
        { k: 'SAM Governance Audit', v: 'Software Asset Mgmt · IT Governance · Audit' },
        { k: 'ITGC Testing & Templates', v: 'ITGC · ITAC · Controls Testing' },
        { k: 'RPA Controls Audit', v: 'RPA · Automation Controls · IT Audit' }
      ]
    }
  },

  statement: {
    panel: {
      eyebrow: 'Statement',
      head: 'Systems are predictable.<br>Humans are <em>not</em>.',
      body: 'Every control I have ever written assumed otherwise, and every one of them was wrong somewhere.'
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
      note: 'Also on the map: Jaipur’s palaces, Kerala’s tea country in Munnar, and every emerald lake I could hike to.',
      link: { label: 'Read the full diaries', href: 'diaries/' }
    }
  },

  connect: {
    panel: {
      eyebrow: 'Let’s build something meaningful',
      head: 'Bringing clarity <em>in chaos</em>.',
      body: 'Up for a good conversation — risk, product, design, travel, or a team that needs a few hats worn at once. If that’s you, say hi.',
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

/* The keywords that ran as a marquee in v1. Here they belong in the title block's
   NOTES field, because on a drawing that is exactly what they are: the schedule of
   what this thing is made of. */
export const KEYWORDS = ['IT AUDIT', 'ISO 27001', 'ITGC · ITAC', 'PRODUCT', 'DESIGN', 'TREKKING'];
