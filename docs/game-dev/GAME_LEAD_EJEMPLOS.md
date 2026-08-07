# Ejemplos Prácticos — Cómo Usar @game-dev/game-lead

Copy-paste templates para comunicarte con game-lead sin ambigüedad.

---

## Template 1: ¿Es Divertido?

**Copia esto:**
```
@game-dev/game-lead

¿El core loop actual es divertido?

Context:
- Loop: Player action (free text) → D20 roll → LLM narration → turn result
- Loop time: ~30 segundos per turn
- Meta-progression: T19 (NPC recall), T26 (coterie assembly)
- Current concern: After 10 turns, players report repetitive

Question: Will players want to retry after death? 
What's the fun factor (1-10)?
```

**Qué esperas:**
- Game-lead delega a @gameplay-designer + @game-researcher
- Designer: "Fun score 6/10 → razón: lack of variation"
- Researcher: "Hades, Risk of Rain → similar loops pero con unlock progression. Patrón: [cosa]"
- Game-lead: "Loop es sólido pero meta-progression weak. Recommendation: boost T26 coterie unlocks before shipping."

---

## Template 2: ¿Este Código Escala?

**Copia esto:**
```
@game-dev/game-lead

¿El backend escala a 1000 concurrent players?

Context:
- Backend: NestJS + PostgreSQL
- Hot path: GraphService.runTurn() → TurnReservationService.reserve() → graph.invoke()
- Current: ~50 concurrent users max tested
- Concern: Will permadeath check + NPC recall query scale?

Question: 
- What's the scalability ceiling?
- What breaks first at 10x load?
- Quick wins vs major refactors?
```

**Qué esperas:**
- Game-lead delega a @gameplay-engineer (PRIMARY) + @performance-engineer (SECONDARY)
- Engineer: "Ceiling: 100 concurrent turns (DB upsert bottleneck). Maintainability: 6/10. Tech debt: NPC query is O(n) scan."
- Perf: "DB query hot loop: 50ms per turn at 10x load. Fix: add index on (user_id, created_at). Effort: 30min. Expected gain: 40ms saved."
- Game-lead: "Scale to ~500 players before major refactor needed. Quick win: DB index (30min). Medium term: batch upsert logic (1-2 days)."

---

## Template 3: Performance Spike

**Copia esto:**
```
@game-dev/game-lead

Turn resolution toma 3 segundos. ¿Qué es el bottleneck?

Context:
- Measured: Art generation takes 1.5s, LLM narration 1.0s, DB 0.5s
- Concern: Players complain turn is slow, especially with image generation
- Target: <1 segundo per turn

Question:
- Where to optimize first?
- Quick win vs long-term fix?
- Is this a blocker for ship?
```

**Qué esperas:**
- Game-lead delega a @performance-engineer (PRIMARY) + @gameplay-engineer (SECONDARY if needed)
- Perf: "Bottleneck: LLM API wait (1.0s, no fix). Art generation (1.5s, fixable via caching). DB (0.5s, fixable via index). Priority: art cache (2h) + DB index (30min). Expected: 1.5s → 0.8s."
- Game-lead: "Ship with art cache optimization. LLM latency is network bound (ok). Timeline: 2-3 hours for significant improvement."

---

## Template 4: Bug Report → Fix Recommendation

**Copia esto:**
```
@game-dev/game-lead

Jugador reporta: Permadeath no se triggeró a hp=0.

Context:
- Expected: Character dies at hp ≤ 0
- Actual: Character shows hp=-2, still alive
- Reproduction: (1) Create character with 10 hp. (2) Take 12 damage. (3) Character should die but doesn't.
- Impact: Game-breaking (players can't die)

Question:
- Is this a blocker?
- Root cause?
- Fix timeline?
```

**Qué esperas:**
- Game-lead delega a @qa-tester (PRIMARY) + @gameplay-engineer (SECONDARY)
- QA: "P0 Blocker. Reproduction confirmed. Expected: permadeath at hp≤0. Actual: hp goes negative, no death. Severity: game-breaking."
- Engineer: "Root cause: permadeath check uses `<` not `<=` at line 145 resolver.ts. Fix: change single character. Effort: 5min."
- Game-lead: "P0 blocker. Fix immediately (5min). Deploy before any player testing."

---

## Template 5: Feature Request with Risk Assessment

**Copia esto:**
```
@game-dev/game-lead

¿Agregamos portraits que evolucionan via AI cada playthrough?

Context:
- Feature: After cada victory, portrait updates (same archetype, different style/age)
- Goal: Increase replayability + emotional attachment
- Concern: Permadeath + portrait evolution = risky (portrait inconsistency could break immersion)

Question:
- Is this fun? Will it drive retention?
- Is it precedented? (other games doing this?)
- What's the scope cost?
- What are the risks?
- Should we do this before or after core loop ship?
```

**Qué esperas:**
- Game-lead delega en paralelo: @gameplay-designer + @game-researcher, async: @gameplay-engineer
- Designer: "Fun score: 7/10 if portrait stable, 2/10 if drift. Retention impact: medium positive (novelty). Risk: portrait consistency is key. Prerequisite: research image stability."
- Researcher: "No precedent shipped. Closest: Creatures (AI learning via neuroevolution). Risk assessment: novel = high failure chance. Mitigation: limit scope (same archetype only, no style drift)."
- Engineer: "Scope: 2-3 weeks (image pipeline + consistency logic). Blocker: image consistency research first (1 week). Tech debt: none if designed clean."
- Game-lead: "Fun but risky. Recommendation: (1) Research image stability (1 week). (2) Prototype limited scope. (3) Gate behind stable T14 core loop. NOT blocking initial ship."

---

## Template 6: Multi-Angle Decision (Complex)

**Copia esto:**
```
@game-dev/game-lead

¿Estamos listos para itch.io launch? Full diagnostic.

Context:
- Completed: T14 (core loop), T14b (DB persistence), T19 (NPC recall)
- Not yet: T26 (coterie), T27 (portrait evolution)
- Concern: Is current state shippable? What's blocking? What's nice-to-have?

Question:
- Is core loop fun enough for players to test?
- Are there game-breaking bugs?
- Does code scale to 100 concurrent players?
- What's the post-launch risk?
- What should we ship vs defer?
```

**Qué esperas:**
- Game-lead delega en paralelo a todos: @gameplay-designer + @qa-tester + @gameplay-engineer
- Designer: "Core loop fun score: 6/10. Retention signal: unknown (need player test). Meta-progression: weak. Gate: improve before shipping."
- QA: "0 blockers. 2 P1 exploits (permadeath skip, NPC dupe). 4 P2 polish issues (minor). Defer P2 post-launch."
- Engineer: "Maintainability: 6/10. Scalability: ok to 100 concurrent. Tech debt: 2 medium issues (NPC query O(n), tight coupling). Defer refactor post-launch."
- Game-lead: "Ready for limited closed beta. Blockers: (1) Fix 2 P1 exploits (2-3h). (2) Boost fun score via T26 unlock progression (research first). Ship timeline: 3 days if you fix exploits now."

---

## Template 7: Iteration / Post-Ship Analysis

**Copia esto:**
```
@game-dev/game-lead

Shipped to 50 players. Retention is 20% (expected 40%). 
What's broken?

Context:
- Core loop feedback: "felt repetitive after 10 turns"
- Permadeath feedback: "unfair, don't understand why I died"
- Art feedback: "portraits are cool but inconsistent"
- Completion rate: 30% finish first story (vs 80% target)

Question:
- Root cause of low retention?
- Is it design or execution?
- Quick fix vs deep refactor?
- Player expectations vs reality?
```

**Qué esperas:**
- Game-lead delega: @gameplay-designer (PRIMARY) + @game-researcher + @qa-tester
- Designer: "Root cause: loop lacks progression rhythm. Players hit diminishing returns after 10 turns. Meta-progression (unlock new archetypes, stat progression) missing. Fix: add T26 coterie assembly (retention pattern)."
- Researcher: "Player feedback alignment: Hades, Risk of Rain have 40-50% completion rate because of progressive unlocks. Pattern: meta-progression is retention driver, not just core loop."
- QA: "Permadeath clarity: no feedback on how damage calculated. Players confused about fairness. Fix: add damage breakdown UI (2h work)."
- Game-lead: "Retention issue is design (missing meta-progression), not bugs. Fixes: (1) Add T26 coterie unlocks (1-2w). (2) Clarify permadeath feedback (2h). (3) Art consistency research. Priority: meta-progression first (retention lever)."

---

## Cómo Leer Respuestas de Game-Lead

**Output esperado de game-lead:**

```
[Síntesis de 1-2 párrafos]
[Decision matrix: 2-3 opciones + pros/cons]
[Recommendation clara]
[Timeline / Effort]
[Siguiente paso]
```

**Ejemplo:**
```
Core loop está bien pero meta-progression débil. Retention va a ser baja sin progression rewards.

Options:
1. Ship as-is (fast, but retention risk)
   - Pro: market feedback on core loop
   - Con: players churn after 10 turns
   
2. Add T26 before ship (slower, but better retention)
   - Pro: unlock progression proven retention lever
   - Con: 1-2 week delay
   
3. Post-launch meta-progression (compromise)
   - Pro: ship fast, iterate with players
   - Con: need hotfix cycle, player trust risk

Recommendation: Option 3 (post-launch).
Timeline: Ship core loop now (3 days for exploits), add T26 within 1 week.
Next: Fix 2 P1 exploits today, then plan T26 research.
```

---

## Troubleshooting

### Game-lead no entiende tu request

```
Agrega context:
- What's the current state?
- What's the concern?
- What's the decision you need?
```

### Especialista responde fuera de su rol

Ej: gameplay-designer está haciendo code review
→ Redirige: "Preguntale a gameplay-engineer esto."

### Game-lead no sintetiza

Ej: Solo repite hallazgos sin recomendación
→ Presiona: "¿Cuál es tu recomendación? Opción A vs B?"

### Conflicto entre especialistas

Ej: Designer dice "agreguemos feature X" pero engineer dice "scope demasiado"
→ Game-lead debe resolver: "Design is solid pero scope alto. Recommendation: prototype limited version first."

---

## Pro Tips

1. **Sé específico.** "¿El core loop es fun?" vs "Revisá el gameplay."
2. **Incluí contexto.** Game-lead sintetiza mejor con números (loop time, player count, retention %).
3. **Define qué necesitas.** Decisión? Validación? Deep dive? Risk assessment?
4. **Confía en especialistas.** Si game-lead delega a designer, vas a tener análisis de diseño limpio. No pidas code review a designer.
5. **Iterar rápido.** "¿Cómo change X impacta retención?" → 15 min answer from game-lead (delegates to designer + researcher).

---

**Última actualización:** 2026-08-06  
**Listos para:** Delegación real, sin fallos
**Próximo:** Primera iteración con feedback real
