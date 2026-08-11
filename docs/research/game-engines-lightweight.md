---
status: RESEARCH
date: 2026-08-06
context: |
  Prior finding (2026-08-04-platform-and-business-research.md) flagged Phaser/PixiJS 
  as potentially overkill for text + card UI, recommending DOM+CSS-first approach 
  instead. This pass dives deeper with primary-source bundle sizes, performance 
  benchmarks, ecosystem size, and deployment options. Goal: validate whether Phaser 
  is the right call vs. lighter alternatives.
---
# Research: Lightweight Game Engines for Text-Heavy, Narrative-First Games

## Executive Summary

**Finding: Phaser 3 defensible, not optimal for game's shape.** DOM+CSS-first approach with optional lightweight layers (Konva.js for canvas cards, or Pixi.js for sprite animation only) lighter and sufficient. Phaser physics, collision, tilemap systems solve zero problems for text + card UI; bundle size (345 KB–71 KB gzipped depending on custom build) dwarfed by NestJS backend overhead already committed.

**Secondary finding:** if pure-canvas engine becomes necessary (100+ sprites on screen), **Pixi.js (90–150 KB gzipped, 2D renderer only)** clear pick. **Babylon.js and Three.js overkill** — 3D engines for 2D work. **Konva.js** (55 KB gzipped) excellent for canvas-based UI, want canvas layer + text handling without game loop. **Godot web export** viable (35–100 MB WASM blob) but adds build complexity, no feature win over JS-first. **Kaboom.js unmaintained** (Replit discontinued it); successor **KaPlay** actively maintained but geared toward rapid arcade prototypes, not narrative games.

---

## Engine-by-Engine Analysis

### 1. Phaser 3 (Current Choice)

**Bundle Size:**
- Full build: 345 KB (minified, web server gzip)
- Custom build (excluding physics, tilemap, etc.): 71–110 KB gzipped (primary: phaserjs/custom-build repo)
- Variance: depends heavily on which Game Objects and systems excluded

**What It Solves:**
- Game loop + input handling (abstracted `requestAnimationFrame`, keyboard/mouse/touch)
- Sprite rendering and animation tweening
- Physics (arcade, matter.js) — **not needed**
- Collision detection — **not needed**
- Tilemap rendering — **not needed**
- Canvas + WebGL rendering with fallback

**Mobile Performance:**
- Low-end Android: documented laggy/jerky with multiple simultaneous animations (Phaser issue #6989, v3 discourse)
- Phaser 3.60 addressed WebGL buffer blocking via hybrid batch system, improved mobile performance
- Performance acceptable for card games (low on-screen sprite movement)
- Recommendation: reduce resolution (960×640) on low-end devices; use requestAnimationFrame frame-skip for graceful degradation

**Community & Ecosystem:**
- ~36,000–40,000 GitHub stars (mature, stable)
- ~2,000 code examples; active Discord
- Used by Disney, Google, Mozilla
- Ecosystem: full JavaScript npm available; 40+ front-end frameworks supported
- Well-documented; maintained since 2013

**Web + Desktop Deployment:**
- Web: native (no build step needed beyond bundling)
- Desktop: Electron wrap works (tested pattern); 150 MB installer overhead
- No native desktop support; wrap-only cost applies

**Verdict for Text+Card Game:**
- Physics/collision/tilemap bundled in but unused → code bloat
- Tween/animation useful but light
- Input handling solid, not exclusive to Phaser
- Custom build can trim unused features, reaching 71 KB gzipped

---

### 2. Pixi.js (2D Renderer Only)

**Bundle Size:**
- Modern version (v7–v8): 90–150 KB gzipped (forum posts reference v6.4.2 at 60–90 KB; v7+ adds features)
- Minimal if tree-shaken (tree-shakable design)
- No built-in game loop or physics — leaves state management to you

**What It Solves:**
- Pure 2D rendering (sprites, shapes, text)
- WebGL + Canvas fallback
- Animation tweening layer available via plugins
- Input handling — **you add this yourself or via minimal wrapper**

**Mobile Performance:**
- Better than Phaser for large sprite counts (Babylon.js 56 FPS, Pixi.js 47 FPS vs Phaser 43 FPS on 10,000 sprites)
- No built-in overhead; performance scales with your code only
- Good for low-end Android if disciplined about draw calls

**Community & Ecosystem:**
- Official UI library (pixi/ui) with commonly used components
- pixi-react for React integration
- AssetPack (asset pipeline)
- Layout library (Yoga-powered)
- DevTools browser extension for performance inspection
- ~5,000–10,000 GitHub stars (smaller than Phaser, very active)

**Web + Desktop Deployment:**
- Web: native
- Desktop: requires Electron wrap same as Phaser (no native advantage)

**Verdict for Text+Card Game:**
- Excellent lightweight alternative if canvas rendering needed at all
- Leaves input, state, animation to you (lighter mental model if hand-building DOM UI anyway)
- Better bundle size baseline than Phaser
- Ecosystem less mature than Phaser for full game scaffolding

---

### 3. Three.js (3D WebGL)

**Bundle Size:**
- three.module.js: 155 KB gzipped (2020 benchmark; likely 180–200 KB in current versions)
- Cannot tree-shake effectively; importing WebGLRenderer pulls most of library
- Way heavier than needed for 2D

**What It Solves:**
- 3D rendering (shaders, lighting, complex geometry)
- WebGL rendering pipeline
- **Not applicable:** this a 3D engine; card games 2D

**Mobile Performance:**
- WebGL-heavy; low-end Android struggles significantly
- Requires GPU tier detection and half-resolution post-processing for 60 FPS on mid-range phones
- Overkill for text + card UI

**Community & Ecosystem:**
- Massive community (~80,000+ GitHub stars)
- Huge ecosystem for 3D graphics, AR, creative coding
- Not a game engine; no input handling, game loop, or high-level game systems

**Verdict:**
- **Do not use.** 3D engine for 2D game = category error.

---

### 4. Babylon.js (3D WebGL)

**Bundle Size:**
- Full library: 3.2 MB (unzipped, older benchmark)
- Minimal custom build: 246 KB → 162 KB (minified, with optimization)
- Gzipped minimal build: ~40 KB (2020 benchmark, likely 50–80 KB now)
- Inspector/GUI adds 10 MB; avoid in production

**What It Solves:**
- 3D rendering, physics, advanced graphics
- Game loop abstraction
- **Overkill:** physics and 3D unused

**Mobile Performance:**
- Best-in-class WebGL performance in benchmarks (56 FPS on 10,000 sprites)
- But overhead unnecessary for text + cards

**Community & Ecosystem:**
- Active, well-resourced (Microsoft backing)
- ~7,000 GitHub stars
- Not sized for 2D games

**Verdict:**
- **Too much engine for too little use.** Better than Three.js (has game loop), but Pixi.js lighter and sufficient.

---

### 5. Konva.js (Canvas 2D Library)

**Bundle Size:**
- 54.9 KB (minified + gzipped)
- Smallest in this analysis
- No physics, no game loop, no input handling — pure canvas abstraction

**What It Solves:**
- Canvas 2D rendering (shapes, text, layers)
- Layer management and performance optimization
- Text rendering with rich styling (font, alignment, wrapping, decoration)
- Event handling for canvas elements (click, drag, etc.)
- **Does not solve:** animation, state management, input batching

**Mobile Performance:**
- Excellent (no game loop overhead, pure rendering)
- Per-character render hooks available; text performance tunable
- Layer management can reduce redraws (e.g., static text in one layer, animated cards in another)

**Community & Ecosystem:**
- ~5,000 GitHub stars
- Smaller than Phaser/Pixi
- React integration available (react-konva)
- Mature documentation

**Web + Desktop Deployment:**
- Web: native
- Desktop: same Electron wrap requirement

**Verdict for Text+Card Game:**
- Excellent if want pure-canvas UI layer without animation/physics overhead
- Lighter than Phaser or Pixi
- Requires hand-build game loop if animation needed (acceptable for this game's shape)
- Good pairing: DOM CSS for text, Konva.js for card rendering canvas layer

---

### 6. Godot (Full Engine, Web Export)

**Bundle Size (Web WASM Export):**
- Empty Godot 4.4 project: 35 MB compressed WASM, 25 MB with asset pack stripping
- Typical game: 50–100 MB WASM blob
- Desktop export (Electron): similar, but bundled differently
- **Critical distinction:** WASM binary not JavaScript tree-shakeable; entire runtime ships

**What It Solves:**
- Full IDE + game engine in one
- Physics, collision, tilemap, animation, input — all built-in
- Multi-platform export (web, desktop, mobile, console in theory)
- Cross-platform tooling (same editor for all targets)

**Mobile Performance:**
- WASM performance good (approaching native in some cases)
- But 25–100 MB initial load barrier for low-end mobile browsers
- Godot 4.5 has memory ceiling constraints for longer play sessions

**Desktop Deployment:**
- Native Godot desktop export: small installers (via Godot's own executable packing)
- Godot → Electron wrap: adds Godot overhead on top of Chromium (defeats WASM advantage)
- No advantage over building JS game and wrapping in Electron

**Community & Ecosystem:**
- Huge community for game development (not web-specific)
- ~70,000+ GitHub stars
- Mature 2D engine; web export second-class citizen (better on native targets)
- UI systems built for desktop-first; web export afterthought

**Web + Desktop Compromise:**
- Web: 25–100 MB WASM blob prohibitive for casual/web-first games, low bandwidth
- Desktop: native export great, but "web-first, wrap later" loses all Godot advantage
- Pick Godot for desktop → re-architecting for web (cross-compilation always costs)

**Verdict:**
- **Not suitable for web-first, text-heavy narrative game.** WASM blob size (25 MB minimum) barrier for browser casual play. Better suited for commercial desktop release where install size tolerable.
- If desktop release later priority, native Godot builds excellent (small installers). But contradicts "web-first" sequencing in Scope Decision #7.

---

### 7. Kaboom.js (Game Library)

**Status:**
- **Unmaintained as of 2026.** Replit discontinued Kaboom.js.
- Community fork **KaPlay** actively maintained (last update 2026-08-04).

**Bundle Size:**
- Original Kaboom: ~20–30 KB minified (estimates from old docs)
- KaPlay: likely similar (direct fork)

**What It Solves:**
- High-level game loop and entity system
- Collision, physics stubs
- Input handling
- Sprite animation
- Designed for rapid arcade prototypes

**Mobile Performance:**
- Benchmark: 3 FPS on 10,000 sprites (orders of magnitude slower than Phaser/Pixi)
- Not suitable for performance-critical rendering
- Good for game-jam style rapid iteration

**Community & Ecosystem:**
- Kaboom: dead (Replit dropped it)
- KaPlay: young fork, growing community
- Used heavily in Replit educational contexts (not production games)

**Verdict:**
- **Avoid.** Dead upstream (Kaboom). KaPlay fork too young, doesn't solve problems Phaser already handles better.

---

### 8. Custom DOM + CSS + Canvas Hybrid

**Bundle Size:**
- Baseline: 0 KB (no framework, just DOM and browser APIs)
- Optional layers: Konva.js (55 KB), Motion.dev (~90% smaller than GSAP, ~5 KB), or animate.css (~3 KB)
- Total: 0–60 KB depending on what added

**What It Solves:**
- Text rendering: native DOM `<div>` + CSS unbeaten for text (native browser optimization, accessibility, no redraw overhead)
- Card layout: Flexbox/Grid purpose-built for card UI
- Animation: CSS transitions + `@keyframes` for idle/attack tweens, Motion.dev for orchestration
- Input: native event listeners (no abstraction)
- State: lives in NestJS backend (already committed per architecture)

**What It Doesn't Solve (Real Gaps):**
1. **Large sprite counts (100+):** DOM reflow/repaint cost scales poorly. Canvas needed.
2. **Complex shader effects:** DOM can't do real-time filters (unless layer canvas on top).
3. **Sub-millisecond input latency:** native DOM handlers have some scheduling delay; games needing twitch action need this.

**For This Game:**
- Text: 🎯 excellent (native DOM optimal)
- Cards: 🎯 excellent (Flexbox/Grid)
- Sprite animation: 🎯 adequate (CSS keyframes for idle, Motion.dev for orchestration)
- Sprite count: 🎯 adequate (card game low sprite count: 5–20 on screen)
- Input handling: 🎯 adequate (card taps/clicks not latency-sensitive)
- **Real cost avoided:** physics, collision, tilemap bundling, game loop abstraction

**Mobile Performance:**
- DOM scales excellently on Android (research shows DOM sprites beat canvas on older Android)
- CSS transitions GPU-accelerated on modern mobile
- No JavaScript game loop overhead; only runs on input or animation frame

**Web + Desktop Deployment:**
- Web: native (HTML/CSS/JS is native platform)
- Desktop: Electron wrap works identically for DOM-based apps as canvas apps (150 MB installer overhead applies equally)
- No advantage or disadvantage vs. Phaser/Pixi for wrapping

**Verdict:**
- **Best fit for stated game shape.** Text + cards + occasional sprite animation = DOM+CSS sweet spot.
- Canvas layer (Konva.js or optional Pixi.js) only if sprite count explodes (not forecasted).
- Eliminates physics, collision, tilemap code bloat that Phaser bundles but game ignores.

---

## Comparative Table

| Engine | Bundle (gzipped) | Game Loop | Physics | Sprites | Text | Mobile | Community | Web-Only Bloat | Desktop |
|--------|-----------------|-----------|---------|---------|------|--------|-----------|----------------|---------|
| **Phaser 3** | 71–345 KB | ✓ | ✓ (unused) | ✓ | ✓ (weak) | Fair (v3.60+) | Huge (40k stars) | Physics/tilemap | Electron |
| **Pixi.js** | 90–150 KB | ✗ (you add) | ✗ | ✓ | ✓ (weak) | Good (47 FPS) | Large (5–10k) | None | Electron |
| **Three.js** | 155–200 KB | ✗ | ✗ | ✓ 3D only | ✗ | Poor | Huge (80k+) | 3D overhead | Electron |
| **Babylon.js** | 40–162 KB | ✓ | ✓ (unused) | ✓ 3D-biased | ✗ | Good | Large (7k) | Physics/3D | Electron |
| **Konva.js** | 55 KB | ✗ (you add) | ✗ | ✓ Canvas only | ✓ | Excellent | Medium (5k) | None | Electron |
| **Godot** | 25–100 MB | ✓ | ✓ (unused) | ✓ | ✓ | Poor (size) | Huge (70k+) | WASM runtime | Native or Electron |
| **Kaboom** | ~20–30 KB | ✓ | ✓ (unused) | ✓ | ✓ (weak) | Poor (3 FPS) | Dead/young fork | None | Electron |
| **DOM+CSS** | 0 KB (+ optional) | ✗ (you add) | ✗ | ✓ (low) | ✓✓ | Excellent | N/A | None | Electron |

---

## Primary Sources

### Bundle Size Data
- Phaser: [phaserjs/custom-build](https://github.com/phaserjs/custom-build) (README documents custom build sizes)
- Phaser: [Bundlephobia Phaser v3.90.0](https://bundlephobia.com/package/phaser)
- Pixi.js: [pixijs/issues #6408](https://github.com/pixijs/pixijs/issues/6408) (community discussion on bundle size targets)
- Konva.js: [Bundlephobia Konva v10.3.0](https://bundlephobia.com/package/konva) (54.9 KB minified + gzipped)
- Three.js: [Discourse thread on bundle reduction](https://discourse.threejs.org/t/bundle-size-reduction/38602)
- Babylon.js: [Forum: bundle size for minimal project](https://forum.babylonjs.com/t/babylon-js-bundle-size-for-reasonably-minimal-project/16041)
- Godot: [best-games.io Godot 4 Web Export Optimization 2026 Guide](https://best-games.io/blog/godot-web-export-optimization-guide)
- Godot: [amann.dev: Optimize Size of Godot Releases](https://amann.dev/blog/2025/godot_web_size/)

### Performance Benchmarks
- Sprite rendering (10,000 sprites): [Shirajuki/js-game-rendering-benchmark](https://github.com/Shirajuki/js-game-rendering-benchmark) (Babylon.js 56 FPS, Pixi.js 47 FPS, Phaser 43 FPS)
- Phaser mobile: [Phaser issue #6989 (low-end mobile performance)](https://github.com/phaserjs/phaser/issues/6989)
- Phaser mobile: [Phaser changelog 3.60 MobilePerformance.md](https://github.com/phaserjs/phaser/blob/v3.60.0/changelog/3.60/MobilePerformance.md)
- Three.js mobile: [Medium: Optimizing Performance in Three.js](https://medium.com/@coders.stop/optimizing-performance-in-three-js-rendering-smoothly-on-low-end-devices-e48d2cc516cc)
- DOM vs Canvas: [buildnewgames.com: DOM Sprites: a Viable Alternative to Canvas](http://buildnewgames.com/dom-sprites/)

### Ecosystem & Maintenance
- Phaser: [phaserjs/phaser GitHub](https://github.com/phaserjs/phaser) (~36k–40k stars, active since 2013)
- Pixi.js: [pixijs/ecosystem guide](https://pixijs.com/8.x/guides/getting-started/ecosystem)
- Kaboom: [replit/kaboom GitHub](https://github.com/replit/kaboom) (discontinued by Replit)
- KaPlay (Kaboom fork): [kaplayjs/kaplay GitHub](https://github.com/kaplayjs/kaplay) (actively maintained, updated 2026-08-04)

### Context: Prior Finding
- [2026-08-04-platform-and-business-research.md](./2026-08-04-platform-and-business-research.md) — flagged Phaser/PixiJS as possibly overkill, recommended DOM+CSS-first

---

## Recommendations

### Primary Recommendation: DOM+CSS-First
- **Use:** vanilla HTML/CSS for text, cards, menus; vanilla DOM event listeners for input
- **Add if needed:** Motion.dev (~5 KB) for orchestrating tween chains
- **Add only if sprite count explodes:** Konva.js (55 KB) for canvas card rendering layer
- **Why:** text and card UI DOM's sweet spot; no engine bloat for unused systems; optimal mobile performance; aligns with NestJS backend architecture (state lives server-side)

### Secondary Recommendation: Phaser 3 (Custom Build)
- **If** animated sprite count regularly exceeds 50, or need built-in tween library
- **Use:** custom build (phaserjs/custom-build repo) excluding physics/tilemap/unused Game Objects
- **Target:** 71–110 KB gzipped
- **Assumption:** animation + input handling + rendering worth 71 KB; physics/collision still unused but smaller custom build mitigates
- **Not recommended until data shows sprites are the bottleneck**

### Not Recommended
- Babylon.js, Three.js: overkill (3D engines)
- Godot: 25–100 MB web export barrier for casual browser play
- Kaboom: unmaintained; KaPlay too young
- Pixi.js standalone: lighter than Phaser, but DOM+CSS even lighter for this game's shape

---

## Tension with Foundational Decision #19-21

Foundational Decision #19-21 (V1 Launch Scope) locks "Phaser/PixiJS frontend with sprite animations." This research finding **not an override of that decision**, flagged as "candidate amendment" in prior research doc (2026-08-04).

**Questions for future `/plan-eng-review` or decision review:**
1. Does "sprite animations" include idle/attack tweens (solvable via CSS + Motion.dev) or require Phaser/Pixi specifically?
2. What sprite count acceptable before canvas becomes necessary?
3. Is 71–345 KB Phaser overhead acceptable for tween/input convenience, or should MVP use DOM+CSS and add Phaser only on evidence of need?

**This research doc enables that decision, not replaces it.**

---

## Verdict: Is Phaser the Right Call?

**Conditional yes, but DOM+CSS-first lighter and defensible.**

Phaser 3 (or custom build) solid, community-tested choice, excellent tooling. Bundle size not catastrophic (71 KB for lean build). Solves real problems: input handling, sprite animation, rendering pipeline.

But for game 90% text + cards + 10% sprite tweens, Phaser solving 10 problems to address 1. DOM+CSS natively solves 90% (text + layout), Motion.dev + optional canvas layer handles 10% (animation + sprite rendering) at fraction of bundle cost, simpler mental model.

**Recommendation for next phase:**
1. Ship MVP with DOM+CSS + vanilla event listeners
2. If data shows animation bottleneck (sprite count or tween complexity), measure cost/benefit of adding Phaser or Pixi.js
3. Do not pay for physics/collision/tilemap now; add only if gameplay evolves to require them