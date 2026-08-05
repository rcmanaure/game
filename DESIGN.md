# Design System — AI Dungeon Master Coterie-Sim

## Product Context
- **What this is:** An AI-narrated dark-fantasy coterie-sim — an improvising AI Dungeon Master resolves free-text player actions against a separate logic model's dice/stat checks, illustrated with generated retro-painted archetype art, played in the browser.
- **Who it's for:** 18+ TTRPG-adjacent players who want an AI-DM experience with real stakes (permadeath) and a world that remembers them across sessions.
- **Space/industry:** Dark-fantasy AI-DM games (AI Dungeon, AI Roguelite, Hidden Door) and physical TCG/TTRPG collectibles (Magic: The Gathering, tabletop RPG sourcebooks).
- **Project type:** Browser-based game (Phaser/PixiJS frontend, per `docs/designs/ai-dm-platform.md` Decision #2/#19-21).

## The One Thing
**"This feels like a real 1987 game book, not a screenshot."** Every choice below is tested against: would this look at home tucked inside an actual weathered TTRPG sourcebook from that era? If a choice reads as "modern app wearing a fantasy skin," it's wrong.

## Aesthetic Direction
- **Direction:** Period TTRPG book/card object — not a stylized modern UI, an object that could physically exist in 1987-1994.
- **Decoration level:** Expressive — aged-paper texture, painted illustration, ornamented card frames throughout.
- **Mood:** Weighty, deliberate, a little dangerous. The world doesn't rush you and doesn't forgive you.
- **Reference sites:** [Fonts In Use — AD&D 2nd Edition](https://fontsinuse.com/uses/9466/advanced-dungeons-and-dragons-2nd-edition-log) (Friz Quadrata/Romic/ITC Korinna display type, Futura body); [MTG card frame history](https://raphaelaleixo.medium.com/the-graphic-design-for-magic-the-gathering-card-frames-b3b6da4cd003) (Alpha/Beta frame construction); [Darkest Dungeon palette](https://colormagic.app/palette/671692d21fc5d72248a372c9) (referenced for dark-fantasy UI density precedent only — this system's actual palette is warmer/earthier, not cool charcoal).

## Typography
- **Display/Hero/Banners:** Cinzel — a glyphic, engraved-letterform serif that evokes Friz Quadrata's carved quality (TSR's actual 2nd Edition display face) without requiring a paid Letraset license. Used for card titles, chapter banners, chronicle names.
- **Body/Narration:** Spectral — a warm old-style serif built for long-form reading, evokes a well-set paperback page. Used for all streamed DM narration text — this carries the most reading load in the game, so legibility at length matters more than genre-flavor here.
- **UI/Labels:** Cinzel (same as display, smaller weights) — button labels, section headers.
- **Data/Tables:** Courier Prime — typewriter feel, evokes an actual physical character sheet. Used for stat blocks, dice results, resource counters. Must render tabular figures cleanly for stat alignment.
- **Code:** N/A — no developer-facing UI in this product.
- **Loading:** Google Fonts CDN — `Cinzel:wght@400;600;700;900`, `Spectral:ital,wght@0,400;0,500;0,600;1,400`, `Courier+Prime:wght@400;700`.
- **Scale:** Display 28-40px (banners/hero), body 17px @ 1.75 line-height (narration needs generous leading for long reading), UI labels 13-15px, data/stats 12-14px monospace.

## Color
- **Approach:** Restrained-warm — a small, deliberate palette, not a wide expressive range. Color is meaningful (rust = danger/blood, ochre = value/gold), not decorative.
- **Primary (parchment):** `#e8e0c9` — background, aged-paper base.
- **Ink:** `#241f1c` — primary text, borders, structural lines.
- **Rust (accent/danger):** `#8b3a2f` — banners, destructive actions, blood/Craving-adjacent UI.
- **Ochre (accent/value):** `#c9992f` — primary CTAs, gold/reward-adjacent UI.
- **Bone/olive (muted):** `#b5ab8f` — secondary borders, dividers, disabled states.
- **Semantic:** success `#5a6e3a` (olive-green, not a bright modern green — stays in-palette), warning `#c9992f` (reuses ochre), error `#8b3a2f` (reuses rust), info `#4a5a6e` (muted slate-blue, the one deliberately cooler note, reserved for pure system messages).
- **Dark mode ("night mode"):** Full inversion, not just dimming — ink and parchment swap roles (`#241f1c` becomes the background, `#e8e0c9` the text), rust/ochre shift slightly warmer/lighter (`#b0554a`, `#d9ab4a`) to hold contrast against the dark base. This is a deliberate genre choice: "night mode" reads as reading by candlelight, not as a generic OS dark-mode toggle.

## Spacing
- **Base unit:** 8px.
- **Density:** Comfortable — books and cards breathe, this is not a data-dense dashboard.
- **Scale:** 2xs(4) xs(8) sm(12) md(16) lg(24) xl(32) 2xl(48) 3xl(64).

## Layout
- **Approach:** Hybrid — strict grid for card-based screens (bestiary/codex/dossier), editorial single-column for narration/turn-resolution screens.
- **Grid (card screens):** 3 columns desktop, 2 tablet, 1 mobile — cards never shrink below a legible minimum, they reflow instead.
- **Max content width (narration):** ~620px — matches a comfortable book-page reading measure, not a wide app layout.
- **Border radius:** Minimal, mostly 0 (square) — this is a deliberate risk from the design proposal: ornamented corners (a printed flourish, not a rounded CSS radius) replace the "rounded-app-card" convention. Only true system UI chrome (tooltips, dropdowns) may use a small 2-4px radius for pure usability, never on cards or buttons.

## Motion
- **Approach:** Intentional but weighty — a deliberate risk from the design proposal. This is not a snappy modern app; transitions should feel like turning a page or placing a card down, not like a toast notification.
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out) — standard easing curves, the weight comes from duration, not exotic easing.
- **Duration:** micro(100-150ms, button press feedback) short(200-300ms, UI state changes) medium(300-450ms, panel transitions) long(400-700ms, card reveals / art transitions — the slowest tier, reserved for moments that should feel significant).
- **Reduced motion:** All durations collapse to ≤50ms (effectively instant) when `prefers-reduced-motion` is set — accessibility overrides genre flavor, always (per the accessibility checklist in `docs/research/2026-08-04-text-format-tooling-research.md`).

## Accessibility (carries forward from research already done this session)
- WCAG AA contrast (4.5:1 normal text, 3:1 large text) verified for this exact palette: parchment/ink (`#e8e0c9`/`#241f1c`) ≈ 13.8:1, well clear of AA. Rust/parchment and ochre/ink pairs must be individually re-checked per-component when implemented (some combinations, e.g. ochre text on parchment, may need a darker ochre variant to clear AA — flag at implementation time).
- Streamed narration container: `role="status"` / `aria-live="polite" aria-atomic="true"`.
- Bestiary/codex card grid: W3C APG grid pattern, roving `tabindex`.
- See `docs/research/2026-08-04-text-format-tooling-research.md` Section 4 for the full 8-item checklist.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-04 | Initial design system created via `/design-consultation` | Built on top of the already-locked art direction (Decision #16-18 in `docs/designs/ai-dm-platform.md`: retro 1980s-90s painted TTRPG book-cover style, MTG Alpha/Beta card frames). Typography and color research grounded in real TSR 2nd Edition typeface history (Friz Quadrata/Romic/ITC Korinna) and MTG Alpha/Beta frame construction, not generic "fantasy font" guesses. |
| 2026-08-04 | AI mockup generation (gstack `$D variants`) failed — OpenAI org verification required on the configured API key | Fell back to Path B (self-contained HTML preview page) per the skill's documented fallback. No mockup images exist yet; the HTML preview at generation time served the same visual-confirmation purpose. |
