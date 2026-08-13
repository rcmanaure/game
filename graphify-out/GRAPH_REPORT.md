# Graph Report - .  (2026-08-12)

## Corpus Check
- 49 files · ~58,833 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 888 nodes · 1202 edges · 63 communities (52 shown, 11 thin omitted)
- Extraction: 96% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.84)
- Token cost: 0 input · 350,677 output

## Community Hubs (Navigation)
- Project Root Documentation
- Documentation Structure Guide
- Game-Dev Agent Specialists
- P0 Fix Plan Backlog
- Backend NPM Dependencies
- Platform & Monetization Research
- Game Dev Technique Reference
- Game Engine Skill Reference
- OpenRouter Free-Model Research
- Installed Agent Skills
- Harness NPM Dependencies
- Harness LangGraph Pipeline
- Art Generation Module
- Image Compositing Pipeline
- Backend NPC/Turn Entities
- Character Schema & Attributes
- Design Doc & Competitors
- Backend TS Config
- Harness TS Config
- Backend Auth Module
- Permadeath Retention Research
- Project README Overview
- Dice Rules Engine
- GLB Animation Merge Tool
- LLM Framework Research
- Harness Env & Bootstrap
- WebSocket Gateway
- Game Design Inspiration
- Portrait Generation Research
- AI Storytelling Platforms Survey
- Role-Based Access Guards
- Narration Fallback Module
- FBX to GLB Converter
- GLB Animation Import Tool
- Global Exception Filter
- Battle/Stat Resolution Research
- Backend Chronicle Entity
- GraphService Turn Orchestration
- TypeORM Entity Decorators
- Health Check Controller
- NPC Memory & Retention Hooks
- GLB Inspection Tool
- JWT Auth Service
- Backend NPC Entity
- Web Game APIs Reference
- GLB Material Patch Tool
- Procedural Dragon Animation
- Rig Transfer Tool
- Seamless Texture Tool
- Asset Generation Skills
- Art Style Formula
- Procedural Weight Painting
- Auth Component Cluster
- Init Schema Migration
- ActiveChronicleId Migration
- Procedural Dragon Rig
- Backend Package Config
- Art Style Contract
- Game Creation System Doc
- TypeORM Column Decorator
- TypeORM CreateDateColumn Decorator
- TypeORM Entity Decorator
- TypeORM PrimaryGeneratedColumn Decorator

## God Nodes (most connected - your core abstractions)
1. `Game Development Terminology` - 23 edges
2. `Research: Game-Design Inspiration for the AI-DM Coterie-Sim Plan` - 20 edges
3. `Roadmap — AI DM Coterie-Sim` - 19 edges
4. `Final Test Results — @game-dev Hierarchy Validation + Production Blockers` - 17 edges
5. `Design System — AI Dungeon Master Coterie-Sim` - 16 edges
6. `Research: Blockchain NPCs (On-Chain AI State) for Retention Viability` - 15 edges
7. `Research: LLM-Narrated Permadeath Precedent — AI Dungeon, AI Roguelite, Hidden Door, Fallen London` - 15 edges
8. `Game Development Basics` - 15 edges
9. `Permadeath Retention Mechanics: Hades, FTL, Slay the Spire` - 13 edges
10. `T15 Cost-Model Re-evaluation (Quality > Velocity Pass)` - 13 edges

## Surprising Connections (you probably didn't know these)
- `LLM Orchestration Frameworks Research` --references--> `narrateWithFallback()`  [EXTRACTED]
  docs/research/llm-orchestration-frameworks.md → src/harness/narration.ts
- `Research: OpenRouter Free-Tier Model Candidates for LOGIC_MODEL / CREATIVE_MODEL` --references--> `resolve()`  [EXTRACTED]
  docs/research/2026-08-05-openrouter-free-model-candidates-research.md → src/harness/graph.ts
- `Research: Battle/Stat-Resolution Mechanics for the AI-DM Coterie-Sim` --references--> `resolve()`  [EXTRACTED]
  docs/research/2026-08-05-rpg-battle-and-stat-resolution-mechanics-research.md → src/harness/graph.ts
- `LLM Orchestration Frameworks Research` --references--> `resolve()`  [EXTRACTED]
  docs/research/llm-orchestration-frameworks.md → src/harness/graph.ts
- `LLM Orchestration Frameworks Research` --references--> `narrate()`  [EXTRACTED]
  docs/research/llm-orchestration-frameworks.md → src/harness/graph.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **AI Game Studio: game-lead orchestrates 5 specialists** — docs_production_recreate_game_dev_studio_game_lead, docs_production_recreate_game_dev_studio_gameplay_designer, docs_production_recreate_game_dev_studio_gameplay_engineer, docs_production_recreate_game_dev_studio_performance_engineer, docs_production_recreate_game_dev_studio_qa_tester, docs_production_recreate_game_dev_studio_game_researcher [EXTRACTED 1.00]
- **M7.1 five live doc contradictions (frontend engine, Ink/inkjs, launch date, art latency gate, success metric)** — claude_tech_stack_frontend, docs_reference_design_frontend_engine, claude_tech_stack_narrative, docs_production_roadmap_locked_tech_stack, docs_production_roadmap_quality_gates_pre_launch, docs_production_roadmap_t15_finding, docs_project_facts_field5_deadline [EXTRACTED 1.00]
- **Postgres persistence bring-up (compose service, checkpointer setup, raw-SQL casing fix)** — docker_compose_postgres_service, todo_m1_1_rewrite_raw_sql_to_typeorm_querybuilder, todo_m5_1_postgres_saver_setup, changelog_v0_1_0_0 [INFERRED 0.85]
- **Permadeath-Retention Precedent Games (death as information gain / named consequence)** — docs_research_2026_08_06_permadeath_retention_mechanics_hades, docs_research_2026_08_06_permadeath_retention_mechanics_ftl, docs_research_2026_08_06_permadeath_retention_mechanics_slaythespire, docs_research_2026_08_03_game_design_inspiration_roguelegacy, docs_research_2026_08_03_game_design_inspiration_darkestdungeon [INFERRED 0.85]
- **AI-DM / Narrative-Game Competitive Landscape Analyzed Across Research Passes** — docs_research_2026_08_03_game_design_inspiration_aidungeon, docs_research_2026_08_03_game_design_inspiration_hiddendoor, docs_research_ai_game_platforms_ai_dungeon_platform, docs_research_ai_game_platforms_hidden_door_platform, docs_research_ai_game_platforms_voyage_platform, docs_research_ai_game_platforms_character_ai_platform [INFERRED 0.80]
- **LOGIC_MODEL Selection Decision Chain (two research passes, conflicting baselines)** — docs_research_2026_08_05_openrouter_free_model_candidates_research_cohere_north_mini_code_free, docs_research_2026_08_05_openrouter_free_model_candidates_research_nvidia_nemotron_3_super_120b, docs_research_2026_08_06_t15_cost_model_reevaluation_logic_model_gemini_2_flash, docs_research_2026_08_06_t15_cost_model_reevaluation_decision15_model_baseline [INFERRED 0.75]
- **JWT Authentication Implementation Components** — jwt_strategy, jwt_auth_guard, src_backend_auth_service, jwt_ws_gateway [EXTRACTED 1.00]

## Communities (63 total, 11 thin omitted)

### Community 0 - "Project Root Documentation"
Cohesion: 0.05
Nodes (57): CI Workflow, Changelog [0.1.0.0] — first tracked version, CLAUDE.md (project instructions), Research Docs Convention, Tech Stack (Locked): Frontend DOM+CSS+Motion.dev, Tech Stack (Locked): LLM LangGraph.js, Tech Stack (Locked): Narrative Ink+inkjs, Postgres service definition (docker-compose) (+49 more)

### Community 1 - "Documentation Structure Guide"
Cohesion: 0.04
Nodes (45): docs/README.md — Documentation Structure, Documentation Structure, File Count, Folders, `game-dev/` — @game-dev Studio Documentation (8 files), How to Use, `production/` — Production Fixes & Recreation (3 files), Quick Navigation (+37 more)

### Community 2 - "Game-Dev Agent Specialists"
Cohesion: 0.06
Nodes (42): 1. **gameplay-engineer** — Code Quality + Architecture, 2. **performance-engineer** — Metrics + Profiling, 3. **qa-tester** — Test Automation + Regression, 4. **gameplay-designer** — Fun Metrics + Design, 5. **game-researcher** — Industry Precedent + Risk, 6. **game-lead** — Orchestration (No Changes), Agent Improvements, Collaboration Pattern (+34 more)

### Community 3 - "P0 Fix Plan Backlog"
Cohesion: 0.05
Nodes (44): EXECUTION ORDER, INNOVATION RISKS (surfaced, not buried), M1.2 — Validate chronicleId ownership at WS trust boundary, M1.3 — Delete `'placeholder-chronicle-id'` fallback, M1.4 — `@Public()` on HealthController, M1.5 — roles.guard fail-closed default, M1 — Production Blockers (SHIP STOPPERS), M2.1 — Add `npcContext` to harness State schema (+36 more)

### Community 4 - "Backend NPM Dependencies"
Cohesion: 0.05
Nodes (43): dotenv, @langchain/langgraph, @langchain/langgraph-checkpoint-postgres, @langchain/openrouter, @nestjs/common, @nestjs/config, @nestjs/core, @nestjs/jwt (+35 more)

### Community 5 - "Platform & Monetization Research"
Cohesion: 0.06
Nodes (40): AI Dungeon monthly-credit monetization template, Research: Platform, Distribution, Monetization, Retention, DOM+CSS-first frontend finding (game shape doesn't need full game engine), Freemium + capped free daily turns + one-time unlock monetization model, Ship browser + itch.io first, delay webview wrap, prefer Electron over Tauri, Motion.dev (tween library, ~90% smaller than GSAP), Phaser/PixiJS frontend option (flagged possibly overkill), Tauri vs Electron distribution-wrap tradeoff (+32 more)

### Community 6 - "Game Dev Technique Reference"
Cohesion: 0.05
Nodes (40): AAA (Triple-A) Games, AABB (Axis-Aligned Bounding Box), Game Development Techniques, Game UI Design Skill, Async Scripts Technique, Audio for Web Games Technique, Bresenham's Line Algorithm, Buff/Debuff Mechanic (+32 more)

### Community 7 - "Game Engine Skill Reference"
Cohesion: 0.06
Nodes (37): Game Engine Core Design Principles, Game Engine Skill, Canvas 2D API, Canvas API (2D Drawing), CSS Styling, Data-Driven Design Principle, Entity-Component-System (ECS) Pattern, Event System Subsystem (+29 more)

### Community 8 - "OpenRouter Free-Model Research"
Cohesion: 0.07
Nodes (34): cohere/north-mini-code:free — baseline LOGIC_MODEL, ~33% structured-output reliability observed, Darkbloom-routed backend rejects LangChain/Zod-v4-generated `$schema` field in tool params (cross-model provider-routing incompatibility), Research: OpenRouter Free-Tier Model Candidates for LOGIC_MODEL / CREATIVE_MODEL, google/gemma-4-26b-a4b-it:free — Darkbloom backend rejects $schema field, google/gemma-4-31b-it:free — untestable, upstream shared-pool rate-limited every attempt, Recommendation: switch LOGIC_MODEL from cohere/north-mini-code:free to nvidia/nemotron-3-super-120b-a12b:free, keep CREATIVE_MODEL unchanged, nvidia/nemotron-3-super-120b-a12b:free — 2/2 clean structured output, recommended LOGIC_MODEL, nvidia/nemotron-3-ultra-550b-a55b:free — current CREATIVE_MODEL, best Spanish gothic prose (+26 more)

### Community 9 - "Installed Agent Skills"
Cohesion: 0.07
Nodes (30): Agent Configuration, Backend Engineering, `cpu-profiling` (aj-geddes/useful-ai-prompts), `data-analysis` (claude-office-skills/skills), Database Engineering, `e2e-playwright-testing` (asyrafhussin/agent-skills), Future Custom Skills (Post-Playtest), `game-analytics` (alphaonedev/claude-skills) (+22 more)

### Community 10 - "Harness NPM Dependencies"
Cohesion: 0.07
Nodes (28): devDependencies, ts-node, tsx, @types/express, @types/node, @types/passport-jwt, typescript, name (+20 more)

### Community 11 - "Harness LangGraph Pipeline"
Cohesion: 0.14
Nodes (19): resolve(), State, OPPONENT_TIERS, AttributeSchema, CriticalTier, CriticalTierSchema, LogicIntent, LogicIntentRaw (+11 more)

### Community 12 - "Art Generation Module"
Cohesion: 0.19
Nodes (13): ArtResult, extractImageUrl(), generateArt(), placeholderUrl(), main(), saveImage(), apiKey(), creativeAltModel() (+5 more)

### Community 13 - "Image Compositing Pipeline"
Cohesion: 0.21
Nodes (16): composite_cross(), _cut_axis(), _edge_energy(), flatten_luminance(), _hcut_cyclic(), make_seamless(), match_colors(), offset_blend() (+8 more)

### Community 14 - "Backend NPC/Turn Entities"
Cohesion: 0.21
Nodes (10): PrimaryColumn, Column, CreateDateColumn, Entity, Index, TURN_STATUSES, TurnEntity, TurnStatus (+2 more)

### Community 15 - "Character Schema & Attributes"
Cohesion: 0.18
Nodes (13): Attribute, ATTRIBUTES, Character, CHARACTER_STATUSES, CharacterSchema, CharacterStatus, CharacterStatusSchema, Skill (+5 more)

### Community 16 - "Design Doc & Competitors"
Cohesion: 0.14
Nodes (14): Hidden Door — game-engine layer + trope-engine narration, 1. AI Dungeon (Latitude), 2. AI Roguelite, 3. Hidden Door, 4. Fallen London (Failbetter Games) — added as narrative-first slow-pacing precedent, AI Dungeon April 2021 content-filter controversy — trust damage from under-communicated moderation, AI Roguelite Insane Mode — true permadeath, manual console memory-pin workaround, uncalibrated stakes, Differentiation Analysis (+6 more)

### Community 17 - "Backend TS Config"
Cohesion: 0.12
Nodes (15): src/backend/**/__tests__/**, src/backend/**/*.ts, compilerOptions, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, module, moduleResolution (+7 more)

### Community 18 - "Harness TS Config"
Cohesion: 0.13
Nodes (14): src, src/backend, compilerOptions, esModuleInterop, module, moduleResolution, outDir, resolveJsonModule (+6 more)

### Community 19 - "Backend Auth Module"
Cohesion: 0.21
Nodes (5): JwtPayload, JwtAuthGuard, Injectable, JwtStrategy, Injectable

### Community 20 - "Permadeath Retention Research"
Cohesion: 0.18
Nodes (13): Single-player 'chronicle ledger' screen, Dwarf-Fortress-Legends-lite (candidate amendment), Dwarf Fortress — Legends Mode (seeded, browsable, comparable history), Slay the Spire / Slay the Spire 2 — unlocks as lore delivery (Epochs), power-unlock failure mode, Cross-game pattern: death is not loss, it's asymmetric information gain, made visible before next run, FTL: Faster Than Light — permanent cross-run progression, death as research, FTL: Faster Than Light (Subset Games), Gap in Current Game, Hades (Supergiant Games) (+5 more)

### Community 21 - "Project README Overview"
Cohesion: 0.15
Nodes (13): AI Dungeon Master Coterie-Sim, Architecture, Commands, Deployment, Development Conventions, Docs, Environment Variables, Key Files (+5 more)

### Community 22 - "Dice Rules Engine"
Cohesion: 0.31
Nodes (11): clampAttributeModifier(), modifierFor(), clampTargetNumber(), computeCriticalTier(), generateConsequences(), OpponentTier, PlayerRoll, resolveCheck() (+3 more)

### Community 23 - "GLB Animation Merge Tool"
Cohesion: 0.32
Nodes (11): accessor_bytes(), append_accessor(), f32_bytes(), f32_list(), fix_root_scale(), main(), merge_clip(), node_names() (+3 more)

### Community 24 - "LLM Framework Research"
Cohesion: 0.21
Nodes (12): Anthropic Claude Agent SDK — declarative, minimal boilerplate, Claude-locked, best fit if starting fresh, LLM Orchestration Frameworks Research, HuggingFace Transformers Agents — Python-only, not fit for TS/Node backend, Recommendation: keep LangGraph.js for now; Anthropic Agent SDK best fit if starting fresh, LangChain.js — composable components/agent toolkit, complementary not alternative to LangGraph, LangGraph.js — current orchestration, StateGraph 4-node linear pipeline, minimal overhead for this scope, Raw async/await orchestration — ~30 lines vs 147 in graph.ts, viable if game never branches, Rivet (Ironclad) — visual node-based AI workflow builder, prototyping only not production (+4 more)

### Community 25 - "Harness Env & Bootstrap"
Cohesion: 0.27
Nodes (8): SAMPLE_CHARACTERS, loadEnv(), ensureCheckpointer(), harnessGraph, main(), ITERATIONS, main(), SAMPLE_ACTIONS

### Community 26 - "WebSocket Gateway"
Cohesion: 0.20
Nodes (7): ConnectedSocket, MessageBody, JwtWsGateway, Injectable, SubscribeMessage, WebSocketGateway, WebSocketServer

### Community 27 - "Game Design Inspiration"
Cohesion: 0.25
Nodes (11): AI Roguelite (Steam) — LLM-as-engine, no rules-legal validation layer, Bloodborne — Insight, coined stat name carrying lore+mechanical weight, Darkest Dungeon — Affliction System (Stress/Affliction, named quirks), Research: Game-Design Inspiration for the AI-DM Coterie-Sim Plan, Fallen London / Sunless Sea — differentiation via invented vocabulary (Terror Meter), 'Hunger'/'Humanity' naming overlap with VTM V5 flagged vs Decision #1's no-VTM-terms rule, Monster Hunter — Hunter's Notes progressive research-level entry completion, NarrativeEngine-P (Sagesheep) — Dice Fairness pre-rolled pools + within-campaign recall (+3 more)

### Community 28 - "Portrait Generation Research"
Cohesion: 0.31
Nodes (10): Character Card V2 spec — one fixed pre-authored portrait per character, no per-user regeneration, Research: Player Character Portraits, Dynamic Portrait Evolution, Story Reuse, Gemini 2.5 Flash Image (Nano Banana) — targeted edit/consistency support, ~$0.039/image, Higgsfield Soul ID — trained reusable identity (fallback if per-call reference edit drifts), LangGraph.js self-hosted PostgresSaver checkpointer has no fork/clone primitive, LangGraph Platform `copy_thread` API (hosted-only, rejected by self-hosting decision), NovelAI consistent-character technique — tag density in prompt, not image-to-image/embeddings, OpenRouter Image API `input_references` parameter (image-to-image edit path) (+2 more)

### Community 29 - "AI Storytelling Platforms Survey"
Cohesion: 0.25
Nodes (9): AI Dungeon (Latitude) — commodity narration, unmanaged context, AI Dungeon — Auto Summarization + Memory Bank, scoped to single adventure, oldest memories evicted, AI Dungeon — commodity offering, saturated red-ocean baseline, four-tier subscription, Character.AI — chatbot-companion red ocean, age-tiered moderation, inconsistent memory, Research: Existing AI-Driven Game/Storytelling Platforms, Lore Machine — no 2026 web presence found, flagged as gap, NovelAI — underserved adult-fiction + privacy niche, subscription-only, Voyage direct-competition risk — 'unscripted AI RPG with world memory' space, well-funded, 5yr World Engine head start (+1 more)

### Community 30 - "Role-Based Access Guards"
Cohesion: 0.25
Nodes (3): RolesGuard, Injectable, UserRole

### Community 31 - "Narration Fallback Module"
Cohesion: 0.42
Nodes (6): contentToString(), deterministicNarration(), isRefusal(), narrateWithFallback(), NarrationResponse, outcomeLabel()

### Community 32 - "FBX to GLB Converter"
Cohesion: 0.46
Nodes (7): clean_action_name(), fix_normals(), force_opaque_materials(), get_args(), main(), patch_glb_opaque(), push_all_actions_to_nla()

### Community 33 - "GLB Animation Import Tool"
Cohesion: 0.39
Nodes (7): fix_root_scale(), get_args(), import_clip(), main(), Import an animation GLB, keep its action (renamed), delete its objects., Detect & fix baked root scale; returns the factor or None., root_bone_name()

### Community 34 - "Global Exception Filter"
Cohesion: 0.29
Nodes (4): Catch, Module, AppModule, AllExceptionsFilter

### Community 35 - "Battle/Stat Resolution Research"
Cohesion: 0.43
Nodes (8): Recommended resolution model: D&D-style d20-vs-DC base, Craving as tagged second-d20 advantage-style bolt-on (not full VTM dice pool), D&D 5e SRD 5.1 — d20 + modifier vs DC ability-check/attack model, advantage/disadvantage, contests, Research: Battle/Stat-Resolution Mechanics for the AI-DM Coterie-Sim, Foundry VTT Roll/RollTerm classes — roll definition vs roll result separation, GameEventSchema evolution proposal (rollType, targetNumber, cravingDie, recomputable success), OpenCombatEngine — SRD-5.1-compliant open-source engine, Result<T> pattern, IDiceRoller, Vampire: The Masquerade V5 — Attribute+Skill d10 dice-pool, success-counting, opposed-roll-as-damage, VTM V5 Hunger dice — substitute pool dice, Messy Critical / Bestial Failure narrative tags

### Community 36 - "Backend Chronicle Entity"
Cohesion: 0.29
Nodes (6): ChronicleEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn

### Community 37 - "GraphService Turn Orchestration"
Cohesion: 0.32
Nodes (3): GraphService, Injectable, HarnessGraphState

### Community 38 - "TypeORM Entity Decorators"
Cohesion: 0.29
Nodes (6): Column, CreateDateColumn, Entity, InjectRepository, PrimaryGeneratedColumn, UserEntity

### Community 39 - "Health Check Controller"
Cohesion: 0.29
Nodes (4): Controller, Get, InjectDataSource, HealthController

### Community 40 - "NPC Memory & Retention Hooks"
Cohesion: 0.29
Nodes (7): Death Stranding — Social Strand System, attribution of world-state change to past action, Hades — repetition reframed as continuity via NPC relationship state, Named 'returning face' surfaced at chronicle start (candidate amendment), Retention hooks: cliffhangers, consequence webs, fixed pacing, session recap, sustained-play unlocks, Hades — relationship-state gating + character acknowledgment of loop, Cross-playthrough NPC memory + surfacing mechanic — no shipped platform found doing this, @game-dev hierarchy validation — 92% routing accuracy, 0% crosstalk, A-grade, production-ready for delegation

### Community 41 - "GLB Inspection Tool"
Cohesion: 0.53
Nodes (5): accessor_values(), find_skeleton_roots(), main(), Joint nodes whose parent is not itself a joint (per skin)., read_glb()

### Community 43 - "Backend NPC Entity"
Cohesion: 0.33
Nodes (6): NpcEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn

### Community 44 - "Web Game APIs Reference"
Cohesion: 0.40
Nodes (5): Web APIs for Game Development, asm.js Subset, Emscripten Toolchain, Fullscreen API, WebAssembly (Wasm)

### Community 45 - "GLB Material Patch Tool"
Cohesion: 0.70
Nodes (4): main(), patch_materials(), read_glb(), write_glb()

### Community 46 - "Procedural Dragon Animation"
Cohesion: 0.60
Nodes (3): bake_action(), get_args(), main()

### Community 47 - "Rig Transfer Tool"
Cohesion: 0.70
Nodes (4): clean_action_name(), get_args(), main(), world_bbox()

### Community 48 - "Seamless Texture Tool"
Cohesion: 0.70
Nodes (4): flatten_luminance(), make_seamless(), offset_blend(), periodic_component()

### Community 49 - "Asset Generation Skills"
Cohesion: 0.40
Nodes (5): Asset Generation Workflow, AutoSprite Generation Model, Game Design System Reference, Higgsfield Game Generation Skill, Spritesheet Generation

### Community 50 - "Art Style Formula"
Cohesion: 0.60
Nodes (3): STYLE_FORMULA, STYLE_TOKEN, VALID_INTENT

### Community 51 - "Procedural Weight Painting"
Cohesion: 0.67
Nodes (3): main(), distance from point p to segment ab, seg_dist()

### Community 52 - "Auth Component Cluster"
Cohesion: 0.67
Nodes (4): JwtAuthGuard, JWT Strategy, JwtWsGateway, AuthService

## Ambiguous Edges - Review These
- `Tech Stack (Locked): Frontend DOM+CSS+Motion.dev` → `Design doc: Browser-based game, Phaser/PixiJS frontend`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to
- `M2 — NPC Recall Feature Actually Wire-In (Flagship)` → `Changelog [0.1.0.0] — first tracked version`  [AMBIGUOUS]
  CHANGELOG.md · relation: conceptually_related_to
- `Recommendation: switch LOGIC_MODEL from cohere/north-mini-code:free to nvidia/nemotron-3-super-120b-a12b:free, keep CREATIVE_MODEL unchanged` → `Foundational Decision #15 baseline — Gemini 2.0 Flash (logic) / Claude 3.5 Sonnet (creative) / OpenRouter image models`  [AMBIGUOUS]
  docs/research/2026-08-06-t15-cost-model-reevaluation.md · relation: conceptually_related_to

## Knowledge Gaps
- **346 isolated node(s):** `TURN_STATUSES`, `TurnStatus`, `type`, `VALID_INTENT`, `ArtResult` (+341 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Tech Stack (Locked): Frontend DOM+CSS+Motion.dev` and `Design doc: Browser-based game, Phaser/PixiJS frontend`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `M2 — NPC Recall Feature Actually Wire-In (Flagship)` and `Changelog [0.1.0.0] — first tracked version`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Recommendation: switch LOGIC_MODEL from cohere/north-mini-code:free to nvidia/nemotron-3-super-120b-a12b:free, keep CREATIVE_MODEL unchanged` and `Foundational Decision #15 baseline — Gemini 2.0 Flash (logic) / Claude 3.5 Sonnet (creative) / OpenRouter image models`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Recreate Game Dev Studio (one-shot prompt)` connect `Game-Dev Agent Specialists` to `Project Root Documentation`, `Documentation Structure Guide`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `Final Test Results — @game-dev Hierarchy Validation + Production Blockers` connect `Documentation Structure Guide` to `NPC Memory & Retention Hooks`, `Project Root Documentation`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `docs/README.md — Documentation Structure` connect `Documentation Structure Guide` to `Project Root Documentation`, `Game-Dev Agent Specialists`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `TURN_STATUSES`, `TurnStatus`, `type` to the rest of the system?**
  _346 weakly-connected nodes found - possible documentation gaps or missing edges._