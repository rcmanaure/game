---
version: 1.0.0
updated: 2026-08-12
scope: public
consumed_by: docs/game-auditor.md §0
---

# PROJECT FACTS — public

The entry-contract fields for `docs/game-auditor.md` §0 that are safe in a
public repo. `rcmanaure/game` is PUBLIC (verified `gh repo view`, 2026-08-12),
so commercially sensitive fields (2, 4, 6, 7, 8) live in the gitignored
`PROJECT_FACTS.local.md`. The audit reads both files.

**Rules of this file.** Every field carries a classification (FACT / INFERENCE
/ HYPOTHESIS / OPINION / WE DON'T KNOW) and a `checked` date. A FACT names its
source. `WE DON'T KNOW` is a valid, honest answer — it is never to be replaced
with a plausible guess. Fields 2, 6, 8 and 11 are **blocking**: if any is
missing, answered `WE DON'T KNOW`, or expired, the audit stamps its verdict
**VOID** (§0 of the spec).

---

## Field 1 — Genre and 3 direct references

**Genre:** single-player, text-first AI-narrated vampire chronicle sim. The
player takes actions in prose; a server-side d20 rules engine resolves them; an
LLM narrates the outcome; permadeath ends the chronicle.
**Classification:** FACT
**Source:** `docs/production/ROADMAP.md:1` ("Roadmap — AI DM Coterie-Sim");
`src/harness/rules.ts` (d20 resolution), `src/harness/narration.ts` (LLM
narration), `src/harness/validator.ts` (active → torpor → dead permadeath).

**3 direct references:** **WE DON'T KNOW.**
No competitor game is named anywhere in the repo. `docs/research/` contains
framework and platform research, not competitive positioning.
**To resolve:** name 3 concrete games you would compete with for the same
player, with a one-line note on what each does that this does not.
**Checked:** 2026-08-12

---

## Field 3 — Art and audio production

**Art:** AI-generated at runtime, per turn, from the resolved event's
`archetype` string. Placeholder returned immediately; the real image is
generated asynchronously and pushed over WebSocket when ready.
**Classification:** FACT
**Source:** `src/harness/art.ts` (`generateArt`), `src/harness/graph.ts`
(`artTrigger` returns a `picsum.photos` placeholder),
`src/backend/graph/graph.service.ts` (`generateArtAsync`, `art:ready` emit).

**Audio:** **WE DON'T KNOW.** No audio code, assets, or dependency exists in
the repo. Whether the game has sound at all is undecided.
**To resolve:** decide whether v1 ships silent, and if not, who produces audio.
**Checked:** 2026-08-12

---

## Field 5 — Hard deadline

**Target:** 2026-Q4, Itch.io.
**Classification:** FACT (that the target is written down)
**Source:** `docs/production/ROADMAP.md:3` ("**Target Launch:** 2026-Q4 (Itch.io)").

**Is it hard, and what happens if missed:** **WE DON'T KNOW.** No document
states a consequence for missing 2026-Q4. Nothing external (funding, festival
slot, contract) is recorded as depending on the date.
**Contradiction on record:** `TODO.md` M7.1 #3 flags this target against
`src/frontend` not existing and M1.1's raw-SQL casing bug. Treat the date as
aspirational until field 2's capacity math is done against real scope.
**To resolve:** state whether the date is a commitment or a wish, and to whom.
**Checked:** 2026-08-12

---

## Field 9 — Business model and target price

**WE DON'T KNOW.**
No document states premium / F2P / early access / demo+premium, and no price
appears anywhere in the repo. Itch.io (field 10) permits pay-what-you-want,
fixed price, and free — the platform choice does not settle this.
**To resolve:** pick a model and a number. If the answer is "free", say free
explicitly; that is a valid value, not a missing one.
**Checked:** 2026-08-12

---

## Field 10 — Target platform and its requirements

**Platform:** web browser, distributed via Itch.io.
**Classification:** FACT
**Source:** `docs/production/ROADMAP.md:3`; `CLAUDE.md` Tech Stack (Locked):
"Frontend: DOM + CSS + Motion.dev".

**Implied requirements:** no console certification, no Steam Direct fee, no
platform gatekeeper review. Itch.io imposes none of the store bureaucracy the
spec's §1.7 warns about.
**Classification:** INFERENCE (from the platform choice, not from a document).

**Unaddressed by any document:** controller support, localization, minimum
browser/device targets, and whether the runtime backend (Postgres + a
per-turn LLM call) is compatible with Itch.io's static-hosting model at all.
That last one is a live structural risk: the game as built needs a server, and
nothing records who pays for or operates it.
**Classification:** INFERENCE, flagged for the audit's §1.7.
**Checked:** 2026-08-12

---

## Field 11 — What concrete decision this audit drives (BLOCKING)

**WE DON'T KNOW.**
No document states what decision an audit verdict would change, or by when.

This is a **blocking field**. Left as-is, the audit stamps **VOID** and does
not produce a usable verdict — by design (§0, decision 6A). It cannot be
derived from the repository: only the person deciding knows what they would do
differently on CONTINUE vs VALIDATE FIRST vs STOP.

**To resolve, answer both halves:**
1. The decision — e.g. "whether to build `src/frontend` at all this quarter",
   "whether to move off free-tier models", "whether to keep the 2026-Q4 date".
2. The date you will make it.

**Checked:** 2026-08-12

---

## Field status summary

| # | Field | Blocking | Status | Expires |
|---|-------|----------|--------|---------|
| 1 | Genre + 3 references | no | PARTIAL — genre FACT, references unknown | — |
| 3 | Art / audio production | no | PARTIAL — art FACT, audio unknown | — |
| 5 | Hard deadline | no | PARTIAL — date FACT, hardness unknown | — |
| 9 | Model + price | no | WE DON'T KNOW | — |
| 10 | Target platform | no | FACT + open requirements | — |
| 11 | Decision this drives | **YES** | **WE DON'T KNOW → VOID** | — |

Fields 2, 4, 6, 7, 8 are in `PROJECT_FACTS.local.md` and carry 60-day
expiry stamps (decision 2A).

**Current audit gate:** VOID on field 11.
