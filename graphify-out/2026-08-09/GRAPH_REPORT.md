# Graph Report - game  (2026-08-06)

## Corpus Check
- 70 files · ~70,834 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 906 nodes · 1243 edges · 74 communities (56 shown, 18 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ad195346`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- character.ts
- install.sh
- Game Development Terminology
- dependencies
- Game Development Basics
- scripts
- data-source.ts
- art.ts
- pipeline.py
- compilerOptions
- compilerOptions
- glb_merge_anims.py
- GraphService
- JwtWsGateway
- graph.service.ts
- OpenRouter image models for art generation
- app.module.ts
- RolesGuard
- fbx2glb.py
- merge_anim_glbs.py
- Voyage (Latitude AI RPG)
- main.ts
- Research: Game-Design Inspiration for AI-DM Coterie-Sim
- LangGraph.js
- HealthController
- Phaser 3
- glb_inspect.py
- Decision #26: Ink + inkjs for narrative (v1 scope)
- Mejoras a @game-dev — Resumen de Especialización
- Web APIs for Game Development
- glb_patch.py
- proc_anim_dragon.py
- rig_transfer.py
- seamless.py
- Asset Generation Workflow
- Contributing Guide
- JwtAuthGuard
- seg_dist
- DOM+CSS-first frontend (post-v1 alternative)
- JwtAuthGuard
- InitSchema1786034027189
- proc_rig_dragon.py
- D&D 5e d20 system for stat resolution
- Babylon.js
- backend/package.json
- Permadeath + Torpor as core stakes
- Tension with Foundational Decision #19-21 (Phaser/PixiJS)
- Deployment Guide
- Test Cases — Validación de Jerarquía @game-dev
- Validación Completa — @game-dev Jerarquía
- Uso de @game-dev — Studio de Desarrollo de Juegos
- Delegación @game-dev — Sistema Robusto de Especialistas
- Empezá Aquí — @game-dev Quick Start
- Test Results — @game-dev Hierarchy Validation
- T15 Cost-Model Re-evaluation (Quality > Velocity Pass)
- graph.ts
- state.ts
- Ejemplos Prácticos — Cómo Usar @game-dev/game-lead
- Research: Blockchain NPCs (On-Chain AI State) for Retention Viability
- AI Dungeon Master Coterie-Sim
- rules.ts
- PROMPT START HERE
- Design System — AI Dungeon Master Coterie-Sim
- narration.ts
- NpcEntity
- AddActiveChronicleIdToUser1786046005821
- Research: Player Character Portraits and Story Reuse
- Stylization — style contract for AI-generated assets
- GAME CREATION SYSTEM reference
- LangGraph.js orchestration framework
- NestJS + Postgres backend platform
- Research: Platform, Distribution, Monetization, Retention
- Research: Text-Game Tooling, Animation, Alternative Formats, Accessibility
- Voyage (Latitude) — multiplayer AI RPG competitor

## God Nodes (most connected - your core abstractions)
1. `log_info()` - 30 edges
2. `run_stage_body()` - 25 edges
3. `main()` - 23 edges
4. `Game Development Terminology` - 23 edges
5. `log_success()` - 20 edges
6. `log_warn()` - 20 edges
7. `Test Results — @game-dev Hierarchy Validation` - 18 edges
8. `Game Development Basics` - 15 edges
9. `install_desktop()` - 14 edges
10. `TurnEntity` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Rendering Pipeline Subsystem` --semantically_similar_to--> `Rendering Subsystem`  [INFERRED] [semantically similar]
  .agents/skills/game-engine/references/game-engine-core-principles.md → .agents/skills/game-engine/SKILL.md
- `Research: OpenRouter Free-Tier Model Candidates` --validates--> `OpenRouter image models for art generation`  [INFERRED]
  docs/research/2026-08-05-openrouter-free-model-candidates-research.md → CLAUDE.md
- `DOM+CSS-first frontend (post-v1 alternative)` --conceptually_related_to--> `Phaser/PixiJS game frontend engine`  [INFERRED]
  docs/research/2026-08-04-platform-and-business-research.md → CLAUDE.md
- `itch.io-first distribution strategy` --constrains--> `Phaser/PixiJS game frontend engine`  [INFERRED]
  docs/research/2026-08-04-platform-and-business-research.md → CLAUDE.md
- `Motion.dev for CSS tweens (5 KB alternative)` --supports--> `DOM+CSS-first frontend (post-v1 alternative)`  [INFERRED]
  CLAUDE.md → docs/research/2026-08-04-platform-and-business-research.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Shipped AI Game Platforms (2026)** — ai_dungeon_platform, novelai_platform, character_ai_platform, hidden_door_platform, voyage_platform [EXTRACTED 1.00]
- **Game Engine Alternatives for Text+Card Games** — phaser_engine, pixi_engine, konva_engine, dom_css_approach, babylon_engine, threejs_engine, godot_engine [EXTRACTED 1.00]
- **LLM Orchestration Framework Options** — langgraph_framework, langchain_framework, vercel_ai_sdk, anthropic_agent_sdk, rivet_framework, huggingface_agents [EXTRACTED 1.00]
- **JWT Authentication Implementation Components** — jwt_strategy, jwt_auth_guard, src_backend_auth_service, jwt_ws_gateway [EXTRACTED 1.00]

## Communities (74 total, 18 thin omitted)

### Community 0 - "character.ts"
Cohesion: 0.15
Nodes (14): Attribute, Character, CHARACTER_STATUSES, CharacterSchema, CharacterStatus, CharacterStatusSchema, SAMPLE_CHARACTERS, Skill (+6 more)

### Community 1 - "install.sh"
Cohesion: 0.10
Nodes (59): attempt_install_git(), check_git(), check_network_prerequisites(), check_node(), check_python(), clone_repo(), configure_browser_env_from_system_browser(), configure_managed_node_npm_prefix() (+51 more)

### Community 2 - "Game Development Terminology"
Cohesion: 0.05
Nodes (40): AAA (Triple-A) Games, AABB (Axis-Aligned Bounding Box), Game Development Techniques, Game UI Design Skill, Async Scripts Technique, Audio for Web Games Technique, Bresenham's Line Algorithm, Buff/Debuff Mechanic (+32 more)

### Community 3 - "dependencies"
Cohesion: 0.05
Nodes (43): dotenv, @langchain/langgraph, @langchain/langgraph-checkpoint-postgres, @langchain/openrouter, @nestjs/common, @nestjs/config, @nestjs/core, @nestjs/jwt (+35 more)

### Community 4 - "Game Development Basics"
Cohesion: 0.06
Nodes (37): Game Engine Core Design Principles, Game Engine Skill, Canvas 2D API, Canvas API (2D Drawing), CSS Styling, Data-Driven Design Principle, Entity-Component-System (ECS) Pattern, Event System Subsystem (+29 more)

### Community 5 - "scripts"
Cohesion: 0.07
Nodes (27): devDependencies, ts-node, tsx, @types/express, @types/node, @types/passport-jwt, typescript, name (+19 more)

### Community 6 - "data-source.ts"
Cohesion: 0.16
Nodes (11): ChronicleEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Column, CreateDateColumn (+3 more)

### Community 7 - "art.ts"
Cohesion: 0.23
Nodes (8): ArtResult, extractImageUrl(), generateArt(), placeholderUrl(), main(), saveImage(), loadEnv(), imageModelId()

### Community 8 - "pipeline.py"
Cohesion: 0.21
Nodes (16): composite_cross(), _cut_axis(), _edge_energy(), flatten_luminance(), _hcut_cyclic(), make_seamless(), match_colors(), offset_blend() (+8 more)

### Community 9 - "compilerOptions"
Cohesion: 0.13
Nodes (14): src, src/backend, compilerOptions, esModuleInterop, module, moduleResolution, outDir, resolveJsonModule (+6 more)

### Community 10 - "compilerOptions"
Cohesion: 0.14
Nodes (13): src/backend/**/*.ts, compilerOptions, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, module, moduleResolution, outDir (+5 more)

### Community 11 - "glb_merge_anims.py"
Cohesion: 0.32
Nodes (11): accessor_bytes(), append_accessor(), f32_bytes(), f32_list(), fix_root_scale(), main(), merge_clip(), node_names() (+3 more)

### Community 12 - "GraphService"
Cohesion: 0.29
Nodes (3): GraphService, Injectable, HarnessGraphState

### Community 13 - "JwtWsGateway"
Cohesion: 0.17
Nodes (8): ConnectedSocket, InjectRepository, MessageBody, JwtWsGateway, Injectable, SubscribeMessage, WebSocketGateway, WebSocketServer

### Community 14 - "graph.service.ts"
Cohesion: 0.21
Nodes (10): PrimaryColumn, Column, CreateDateColumn, Entity, Index, TURN_STATUSES, TurnEntity, TurnStatus (+2 more)

### Community 16 - "app.module.ts"
Cohesion: 0.20
Nodes (5): AuthService, JwtPayload, Injectable, JwtStrategy, Injectable

### Community 17 - "RolesGuard"
Cohesion: 0.25
Nodes (3): RolesGuard, Injectable, UserRole

### Community 18 - "fbx2glb.py"
Cohesion: 0.46
Nodes (7): clean_action_name(), fix_normals(), force_opaque_materials(), get_args(), main(), patch_glb_opaque(), push_all_actions_to_nla()

### Community 19 - "merge_anim_glbs.py"
Cohesion: 0.39
Nodes (7): fix_root_scale(), get_args(), import_clip(), main(), Import an animation GLB, keep its action (renamed), delete its objects., Detect & fix baked root scale; returns the factor or None., root_bone_name()

### Community 20 - "Voyage (Latitude AI RPG)"
Cohesion: 0.29
Nodes (8): AI Dungeon (Latitude), Character.AI, Hidden Door, Midjourney Storytelling Lab, NovelAI, Cross-playthrough NPC memory + recall surfacing, Voyage as direct competitor, Voyage (Latitude AI RPG)

### Community 21 - "main.ts"
Cohesion: 0.29
Nodes (4): Catch, Module, AppModule, AllExceptionsFilter

### Community 22 - "Research: Game-Design Inspiration for AI-DM Coterie-Sim"
Cohesion: 0.67
Nodes (3): AI Dungeon (Latitude) — AI DM competitor, Research: Game-Design Inspiration for AI-DM Coterie-Sim, Hidden Door — hybrid AI narrative competitor

### Community 23 - "LangGraph.js"
Cohesion: 0.29
Nodes (7): Anthropic Claude Agent SDK, HuggingFace Transformers Agents, LangChain.js, LangGraph.js current orchestration, LangGraph.js, Rivet (Visual AI App Builder), Vercel AI SDK

### Community 24 - "HealthController"
Cohesion: 0.29
Nodes (4): Controller, Get, InjectDataSource, HealthController

### Community 25 - "Phaser 3"
Cohesion: 0.29
Nodes (7): DOM + CSS + Canvas Hybrid, DOM+CSS-first frontend architecture, Godot (Web Export), KaPlay (Kaboom fork), Konva.js, Phaser 3, Pixi.js

### Community 26 - "glb_inspect.py"
Cohesion: 0.53
Nodes (5): accessor_values(), find_skeleton_roots(), main(), Joint nodes whose parent is not itself a joint (per skin)., read_glb()

### Community 27 - "Decision #26: Ink + inkjs for narrative (v1 scope)"
Cohesion: 0.50
Nodes (4): Decision #26: Ink + inkjs for narrative (v1 scope), Ink + inkjs narrative templating engine, Quality over velocity principle (2026-08-06), Scope Decision #4: Persistent NPC recall (v1 scope)

### Community 28 - "Mejoras a @game-dev — Resumen de Especialización"
Cohesion: 0.05
Nodes (37): Antes, Antes, Antes, Antes, Antes, Antes, Antes, Antes (+29 more)

### Community 29 - "Web APIs for Game Development"
Cohesion: 0.40
Nodes (5): Web APIs for Game Development, asm.js Subset, Emscripten Toolchain, Fullscreen API, WebAssembly (Wasm)

### Community 30 - "glb_patch.py"
Cohesion: 0.70
Nodes (4): main(), patch_materials(), read_glb(), write_glb()

### Community 31 - "proc_anim_dragon.py"
Cohesion: 0.60
Nodes (3): bake_action(), get_args(), main()

### Community 32 - "rig_transfer.py"
Cohesion: 0.70
Nodes (4): clean_action_name(), get_args(), main(), world_bbox()

### Community 33 - "seamless.py"
Cohesion: 0.70
Nodes (4): flatten_luminance(), make_seamless(), offset_blend(), periodic_component()

### Community 34 - "Asset Generation Workflow"
Cohesion: 0.40
Nodes (5): Asset Generation Workflow, AutoSprite Generation Model, Game Design System Reference, Higgsfield Game Generation Skill, Spritesheet Generation

### Community 35 - "Contributing Guide"
Cohesion: 0.06
Nodes (31): Architecture Decisions, Author Footer, Backend Logs, Before PR, Before Starting, Code Conventions, Code Review Checklist, Commit Conventions (+23 more)

### Community 37 - "seg_dist"
Cohesion: 0.67
Nodes (3): main(), distance from point p to segment ab, seg_dist()

### Community 38 - "DOM+CSS-first frontend (post-v1 alternative)"
Cohesion: 0.50
Nodes (4): DOM+CSS-first frontend (post-v1 alternative), itch.io-first distribution strategy, Motion.dev for CSS tweens (5 KB alternative), Phaser/PixiJS game frontend engine

### Community 39 - "JwtAuthGuard"
Cohesion: 0.67
Nodes (4): JwtAuthGuard, JWT Strategy, JwtWsGateway, AuthService

### Community 47 - "Deployment Guide"
Cohesion: 0.08
Nodes (23): Build for Itch.io, Build Steps (Planned, Not v1), CORS Configuration (⚠️ Critical for Itch.io), Deployment Guide, Electron Scaffold (Placeholder for T25+), Environment, Environment Variables for Production, Itch.io Deployment (v1) (+15 more)

### Community 48 - "Test Cases — Validación de Jerarquía @game-dev"
Cohesion: 0.08
Nodes (23): Caso: Bug Report, Caso: Code Architecture Question, Caso: Core Loop Fun Factor, Caso: Engineer Gets Design Question, Caso: Feature Design Evaluation, Caso: Feature Precedent, Caso: Full Ship Readiness Audit, Caso: Slow Turn Resolution (+15 more)

### Community 49 - "Validación Completa — @game-dev Jerarquía"
Cohesion: 0.09
Nodes (22): Checklist de Validación, Cómo Correr Tests, Cómo Usar Resultados, During Tests, Error Recovery (Tests 8-10), Iteration Process, Métricas de Validación, Opción 1: Manual (Práctico) (+14 more)

### Community 50 - "Uso de @game-dev — Studio de Desarrollo de Juegos"
Cohesion: 0.09
Nodes (21): 1. Decisión Compleja → Use @game-lead, 2. Especialista Específico → Use Directo, 3. Bug o Issue → Use @qa-tester, 4. Feature Research → Use @game-researcher, Code: "¿Está listo para deploy?", Dimensiones de Análisis, Ejemplos Reales, Especialistas (+13 more)

### Community 51 - "Delegación @game-dev — Sistema Robusto de Especialistas"
Cohesion: 0.10
Nodes (20): Best Practices de Comunicación, Bugs / Issues / Reproducibilidad, Caso 1: "¿El juego está listo para ship?", Caso 2: "Performance spike en art cache", Casos de Uso — Workflow Completo, CON game-lead, Código / Arquitectura / Mantenibilidad, Delegación @game-dev — Sistema Robusto de Especialistas (+12 more)

### Community 52 - "Empezá Aquí — @game-dev Quick Start"
Cohesion: 0.10
Nodes (20): 5 Segundos, Cómo Sé Si Funciona, Documentación (En Orden de Lectura), Ejemplo Salida Real, Ejemplos Rápidos (Copy-Paste), Empezá Aquí — @game-dev Quick Start, "¿Es divertido el core loop?", Especialista responde fuera de su rol (+12 more)

### Community 53 - "Test Results — @game-dev Hierarchy Validation"
Cohesion: 0.10
Nodes (20): Appendix: Raw Outputs, Executive Summary, Issue 1: [Title], Issue 2: [Title], Issues Found, Metric Summary, Next Iteration Planning, Observations & Recommendations (+12 more)

### Community 54 - "T15 Cost-Model Re-evaluation (Quality > Velocity Pass)"
Cohesion: 0.11
Nodes (17): 1. Logic Model: Gemini 2.0 Flash, 2. Creative Model: Claude 3.5 Sonnet, 3. Image Model: OpenRouter Image APIs, Action Items, Before Launch, Context, Cost Analysis, Decision Framework (+9 more)

### Community 55 - "graph.ts"
Cohesion: 0.21
Nodes (15): ATTRIBUTES, narrate(), resolve(), rulesValidate(), State, apiKey(), creativeAltModel(), creativeModel() (+7 more)

### Community 56 - "state.ts"
Cohesion: 0.14
Nodes (15): AttributeSchema, CriticalTierSchema, LogicIntentRaw, LogicIntentRawSchema, LogicIntentSchema, nullableString, nullableStringOrNumber, OpponentTierSchema (+7 more)

### Community 57 - "Ejemplos Prácticos — Cómo Usar @game-dev/game-lead"
Cohesion: 0.12
Nodes (15): Conflicto entre especialistas, Cómo Leer Respuestas de Game-Lead, Ejemplos Prácticos — Cómo Usar @game-dev/game-lead, Especialista responde fuera de su rol, Game-lead no entiende tu request, Game-lead no sintetiza, Pro Tips, Template 1: ¿Es Divertido? (+7 more)

### Community 58 - "Research: Blockchain NPCs (On-Chain AI State) for Retention Viability"
Cohesion: 0.13
Nodes (14): Centralized DB cost:, Context: What We're Optimizing For, Finding 1: Blockchain Games Have Modest Retention; It's Driven by Speculation, Not Narrative, Finding 2: Latency Kills the Slow-Paced Narrative Experience, Finding 3: Wallet UX Remains a Massive Barrier, Even with Embedded Wallets, Finding 4: No Shipping Games Store NPC AI State On-Chain, Finding 5: Cost Analysis Shows Centralized DB Wins on Every Axis, Finding 6: No Cross-Game NPC Trading/Interop Use Case Exists (+6 more)

### Community 59 - "AI Dungeon Master Coterie-Sim"
Cohesion: 0.14
Nodes (13): AI Dungeon Master Coterie-Sim, Architecture, Commands, Deployment, Development Conventions, Docs, Environment Variables, Key Files (+5 more)

### Community 60 - "rules.ts"
Cohesion: 0.26
Nodes (12): clampAttributeModifier(), modifierFor(), clampTargetNumber(), computeCriticalTier(), OpponentTier, PlayerRoll, resolveCheck(), rollD20() (+4 more)

### Community 61 - "PROMPT START HERE"
Cohesion: 0.15
Nodes (12): Agents to Create, Backup This File, Documentation to Create, How to Use This File, Key Behaviors Embedded, One-Shot: Recreate Game Dev Studio, Output After Creation, Project Integration (+4 more)

### Community 62 - "Design System — AI Dungeon Master Coterie-Sim"
Cohesion: 0.17
Nodes (11): Accessibility (carries forward from research already done this session), Aesthetic Direction, Color, Decisions Log, Design System — AI Dungeon Master Coterie-Sim, Layout, Motion, Product Context (+3 more)

### Community 63 - "narration.ts"
Cohesion: 0.42
Nodes (6): contentToString(), deterministicNarration(), isRefusal(), narrateWithFallback(), NarrationResponse, outcomeLabel()

### Community 64 - "NpcEntity"
Cohesion: 0.33
Nodes (6): NpcEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn

## Knowledge Gaps
- **405 isolated node(s):** `UV_NO_CONFIG`, `name`, `version`, `private`, `type` (+400 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `JwtWsGateway` connect `JwtWsGateway` to `app.module.ts`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `GraphService` connect `GraphService` to `app.module.ts`, `NpcEntity`, `JwtWsGateway`, `graph.service.ts`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `UV_NO_CONFIG`, `name`, `version` to the rest of the system?**
  _405 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `install.sh` be split into smaller, more focused modules?**
  _Cohesion score 0.10359964881474978 - nodes in this community are weakly interconnected._
- **Should `Game Development Terminology` be split into smaller, more focused modules?**
  _Cohesion score 0.052564102564102565 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._