# Carvana × ADESA — Design System

A brand & slide-template design system for **Carvana × ADESA dual-branded**
presentations. It packages the colors, type, logo lockups, backgrounds, icons
and ready-to-use slide layouts needed to build on-brand decks for the combined
business — primarily **internal-team** presentations.

> **What this is for:** designing *new slides that match the existing Carvana ×
> ADESA template*. The canonical template is the PowerPoint file the brand team
> supplied (`templates/Carvana-x-ADESA-Template.pptx`). The HTML in `slides/`
> is a faithful recreation of that template's layouts so agents can copy
> on-brand slides quickly — **it is a reference to that template, not a new
> competing kit.**

## Context

- **Carvana** — the online used-car retailer (consumer-facing; buy/sell/finance
  a car entirely online, nationwide delivery, the car-vending-machine brand).
- **ADESA** — Carvana's wholesale vehicle **auction & reconditioning** network
  (dealer-facing; physical auction sites + reconditioning centers across the
  US). ADESA U.S. is a Carvana company.
- **Dual-brand** materials present the two together as one platform — a **dual
  logo lockup** (`CARVANA │ ADESA`) and a **shared slide template** with a
  navy + teal "shooting-star" visual system.

## Sources

| Source | What it gave us |
|---|---|
| **`templates/Carvana-x-ADESA-Template.pptx`** | The supplied dual-brand PowerPoint template — **the source of truth.** 21 slides; theme colors; embedded Barlow Condensed + Inter; logo lockups; backgrounds; icon library. Everything here is extracted from it. |
| Google Slides original | `https://docs.google.com/presentation/d/16mgPydmhDjZU8D3Yc4R7ML1VTWW8goW01U7HAn-Ce7o/edit` (sign-in required — exported to the PPTX above for access). |
| Carvana.DS (sibling system) | The standalone Carvana web design system was used for the Carvana logomark + Inter font files. Not duplicated here. |

## What's in this folder

```
README.md                  ← this file
SKILL.md                   ← agent-invocable skill descriptor
colors_and_type.css        ← thin fg1 / h1 / eyebrow convenience sheet
styles/
  tokens.css               ← import this to get fonts + colors + type + spacing
  fonts.css                ← @font-face (Inter local) + Barlow Condensed (Google)
templates/
  Carvana-x-ADESA-Template.pptx   ← canonical source template
slides/
  index.html               ← the slide kit (deck-stage) — faithful template layouts
  deck.css                 ← slide layout styles
  deck-stage.js            ← deck shell (nav, scaling, PDF export)
assets/
  lockup-dual-dark.png     ← CARVANA │ ADESA lockup, navy (for light bg)
  lockup-dual-inverse.png  ← CARVANA │ ADESA lockup, white (for navy/photo bg)
  carvana-logomark.svg     ← standalone Carvana disc-and-car mark
  bg-hero-star-right.png   ← navy shooting-star background (star at right)
  bg-hero-star-left.png    ← navy shooting-star background (star at left)
  bg-section-a/-b.png      ← navy swoosh background variants
  star-teal.png            ← solid ADESA star
  star-badge.png           ← ADESA star in a teal disc
  photo-diagonal-cars.png  ← diagonal photo cut (cars)
  photo-lot-overhead.png   ← overhead car-lot photography
  adesa-locations-map.png  ← US locations map
  avatar-placeholder.png   ← attendee silhouette placeholder
  icons/                   ← starter set of flat cyan template icons
preview/                   ← Design System tab cards
```

## Quick start

```html
<link rel="stylesheet" href="styles/tokens.css" />
```

Use the **semantic tokens** — `--brand-navy`, `--brand-teal`, `--text-on-navy`,
`--font-display`, `--space-lg`, `--radius-lg` — rather than raw values. To build
a deck, copy a `<section>` from `slides/index.html`; they're plain static HTML
inside `<deck-stage>` and edit directly.

---

## Content fundamentals

The dual brand inherits **Carvana's voice: bold, enthusiastic, helpful,
human** — never hype, never corporate stiffness. ADESA adds a businesslike,
dealer-savvy register for wholesale audiences.

- **Casing** — **Display headlines are ALL CAPS** (that's the Barlow Condensed
  look on every title/section/cover). Body copy and secondary text are
  **sentence case**. Eyebrows/overlines are uppercase + letter-spaced.
- **Voice / person** — second person ("you") for the audience; "we" only for
  the combined Carvana × ADESA team. Write like a helpful human.
- **Tone** — confident and plainspoken. Cut filler ("please note," "at this
  time," "simply," "just"). Lead with the point.
- **Contractions** — yes. "We'll," "you're," "don't."
- **Numbers & stats** — big and proud in Barlow numerals; round where it aids
  clarity (4.5M, 56, 2×). Pair each stat with a short plain-language label.
- **Ampersands** — fine on slides where space is tight ("Sell & trade",
  "Q&A"); the brand connector is the multiplication cross **"Carvana × ADESA"**.
- **Emoji** — **never.** Use the template's icon set or Lucide.
- **Punctuation** — em-dash for breaks in thought; exclamation points sparingly
  (the "Thank you!" closer is the sanctioned one); no serial comma in simple
  lists.

**Example copy (placeholder voice from the template):**

> Cover — **PRESENTATION TITLE GOES HERE** / *Secondary text can go here.*
> Section — **INTRO TITLE SLIDE CAN GO HERE** / *Secondary text can go here.*
> Headline — **HEADLINE WILL GO HERE** / *Secondary text will go here.*
> Close — **THANK YOU!**

---

## Visual foundations

### Color

- **Navy `#0D375E`** is the primary anchor — the background of every cover,
  section, agenda, quote and closing slide, and the default heading color on
  light slides. (This is Carvana's navy.)
- **Teal is ADESA's family** and the system's accent engine: **`#0C8599`
  (teal)** for accents on light slides, **`#095C6B` (dark teal)** for the inner
  swoosh, **`#3BC9DB` (cyan)** for stars, icons, highlighted words on navy, and
  index numerals.
- **Yellow `#FAB005`** is a *sparing* accent only — the halo in the Carvana
  mark, a stat underline rule. Never a fill behind text.
- **Carvana blue `#228BE6`** appears only inside the Carvana logomark disc.
- **Warm gray `#C8C4B7`** is a secondary neutral from the template theme; cool
  grays (`gray-50…800`) handle UI/structure. Canvas is white or `gray-50`.
- **No purple/blue mesh gradients.** The only gradient is the template's
  subtle photo scrim for legibility.

### Typography

- **Display: Barlow Condensed, ExtraBold (800), ALL CAPS.** Titles, headlines,
  section labels, big numerals. Condensed + heavy = the brand's loud, confident
  voice. Use it *only* at 800 and *only* uppercase.
- **Body / UI: Inter** (400 / 500 / 600 / 700). All secondary text, body,
  labels, captions, contact details.
- Headlines run tight (line-height ~0.94) with a hair of letter-spacing
  (0.01em). Body never below 15px on a slide.

### Backgrounds & the star motif

- The signature surface is **navy with a teal "shooting-star"**: a sweeping
  two-tone swoosh arc + a large five-point star peeking in from a corner.
  Provided as full-bleed PNGs (`bg-hero-star-right/-left`, `bg-section-a/-b`) —
  use them, don't redraw them.
- **Light/white slides** carry the content; navy slides carry the moments
  (cover, section, agenda, quote, Q&A, close).
- **Photography** is bright, neutral, daylit — car lots, vehicles, lanes. It's
  introduced via a **hard diagonal cut** (white triangle meets photo) rather
  than a soft fade.

### Spacing, radii, surfaces

- Spacing on an 8px-ish scale (8 → 88). Slide safe-area padding ≈ 64–80px.
- Radius default `lg` 16px for cards; `pill` for chips. Don't invent
  in-between radii.
- **Cards** are white with a 1px `gray-200` border and a colored 4px top accent
  (navy for Carvana, teal for ADESA). Shadows are rare and soft; the brand
  prefers borders over elevation.

### Motion

- Subtle and fast — content **rises + fades in** on slide entrance
  (~0.55s, ease-out, ≤16px travel). No bounce, no infinite loops. The visible
  end-state is the base style, so print/PDF and reduced-motion show content.

### Layout rules

- Fixed footer on content slides: `© 2026 Carvana × ADESA` bottom-left, page
  number bottom-right, Inter 12px.
- Logo lockups keep their natural aspect ratio — **never stretch**; size by
  height only.

---

## Iconography

- **Template icons** are flat, **filled**, friendly-**rounded** glyphs in
  **cyan `#3BC9DB`** (dollar, gauge, car, service gear, laptop-with-car,
  refresh/trade…). A starter set is copied into `assets/icons/`. Use these for
  feature rows and "how it works" moments.
- For general UI glyphs not in that set (arrows, check, chevron, x, search),
  use **Lucide** tinted teal or navy — same flat, even-weight feel.
- **The five-point star** is a brand element, not a generic icon — reserve it
  for the star motif / bullets, not arbitrary labeling.
- **Emoji:** never. **Unicode glyphs as icons:** never — always a real SVG/PNG
  icon.

---

## Index

- **Tokens & fonts** → `styles/tokens.css`, `styles/fonts.css`,
  `colors_and_type.css`
- **Canonical template** → `templates/Carvana-x-ADESA-Template.pptx`
- **Slide kit (HTML)** → `slides/index.html` (+ `deck.css`, `deck-stage.js`)
- **Logos, backgrounds, star, photos, map, icons** → `assets/`
- **Design System tab cards** → `preview/`
- **Agent skill entrypoint** → `SKILL.md`

## Caveats & substitutions

- **Barlow Condensed** is loaded from **Google Fonts** — it is the genuine
  typeface the template uses (PowerPoint embedded it), so this is a faithful
  match, not a substitution. **Inter** woff2 files are bundled locally.
- The HTML slide kit reproduces the template's **distinct layout types** (cover,
  intro/section, agenda, attendees, headline+photo, headline+bullets, two-column
  numbered, analytics, locations, Q&A, thank-you). The source PPTX also includes
  full **icon-library** reference pages and several near-duplicate background
  variants that aren't reproduced as separate HTML slides.
- The "analytics" slide uses a simple placeholder bar chart — swap in a real
  chart per deck.
