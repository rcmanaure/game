# Test Cases — Validación de Jerarquía @game-dev

Pruebas para validar delegación sin fallos.

---

## Test 1: Game-Lead Entiende y Delega Correctamente

### Caso: Feature Design Evaluation

**Input a game-lead:**
```
@game-dev/game-lead
¿Deberíamos agregar permadeath a nuestro juego?
Contexto: Core loop actual (explore→fight→upgrade) tiene retención 40%.
Concern: Permadeath podría mejorar o destruir diversión.
```

**Esperado:**
- ✅ Game-lead delega a @gameplay-designer (fun factor) + @game-researcher (precedent)
- ✅ NO delega a @gameplay-engineer (no es código)
- ✅ NO delega a @qa-tester (no es bug)
- ✅ NO delega a @performance-engineer (no es perf)

**Output esperado:**
```
Designer: "Permadeath adds tension (fun +2) but retention risk if unfair. 
Need clear feedback on damage calc. Fun score: 7/10 if fair, 3/10 if confusing."

Researcher: "Roguelikes (Hades, Nuclear Throne) all use permadeath. 
Retention pattern: permadeath + meta-progression (unlocks). 
Risk: permadeath alone = player churn (seen in Dark Souls difficulty spike).
Pattern: permadeath works if progression persists."

Game-lead: "Permadeath is proven retention pattern IF coupled with meta-progression.
Recommendation: Add permadeath + coterie unlocks together (not permadeath alone).
Timeline: 2 weeks (permadeath validation + unlock system).
Risk: if damage feedback unclear, retention drops 50%."
```

**Validación:**
- ✅ Designer talks design (fun, retention)
- ✅ Researcher cites shipped games (Hades, Nuclear Throne)
- ✅ Game-lead doesn't repeat, synthesizes + recommends
- ✅ No crosstalk (engineer didn't jump in)

---

## Test 2: Gameplay-Engineer Doesn't Do Design

### Caso: Code Architecture Question

**Input a game-lead:**
```
@game-dev/game-lead
Backend has tight coupling between GraphService and NpcService.
Is this maintainable for 10x scale?
```

**Esperado:**
- ✅ Game-lead delega a @gameplay-engineer (PRIMARY)
- ✅ Engineer does NOT say "but designers should..."
- ✅ Engineer focuses on: tight coupling risk, scalability, refactor path

**Output esperado:**
```
Engineer: "Tight coupling: GraphService.runTurn() calls NpcService directly.
Scalability issue at 10x: NPC query becomes O(n) scan (100ms per turn).
Maintainability: 5/10 (hard to change NPC logic without touching GraphService).
Fix: Inject NPC dependency, add interface layer (2-3 days refactor).
P2 tech debt: not blocking ship, but needs roadmap before 100 concurrent."
```

**Validación:**
- ✅ Engineer stays in code domain (coupling, maintainability, scalability)
- ✅ NO vague design talk ("should we rethink NPC architecture for design reasons")
- ✅ Concrete code fix provided
- ✅ Effort estimate accurate

---

## Test 3: QA-Tester Doesn't Do Code Review

### Caso: Bug Report

**Input a game-lead:**
```
@game-dev/game-lead
Player reports: Permadeath didn't trigger at hp=0.
Character shows hp=-2, still alive.
Reproducción: (1) 10hp char, (2) Take 12 damage, (3) Should die but doesn't.
```

**Esperado:**
- ✅ Game-lead delega a @qa-tester (PRIMARY) + @gameplay-engineer (SECONDARY for root cause)
- ✅ QA focuses on: reproduction, severity, exploit risk
- ✅ Engineer focuses on: root cause, code fix
- ✅ QA does NOT say "I think the algorithm is wrong"
- ✅ Engineer does NOT say "This is a bad mechanic"

**Output esperado:**
```
QA: "P0 Blocker. Reproduction: (1) Create char hp=10. (2) Take 12 damage.
(3) Expected: char dead, permadeath triggered. Actual: hp=-2, char alive.
Severity: game-breaking (players can't die). Exploit risk: high (skip mechanic).
Environment: web build 2026-08-06, tested 3x confirmed reproducible."

Engineer: "Root cause: Line 145 resolver.ts uses `hp < 0` check but permadeath 
uses `hp <= 0`. Off-by-one error. Fix: change `<` to `<=`. Effort: 5min.
P0 fix, deploy immediately."

Game-lead: "P0 blocker confirmed. Fix is 5 minutes. Deploy now before player testing."
```

**Validación:**
- ✅ QA owns reproducibility (not code)
- ✅ Engineer owns root cause + fix
- ✅ No bleed (QA doesn't do code analysis, Engineer doesn't do severity classification)
- ✅ Game-lead directs action (deploy now)

---

## Test 4: Performance-Engineer Doesn't Over-Optimize

### Caso: Slow Turn Resolution

**Input a game-lead:**
```
@game-dev/game-lead
Turn resolution is 3 seconds. Players complain.
Measured: LLM 1.0s, art generation 1.5s, DB 0.5s.
Target: <1 second.
```

**Esperado:**
- ✅ Perf engineer identifies bottlenecks, prioritizes player-visible gains
- ✅ Perf does NOT micro-optimize unchangeable things (LLM API latency)
- ✅ Perf measures before/after
- ✅ Engineer stays code-only (doesn't design loops)

**Output esperado:**
```
Perf: "Profiling breakdown:
- LLM API: 1.0s (network bound, no fix available, expected)
- Art generation: 1.5s (FIXABLE via caching, ~600ms save expected)
- DB query: 0.5s (FIXABLE via index, ~400ms save expected)

Bottleneck: Art generation (fixable). LLM latency is network (ok).
Quick wins: DB index (30min, 400ms save) + art cache (2h, 600ms save).
Expected result: 3.0s → 1.0s.
Test: profile after fixes to confirm gain."
```

**Validación:**
- ✅ Perf identifies what's fixable (art, DB) vs unchangeable (API latency)
- ✅ Measures before/after clearly
- ✅ Prioritizes player-visible (FPS/latency) over micro (allocation pooling)
- ✅ No vague recommendations

---

## Test 5: Game-Researcher Cites Sources, No Speculation

### Caso: Feature Precedent

**Input a game-lead:**
```
@game-dev/game-lead
Can we do NPC portrait evolution via AI? Has this shipped?
What's the risk?
```

**Esperado:**
- ✅ Researcher searches shipped games
- ✅ Researcher separates facts from speculation
- ✅ Researcher cites primary sources (GDC, postmortems, public data)
- ✅ Researcher identifies innovation risk (novel feature = high failure)

**Output esperado:**
```
Researcher: "FACTS:
- Creatures (1996): Used neuroevolution for creature design (novel at time, post-mortem: novelty was risky, ~60% retention)
- No AI portrait evolution shipped (unique, no precedent found)

INNOVATION RISK:
- Portrait consistency is unsolved (image generation drift = immersion break)
- Similar novel features: 50-60% success rate in post-launch
- Risk mitigation: limit scope (same archetype only, no style drift)

RECOMMENDATION:
- Not blocking v1 (too novel, too risky)
- Research image consistency first (1 week)
- Prototype limited scope (portraits of same character, age progression only)
- Gate behind stable core loop

SOURCES:
- GDC postmortem: Creatures (1996) novelty trade-offs
- Player feedback: Dark Souls (visual variety = retention +15%)
- No shipped precedent for AI portrait evolution (see risk mitigation)"
```

**Validación:**
- ✅ Clearly separates facts (Creatures) from analysis (risk assessment)
- ✅ Cites sources (GDC, postmortems)
- ✅ No speculation ("maybe players will like it")
- ✅ Innovation risk identified + mitigation suggested

---

## Test 6: Game-Designer Measures Fun Quantitatively

### Caso: Core Loop Fun Factor

**Input a game-lead:**
```
@game-dev/game-lead
Is our core loop (action→roll→narration→outcome) fun?
We've had 50 players test. 30% completed first story, 40% returned second session.
```

**Esperado:**
- ✅ Designer measures fun with metrics (fun score 1-10, retention signal, loop time)
- ✅ Designer does NOT say "I think it's fun" (no vague)
- ✅ Designer compares to industry baselines (Hades: 8/10, high retention)

**Output esperado:**
```
Designer: "CORE LOOP: Explore→Act→Roll→Narrate→Outcome. Cycle time: 20 seconds.

FUN SCORE: 6/10 (reason: loop is engaging but meta-progression weak).

RETENTION SIGNAL: 40% returned = weak (target: 60%+). Why?
- Players hit diminishing returns after 10 turns
- No progression unlock system (compare: Hades has unlock progression every 2-3 runs)
- Permadeath feels punishing without persistence reward

DIFFICULTY PACING: Good early, flat mid-game.

FEEDBACK CLARITY: Players understand win/lose clearly.

RECOMMENDATION: Add T26 coterie unlocks (retention lever).
Timeline: 1-2 weeks. Expected retention after: 60%+.
Industry baseline: Hades 8/10 (has 50%+ retention with unlock progression)."
```

**Validación:**
- ✅ Fun score quantified (not "I think it's fun")
- ✅ Retention signal measured (40% return rate)
- ✅ Industry baseline cited (Hades)
- ✅ Specific recommendation (unlock progression)

---

## Test 7: Multi-Specialist Convergence

### Caso: Full Ship Readiness Audit

**Input a game-lead:**
```
@game-dev/game-lead
Is T14 (core loop + recall) ready to ship to players?
Full diagnostic: fun? bugs? code quality? performance?
```

**Esperado:**
- ✅ Game-lead calls 3 specialists in parallel: designer + QA + engineer
- ✅ Performance-engineer called async (only if needed)
- ✅ Each specialista responds in their domain
- ✅ Game-lead synthesizes into 1-2 paragraph recommendation + decision matrix

**Output esperado:**
```
DESIGNER: "Fun score 6/10 (loop solid, meta-progression weak). 
Retention: unknown (need player test). Ready to test."

QA: "0 blockers. 2 P1 exploits (permadeath skip, NPC dupe). 4 P2 polish issues.
Exploits fixable in 2-3 hours."

ENGINEER: "Maintainability 6/10. Scalability ok to 100 concurrent. 
No P0 crashes. Code quality: acceptable for v1."

PERF: [called async, not critical] "Performance ok. No obvious bottlenecks at 50 player scale."

GAME-LEAD SYNTHESIS:
"Ready for limited player test (closed beta).

Blockers: Fix 2 P1 exploits (2-3h) + validate retention signal with players.

Options:
1. Ship now (fast, retention risk unknown)
2. Add meta-progression before ship (slower, better retention odds)
3. Ship + hotfix coterie unlocks (compromise, player feedback driven)

RECOMMENDATION: Option 3 (ship + 1-week hotfix).
Timeline: 3 days for P1 exploits, ship end of week, add T26 week 2.
Risk: player retention (need unlock progression). Mitigation: plan T26 architecture now."
```

**Validación:**
- ✅ 3 specialists respond in parallel (speed)
- ✅ Each owns their domain (no crosstalk)
- ✅ Game-lead doesn't repeat, synthesizes
- ✅ Decision matrix provided (options + pros/cons)
- ✅ Next step clear (fix exploits → ship)

---

## Test 8: Specialist Refuses Out-of-Domain

### Caso: Engineer Gets Design Question

**Input a game-engineer (direct, not via game-lead):**
```
@game-dev/gameplay-engineer
Should we add permadeath to make the game harder?
Is that a good design decision?
```

**Esperado:**
- ✅ Engineer redirects to designer
- ✅ Engineer does NOT answer design question
- ✅ Engineer stays in code domain

**Output esperado:**
```
Engineer: "That's a design question, not code.
Ask @game-dev/gameplay-designer: Is permadeath fun? Will it retain players?
I can tell you: if you add permadeath, here's the code impact:
- Resolver.ts needs death state trigger (30 lines)
- DB turn history needs permadeath flag (1 column)
- Scalability impact: none
- But whether to ADD permadeath → designer's call."
```

**Validación:**
- ✅ Engineer redirects appropriately
- ✅ Engineer stays technical
- ✅ Engineer clarifies: I can tell you CODE impact, but DESIGN decision is designer's

---

## Test 9: Researcher Refuses Speculation

### Caso: Unknown Feature

**Input a game-researcher (direct):**
```
@game-dev/game-researcher
Are blockchain NPCs (AI stored on-chain) viable for retention?
```

**Esperado:**
- ✅ Researcher searches for shipped precedent
- ✅ Researcher says "no precedent found" (not speculation)
- ✅ Researcher suggests risk mitigation instead

**Output esperado:**
```
Researcher: "FACTS:
- No shipped games use blockchain NPCs (searched GDC, major postmortems, Steam top 100)
- Blockchain games: mostly play-to-earn, low retention (~15-20% after launch)

INNOVATION RISK:
- Completely novel (0 precedent)
- High technical risk (blockchain reliability, cost)
- High player retention risk (blockchain adds complexity, not fun)

RECOMMENDATION:
- Not viable v1 (too novel, too risky)
- If you want NPC persistence: use traditional DB (proven, simpler)
- Blockchain adds cost without fun benefit

SOURCES:
- GDC postmortems: none on blockchain NPCs
- Steam data: blockchain games 50% below avg retention
- Why: complexity ≠ fun"
```

**Validación:**
- ✅ Researcher admits "no precedent"
- ✅ Researcher doesn't speculate ("maybe players will like it")
- ✅ Researcher suggests proven alternative (traditional DB)
- ✅ Researcher cites industry data (Steam, GDC)

---

## Test 10: Error Recovery (Delegación Fails)

### Caso: Specialist Responde Fuera de Dominio

**If gameplay-engineer accidentally does design analysis:**

**Expected game-lead correction:**
```
Game-lead spots: Engineer is talking about "fun factor" (design, not code).

Game-lead redirects:
"Engineer: stay in code domain (maintainability, scalability, bugs).
Designer: let's talk fun factor and retention.
Let me re-ask both correctly..."
```

**Validación:**
- ✅ Game-lead catches crosstalk
- ✅ Game-lead redirects without blame
- ✅ Process is self-healing

---

## Validation Checklist

**Per Test:**

- [ ] Correct specialist called (no over-delegation)
- [ ] Specialist responds in domain (no crosstalk)
- [ ] Output is specific + measurable (no vague)
- [ ] Game-lead synthesizes (not just repeats)
- [ ] Recommendation is actionable
- [ ] Timeline provided
- [ ] Next step clear

**Hierarchy Health:**

- [ ] Game-lead routing accuracy >90%
- [ ] Specialist crosstalk <5%
- [ ] Output specificity >85%
- [ ] Synthesis quality >80% (not just repeating)

---

## Cómo Ejecutar Tests

1. Enviá cada prompt arriba a @game-dev/game-lead o especialista
2. Documentá output en archivo test_results.txt
3. Validá contra checklist
4. Si falla: document error, propose fix

---

**Test Status:** Ready to run  
**Expected Pass Rate:** >85% accuracy + >90% no crosstalk  
**Validation:** Run weekly during active development
