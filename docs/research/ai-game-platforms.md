---
status: DRAFT
---
# Research: Existing AI-Driven Game/Storytelling Platforms

**Scope:** competitive landscape analysis of primary-shipped and experimental AI game platforms, examining five core axes per platform: user-facing mechanic (free-text, branching, structured), content moderation/refusal prevention, multiplayer/session persistence, monetization, and market positioning (red ocean vs. underserved niche).

**Methodology:** primary-source research (official marketing, published interviews, pricing pages, terms of service) via WebFetch and WebSearch, August 2026. Findings below do not edit `docs/designs/ai-dm-platform.md` — this file surfaces candidates for a future `/plan-ceo-review` pass, not decisions.

---

## 1. AI Dungeon (Latitude)

**Status:** Live, production platform (since 2019). Major August 2026 update (Latitude's "Frontier") added six story models and six image models across all tiers.

### User-Facing Mechanic

Free-text player actions (the standard AI-DM pattern). No mandatory branching or structured input; players write whatever they want, the model narrates the result.

### Content Moderation / Refusal Prevention

**Private vs. Public split:** Unpublished, single-player stories are **not moderated** — no flags, suspensions, or bans for any private content. Published stories subject to community guidelines and rating checks.

**Refusal handling:** The AI has boundaries against child exploitation content specifically. On refusal, the system generates multiple possible responses per input — if one fails the filter, alternatives are attempted before falling back. Human review occurs only for published content, not private play.

**Key change from 2021 era:** Latitude now runs in-house models and third-party providers (no longer dependent on OpenAI's filtering mandate that drove the 2021 controversy). Private-content non-moderation is a deliberate product choice, not a technical limitation.

Source: [AI Dungeon Help — OpenAI and Filters](https://help.aidungeon.com/faq/openai-and-filters) · [AI Dungeon Help — Content Moderation](https://help.aidungeon.com/faq/how-does-content-moderation-work)

### Multiplayer / Session Persistence

Single-player focused. Chronicles are saved per-user account; no social/multiplayer modes shipping in the core product. (Latitude's newer Voyage platform, April 2026, is the multiplayer/world-creation offering — see Section 6 below.)

### Monetization

**Freemium + subscription tiers:**
- Free "Wanderer" tier (usable, includes Fable story model as of Frontier update)
- Journey: $14.99/mo
- Legend: $29.99/mo
- Mythic: $49.99/mo
- Ultimate: $99.99/mo

Paid tiers unlock additional models, larger context windows (up to 32K tokens), and monthly image-generation credits (480–2,750 depending on tier). Subscriptions available month-to-month or discounted 6/12-month terms.

Source: [uragent — AI Dungeon Pricing & Free Tier 2026](https://uragent.org/tools/ai_dungeon/) · [Dungeon's Deep — AI Dungeon Review 2026](https://dungeonsdeep.ai/blog/ai-dungeon-review-2026)

### Market Positioning

**Commodity offering, high adoption.** AI Dungeon remains the easiest entry point for single-player AI-DM play. The Frontier update (August 2026) was an attempt to compete with newer platforms on model quality. **Red ocean: saturated.** Every research source lists AI Dungeon as a reference point but describes it as the baseline, not the innovation leader.

---

## 2. NovelAI

**Status:** Live, production platform (text-generation and image-generation focused).

### User-Facing Mechanic

Free-text creative writing with persistent memory features. Players/authors write prose or roleplay narratives; the model continues or responds. Not a turn-based game mechanic — more akin to a collaborative writing tool with RPG elements optional.

### Content Moderation / Refusal Prevention

**Explicit adult-content positioning:** NovelAI explicitly supports adult and sensitive creative content on paid tiers **without the content-moderation friction** that disrupts workflows on platforms like Midjourney, DALL-E, and ChatGPT. Privacy-first: XSalsa20 encryption, zero training on user data, session-based generation (no persistent profiling).

No details found on refusal chains or fallback logic — the platform appears to prioritize permissiveness and privacy over explicit safety barriers.

Source: [AIVario — NovelAI Review 2026](https://aivario.com/tools/novelai) · [Top 50 AI Tools — NovelAI Pricing 2026](https://top50aitools.com/pricing/novelai)

### Multiplayer / Session Persistence

Memory features for persistent context across writing sessions (within a single narrative thread). Not marketed as multiplayer; no cross-user or shared-world mechanics found.

### Monetization

Subscription-only (no free tier):
- Tablet: $10/mo
- Scroll: $15/mo
- Opus: $25/mo (includes 8,192 tokens memory, unlimited text generation, priority image generation, unlimited image generations on supported tiers)

Source: [AI Tools DevPro — NovelAI Pricing 2026](https://aitoolsdevpro.com/ai-tools/novelai-guide/)

### Market Positioning

**Underserved niche: adult fiction + privacy.** NovelAI has carved out a defensible position by explicitly welcoming NSFW content and prioritizing encryption/privacy — a direct inverse of Midjourney/DALL-E/ChatGPT's content policies. Subscription-only (no free tier) signals targeting serious creators, not casual players. **Not a red ocean:** this niche is deliberately avoided by mainstream platforms.

---

## 3. Character.AI

**Status:** Live, production platform (20M+ monthly active users, 10M+ community characters).

### User-Facing Mechanic

Chatbot-centric, not game-like. Players chat one-on-one with AI characters (community-created or official), and conversations are the core interaction. Multi-Character Rooms (c.ai+ feature) allow simultaneous chats with multiple characters in one space, approaching roleplay but still chat-first.

### Content Moderation / Refusal Prevention

**Age-tiered system (major 2026 update):** Context-aware automated + human review + age verification via Persona. Tiered experiences: minors in "Stories Mode" (safer, reduced-inference model); verified adults get fewer restrictions.

**Restrictions (both tiers):** No non-consensual sexual content, graphic descriptions of sexual acts, or promotion/depiction of self-harm. Under-18 users cannot have open-ended conversations; open-ended roleplay is locked for minors.

No explicit multi-response generation or fallback chains mentioned; the system appears to rely on training-time filtering + runtime moderation, not prompt-engineering workarounds.

Source: [Character.AI Community Guidelines](https://character.ai/community-guidelines) · [SolidAITech — C.AI 2026 Guide](https://www.solidaitech.com/2026/06/c-ai-character-ai.html)

### Multiplayer / Session Persistence

**Multi-Character Rooms** (c.ai+ only) enable synchronous roleplay with multiple AI characters. **Chat Memories** allow characters to retain context from previous sessions, but independent 2026 testing shows inconsistent persistence across sessions. Long conversations gradually lose earlier context (context-window limit), and no platform handles long-running relationships with stable persistent memory well in 2026.

### Monetization

**Freemium + subscription:**
- Free tier: access to base characters, slower responses
- c.ai+ subscription: $9.99/mo or $94.99/yr (faster responses, improved memory, voice chat with animated expressions, multi-character rooms, Imagine Gallery for image generation)

Source: [StartupHub.ai — Character AI Review 2026](https://www.startuphub.ai/ai-news/reviews/2026/character-ai-review-2026)

### Market Positioning

**Red ocean: chatbot companions.** Character.AI competes in an oversaturated companion-chat space (competing with ChatGPT, Claude, etc.). The 20M+ user base is a strength, but the core mechanic (chat with a character) is commodity. Multi-Character Rooms and memory features are incremental innovations, not structural differentiators. **Not a game** in the turn-based RPG sense; more adjacent to gaming than part of it.

---

## 4. Hidden Door

**Status:** Live, early-access launch (full open beta scheduled later 2026).

### User-Facing Mechanic

Social text-based roleplay within licensed fictional worlds. Players select a world (Pride & Prejudice, Wizard of Oz, The Crow, originals, etc.), create characters, and respond to narrative prompts to co-create a story. Structured output: players select/respond to guided prompts rather than free-form text entry (though the specific UX is not fully detailed).

### Content Moderation / Refusal Prevention

**Proprietary story engine (not generic LLM).** Hidden Door built a custom "fractal combinatorial trope engine" — a mix of programmatic logic, classical ML, and LLMs, not pure free-text generation. Content control: the engine enforces story-world rules (e.g., "I joined the Nazis" returns "you get a bowl of nachos" — absurdist rejection, not an LLM refusal).

Community reporting for sexual/violent recruitment content (users can email support@hiddendoor.co). No explicit details on multi-response generation or retry chains, but the architecture (structured rules + LLM) suggests deterministic fallback paths exist.

Source: [Hidden Door Help — Frequently Asked Questions](https://www.hiddendoor.co/help/faq) · [Engadget — How do you prevent an AI-generated game from losing the plot?](https://engadget.com/how-do-you-prevent-an-ai-generated-game-from-losing-the-plot-170002788.html)

### Multiplayer / Session Persistence

**Social roleplay:** Players co-create stories together within worlds (implied multiplayer via shared-world mechanics, though specific details on party/grouping are not found). **Persistent progression:** accumulated lore, collected cards (characters, items, locations), and story history persist in user accounts. Cards unlock through gameplay and can be carried across stories/worlds.

### Monetization

**Freemium + subscription (Atlas):**
- Free tier: 1 free chat per day, play up to 5 worlds from catalog, create custom worlds
- Atlas (paid subscription): unlimited daily conversations, unlimited world access, enhanced creator tools, partnership/revenue-share for creators

No pay-per-turn model (explicitly stated: "never interrupted mid-story with a paywall"). Flexible billing: switch between monthly/annual anytime with prorated adjustments.

Specific subscription cost not published on pricing page.

Source: [Hidden Door Pricing](https://www.hiddendoor.co/pricing) · [Hidden Door Blog — Early Access](https://www.hiddendoor.co/blog/early-access)

### Market Positioning

**Underserved niche: licensed-fiction roleplay.** Hidden Door's moat is IP licensing (Pride & Prejudice, Wizard of Oz, etc.) + proprietary narrative engine (vs. generic LLM). Structured prompts (not free-text) reduce refusal risk. Social/multiplayer + persistent cards differentiate from AI Dungeon's single-player model. **Not red ocean:** this specific combination (licensed worlds + social RP + card collection) has limited direct competitors. Risk: IP licensing is expensive and subject to rights-holder whims.

**Note on "Waymark":** No connection found between Hidden Door and a platform called "Waymark" in 2026. Hidden Door is the actual platform name.

---

## 5. Midjourney RPG Experiments

**Status:** No shipped game product found. Experimental / investigative only.

### User-Facing Mechanic

Midjourney operates a **Storytelling Lab** — a research group building tools for AI-supported storytelling (collaborative worldbuilding, comics generation, interaction techniques for steering story text). No turn-based game or RPG product published under the Midjourney brand.

**Related:** Midjourney invested in Latitude's **Voyage** (see Section 6 below), suggesting interest in the space, but no Midjourney-branded RPG product ships.

### Content Moderation / Refusal Prevention

N/A — no shipped game product.

### Multiplayer / Session Persistence

N/A — no shipped game product.

### Monetization

N/A — no shipped game product.

### Market Positioning

**Red ocean participation (via investment).** Midjourney's Storytelling Lab is publishing research, not a consumer product. Their investment in Voyage suggests they see AI narrative gaming as strategically important, but they have not shipped a game themselves. The Lab's research may inform future Midjourney products or licensing deals, but nothing consumer-facing exists as of August 2026.

Source: [Midjourney Storytelling Lab](https://mj-storytelling.github.io/)

---

## 6. Voyage (Latitude's AI-Native RPG Platform)

**Status:** Live, expanded beta (April 2026); full open beta later 2026.

**Note:** Voyage is a separate product from AI Dungeon, both by Latitude. It represents the studio's attempt to compete in the "scripted-less AI RPG" space (distinct from AI Dungeon's single-player narrative).

### User-Facing Mechanic

Player-created worlds with AI-generated NPCs and procedural story generation. Players describe their world (regions, cities, landmarks, quests, villains, game mechanics, leveling systems), and the World Engine handles narration, NPC dialogue, and story progression. Structured input (world-builder UI) rather than free-form prompt entry.

### Content Moderation / Refusal Prevention

No specific details found. Voyage uses Google's Gemini Flash (images) and Gemma (text), suggesting reliance on Google's safety guardrails. Proprietary World Engine (developed over 5 years) likely has content-gating, but specifics not published.

### Multiplayer / Session Persistence

**Multiplayer:** Party of players can adventure together in the same world. **Persistence:** Character memories persist across interactions (World Engine maintains state). No cross-world character portability mentioned.

### Monetization

**Freemium:**
- Free to play (access worlds, create characters)
- Subscription tiers (coming later 2026): $15, $30, $50/mo (advanced AI features, increased action caps)

Source: [TechCrunch — Latitude Launches Voyage](https://techcrunch.com/2026/04/21/voyage-is-an-ai-rpg-platform-for-creating-custom-gaming-worlds-with-ai-generated-npc-interactions/)

### Market Positioning

**Direct competition to this plan.** Voyage is the most similar platform found: unscripted AI-DM on player-created worlds, multiplayer, world memory, freemium model. **Strengths:** Latitude's 5+ years of World Engine development, Google partnership (Gemini/Gemma models), multiplayer out of the gate. **Weaknesses:** Structured world-builder UI (not free-form DM improv), late-stage beta (stability risk), unknown specific pricing. **Red ocean risk: high.** If Voyage reaches maturity (full open beta 2026, Steam launch post-2026), it will directly compete on the "AI RPG with world memory" axis. This plan's differentiator (dark-fantasy IP + bestiary + permadeath + cross-playthrough NPC memory) would need to be defensible against a well-funded competitor.

---

## 7. Lore Machine

**Status:** Not found in 2026 web presence. Either pre-launch, niche, or not yet shipped.

No primary sources, pricing, features, or content policy found via WebSearch or WebFetch. If this is a real platform, it may be too new or underground to have indexed web presence. Flagged as a gap; recommend direct search if the name is a known project.

---

## 8. Market Landscape Summary

| Platform | Mechanic | Moderation | Multiplayer | Persistence | Monetization | Status | Red Ocean? |
|---|---|---|---|---|---|---|---|
| **AI Dungeon** | Free-text DM | Private unmoderated, published gated | Single-player | Per-user | Freemium + tiers ($14–$99/mo) | Live | High |
| **NovelAI** | Free-text prose/RP | Permissive (explicit NSFW support) | No | Within-session | Subscription only ($10–$25/mo) | Live | Low (niche: NSFW+privacy) |
| **Character.AI** | Chatbot (multi-char rooms) | Age-tiered + context-aware | Multi-char rooms (paid) | Inconsistent (known issue) | Freemium + subscription ($9.99/mo) | Live | High |
| **Hidden Door** | Structured prompts in worlds | Proprietary engine + rule-based | Social roleplay (unclear scope) | Cards + lore (per-world) | Freemium + subscription | Beta | Low (niche: licensed IP) |
| **Midjourney** | N/A (no shipped game) | N/A | N/A | N/A | N/A | Investing | Via Voyage |
| **Voyage** | Structured world-builder | Google guardrails (unspecified) | Yes, party-based | Character memory | Freemium + tiers ($15–$50/mo) | Beta | High (direct competitor) |
| **Lore Machine** | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |

---

## Candid Assessment: Differentiators vs. Shipping Competition

### Shipped Differentiators (This Plan)

1. **Cross-playthrough NPC memory + surfacing mechanic.** No shipped platform found with persistent NPCs that resurface across completed, separate playthroughs. Hidden Door's card collection + Voyage's character memory are within-world only. This plan's post-v1 `recall` node (named "returning face") + chronicle-ledger screen are genuinely novel.

2. **Permadeath + Torpor as core game loop stakes.** AI Dungeon and Voyage are permadeath-possible but not designed around it. Hidden Door has no explicit permadeath. This plan's permadeath mechanics (Final Death, Torpor soft-buffer, character permanence) are intentional game design, not an accident of content policy.

3. **Bestiary cache taxonomy (art cache cost control).** Decision #6's constraint (fixed archetype enum for art, free narration within) is not found explicitly elsewhere. Voyage has world-builder UI (structured), Hidden Door has worlds (licensed), AI Dungeon is pure free-text. This plan's split (bounded art keys, unbounded narration) is an underexplored middle ground.

4. **Deterministic server-side rules validator.** Hidden Door has a custom engine; AI Dungeon relies on LLM-generated JSON; Voyage's specifics are opaque. This plan's explicit `rules-validate` node rejecting schema-valid-but-rules-illegal mutations (Foundational Decision #7) is explicitly designed for fairness guarantees. Not novel architecture (Hidden Door's engine does this), but explicit in design.

### Red Ocean Risks

1. **Voyage's direct competition (multiplayer + world memory + freemium).** If Voyage reaches open beta/Steam by late 2026 and achieves product-market fit, it will own the "unscripted AI RPG with world memory" space. This plan's v1 (no persistent memory) ships after Voyage, meaning Voyage will have already seized early adopters in that niche. **Mitigation:** post-v1 `recall` node + cross-playthrough NPC memory becomes the differentiator only if this plan ships and proves itself on core DM quality first (the "minimal harness first" build-order decision already in place).

2. **Permadeath saturation in indie roguelikes.** Permadeath is not unique to AI games — it's standard in roguelikes (Hades, Dead Cells, Slay the Spire). Combining permadeath + AI DM is less novel than permadeath + deterministic rules (which most roguelikes have).

3. **Freemium + subscription monetization is table stakes.** Every platform above uses freemium or subscription; none are pay-once. This plan's one-time-unlock model (Foundational Decision #22) is a *bet against* industry standard, not a differentiation. Risk if conversion rates fall short of assumptions.

### Underserved Opportunities (Not Shipped)

1. **Dark-fantasy IP with permadeath from day one.** AI Dungeon is genre-agnostic; Hidden Door is fanfiction-licensed; Voyage is world-builder-generic. A **committed, coherent dark-fantasy setting** (not just cosmetic theming) with real stakes (permadeath, world memory, NPC vendettas) from v1 is a positioning opportunity. This plan's DESIGN.md + IP naming (the Craving, bloodlines, Veil-of-secrecy) commits to this; most competitors don't.

2. **Retro-painted art as a visual differentiator.** DESIGN.md's art direction (MTG Alpha/Beta, TSR 70s-90s painted covers) is explicitly chosen. AI Dungeon's art varies by model; Hidden Door's is licensed. Voyage's is AI-generic. This plan's frozen STYLE FORMULA (Decision #18) ensures visual coherence. **If executed well, a real moat** — but only if the art consistently lands (an execution risk, not a strategy risk).

3. **Cross-session consequence webs (not just memory, but re-emergence with complication).** The research doc (2026-08-04 platform research, Retention section) flags "early-session choice resurfaces as complication several turns later." No platform surveyed ships this explicitly. It's a narrative design opportunity, not a technical one, but underexplored.

### Non-Obvious Risks

1. **"Persistent memory" claims are cheap if surfacing is weak.** Hidden Door and Voyage both have memory systems, but neither surface them deliberately to the player before the turn starts. This plan's `recall` node (pre-resolve callback) is the surfacing mechanic that makes memory *felt*. If the recall node is implemented as a throwaway prompt-injection (not a first-class game beat), the differentiator evaporates.

2. **Permadeath retention cliff.** Permadeath is a *selection filter*, not a retention tool — it selects for hardcore players and filters out casual ones. This plan's Torpor (soft permadeath) and "session-end recap" hooks (Decision #22 amendment) are attempts to mitigate, but permadeath games structurally have higher churn than non-permadeath games. If this plan's retention metrics fall short, the permadeath mechanic will be blamed before the AI quality is.

3. **Monetization ceiling risk.** A $15–$25 one-time unlock (Foundational Decision #22) is below Voyage's $15–$50/mo subscription tier. If the per-turn cost is higher than expected (T15's cost pass is still pending), the free-turn cap may be so restrictive that it drives conversions down, not up. Conversely, a generous cap makes free play viable and devalues the unlock. This is an execution tuning problem, not a strategy flaw, but it's a real cliff edge.

---

## Candidate Next Steps for CEO Review

1. **Clarify the Voyage competitive threat.** If Voyage reaches full open beta and gains traction in 2H 2026, this plan's post-v1 "persistent world memory" differentiator becomes less defensible. Recommend: confirm Voyage's actual v1 feature set (multiplayer scope, memory stability, pricing finality) by Q4 2026 before committing to the post-v1 roadmap.

2. **de-risk the permadeath mechanic early.** Permadeath + soft-Torpor + session pacing (Decision #22's cliffhanger/recap hooks) is a retention bet. Recommend: playtest the core loop (2–3 turns) with target players (18+ TTRPG-adjacent) during v1 harness validation (T22) to surface whether permadeath is a feature or a friction point.

3. **Lock the art direction under real generated samples.** DESIGN.md's STYLE FORMULA is frozen; T13 will implement it. Recommend: T13's deliverable includes 5–10 real OpenRouter-generated samples matching the formula, reviewed against DESIGN.md's MTG Alpha/TSR reference images, before the cache is populated. If drift is visible, budget T13 for prompt-engineering before v1 bestiary shipping.

4. **Operationalize the "recall" node as a first-class beat, not a prompt-injection afterthought.** Post-v1's differentiator hinges on players *feeling* that the world remembers them. Recommend: T19's `recall` node implementation include a narrative-design pass (a beat structure, not just a prompt slot) to ensure it reads as intentional game design, not a database lookup.

---

## Sources

### Primary (Official)
- [AI Dungeon Help — OpenAI and Filters](https://help.aidungeon.com/faq/openai-and-filters)
- [AI Dungeon Help — Content Moderation](https://help.aidungeon.com/faq/how-does-content-moderation-work)
- [Hidden Door Pricing](https://www.hiddendoor.co/pricing)
- [Hidden Door Blog — Early Access](https://www.hiddendoor.co/blog/early-access)
- [Hidden Door Help — Frequently Asked Questions](https://www.hiddendoor.co/help/faq)
- [Character.AI Community Guidelines](https://character.ai/community-guidelines)
- [Midjourney Storytelling Lab](https://mj-storytelling.github.io/)

### Secondary (Reviews / Aggregators)
- [uragent — AI Dungeon Pricing & Free Tier 2026](https://uragent.org/tools/ai_dungeon/)
- [Dungeon's Deep — AI Dungeon Review 2026](https://dungeonsdeep.ai/blog/ai-dungeon-review-2026)
- [AIVario — NovelAI Review 2026](https://aivario.com/tools/novelai)
- [Top 50 AI Tools — NovelAI Pricing 2026](https://top50aitools.com/pricing/novelai)
- [AI Tools DevPro — NovelAI Pricing 2026](https://aitoolsdevpro.com/ai-tools/novelai-guide/)
- [StartupHub.ai — Character AI Review 2026](https://www.startuphub.ai/ai-news/reviews/2026/character-ai-review-2026)
- [SolidAITech — C.AI 2026 Guide](https://www.solidaitech.com/2026/06/c-ai-character-ai.html)
- [TechCrunch — Latitude Launches Voyage](https://techcrunch.com/2026/04/21/voyage-is-an-ai-rpg-platform-for-creating-custom-gaming-worlds-with-ai-generated-npc-interactions/)

### Industry Coverage
- [Engadget — How do you prevent an AI-generated game from losing the plot?](https://engadget.com/how-do-you-prevent-an-ai-generated-game-from-losing-the-plot-170002788.html)
