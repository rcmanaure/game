# Delegación @game-dev — Sistema Robusto de Especialistas

Cómo **@game-lead** delega tareas a especialistas para decisiones confiables sin fallos.

---

## Principio

Vos hablas solo con **@game-dev/game-lead**. Game-lead:
1. **Entiende** tu request
2. **Clasifica** el tipo de problema
3. **Delega** a 1-3 especialistas específicos (paralelo si corresponde)
4. **Sintetiza** hallazgos
5. **Recomienda** acción

Delegación = sin fallos porque cada especialista tiene función clara.

---

## Matriz de Delegación (Robust)

### Diseño / Mecánicas / Diversión

**Tu request:** "¿Es divertido el core loop actual?"

Game-lead delega:
- **@gameplay-designer** (PRIMARY) — analiza loop, fun score, retention signal
- **@game-researcher** (SECONDARY) — busca juegos similares, patrones probados

Output esperado:
- Designer: "Loop time = 20s. Fun score = 6/10 (razón: variación insuficiente). Meta-progresión: missing."
- Researcher: "Diablo, Hades, Risk of Rain 2 — todos tienen 30-60s loops + meta-progression unlock. Patrón: [cosa]."
- Game-lead: "Loop está débil. Falta X. Recomendación: [acción basada en precedente]."

### Código / Arquitectura / Mantenibilidad

**Tu request:** "¿Este código escala a 10x jugadores?"

Game-lead delega:
- **@gameplay-engineer** (PRIMARY) — code review, scalability ceiling, tech debt
- **@performance-engineer** (SECONDARY, async) — si hay hotspots evidentes

Output esperado:
- Engineer: "GraphService.runTurn() — maintainability 6/10. Scalability ceiling: 100 concurrent turns (DB upsert bottleneck). Fix: batch inserts. P2 debt: tight coupling NPC query."
- Perf: "DB query hot loop detected. Estimated 50ms per turn at 10x load. Fix: add NPC cache. Effort: 2h."
- Game-lead: "Escala pero requiere refactor urgente (DB batch). Prioritario antes de multiplicar jugadores."

### Performance / Velocidad / Memoria

**Tu request:** "¿Por qué Turn resolution toma 2 segundos?"

Game-lead delega:
- **@performance-engineer** (PRIMARY) — profiling, bottleneck identification
- **@gameplay-engineer** (SECONDARY) — si es código loco (algorithm, not memory)

Output esperado:
- Perf: "Profiled turn resolution: 800ms LLM API wait (no fix), 600ms art generation (fixable), 500ms NPC DB query (fixable). Priority: art cache + DB index."
- Engineer (if needed): "NPC query is O(n) scan. Add index on (user_id, created_at DESC). Effort: 30min."
- Game-lead: "2s = mostly API latency (normal). Quick wins: DB index (30min) + art cache (2h). Estimated: 1.5s after."

### Bugs / Issues / Reproducibilidad

**Tu request:** "Jugador dice que permadeath no triggeró en hp=0."

Game-lead delega:
- **@qa-tester** (PRIMARY) — reproduction, exact steps, severity
- **@gameplay-engineer** (SECONDARY) — root cause análisis

Output esperado:
- QA: "P0 Blocker. Reproduction: (1) Create char hp=10. (2) Take 12 damage. (3) Expected: dead. Actual: alive, hp=-2. Environment: web client, build 2026-08-06."
- Engineer: "Root cause: permadeath check uses `<=` pero hp puede ser negative. Line 145 in resolver.ts. Fix: change to `<=0 || hp < 0` (defensive). Actually just `hp <= 0`."
- Game-lead: "Bug confirmado P0. Fix 5min. Deploy immediately."

### Features Nuevas / Risk Assessment

**Tu request:** "¿Agregamos NPC que evoluciona via portrait AI cada playthrough?"

Game-lead delega:
- **@gameplay-designer** (PRIMARY) — fun factor, progression impact
- **@game-researcher** (PRIMARY) — precedent, risk
- **@gameplay-engineer** (SECONDARY, async) — scope cost

Output esperado:
- Designer: "Loop impact: medium positive (novelty factor). Retention: +? (unproven). Risk: portrait drift kills immersion. Fun score: 7/10 if stable, 3/10 if broken. Prerequisite: image consistency research."
- Researcher: "No juego ha shipeado esto. Similar: Creatures (AI learning, but not visual). Risk: novel = high failure chance. Mitigation: limit scope (same archetype, only color/style evolution)."
- Engineer: "Scope: 3-4 weeks (image pipeline + consistency logic + model selection). Tech debt: none if done clean. Blocker: need image consistency research first."
- Game-lead: "Divertido pero riesgoso. Recomendación: (a) investigar image consistency primero (1 semana), (b) prototype scope limitado, (c) gate behind stable core loop (T14 first)."

---

## Casos de Uso — Workflow Completo

### Caso 1: "¿El juego está listo para ship?"

```
@game-dev/game-lead
Acabamos de terminar T14 (core loop + recall). ¿Está listo para show a players?
Reviså: divertido? bugs? problemas evidentes? risk?
```

**Game-lead classifica:** Multi-angle review (diseño + código + QA)

**Delega en paralelo:**
- @gameplay-designer → "¿Loop es adictivo? Replayability?"
- @qa-tester → "¿Hay blockers? Exploits?"
- @gameplay-engineer → "¿Código es mantenible? Escalabilidad ok?"

**Síntesis game-lead:**
- Designer: "Fun score 7/10. Loop es bueno pero meta-progression weak. Retention: unknown (need player test)."
- QA: "0 P0 blockers. 2 P1 exploits (permadeath skip, NPC recall dupe). 4 P2 polish."
- Engineer: "Maintainability 7/10. Scalability ok hasta 100 concurrent turns."

**Recomendación game-lead:**
```
Ready for limited player test (closed beta).
Blocker: fix 2 P1 exploits (2h).
Nice-to-have: polish P2 (cosmetic, defer post-launch).
Test hypothesis: "Players want to retry after death" (retention signal).
```

### Caso 2: "Performance spike en art cache"

```
@game-dev/game-lead
Art cache usa 2GB después de 100 turns. Memory leak?
Investigå: root cause, fix, timeline.
```

**Game-lead classifica:** Performance + code issue

**Delega:**
- @performance-engineer (PRIMARY) → memory profiling, bottleneck
- @gameplay-engineer (SECONDARY) → code audit

**Output:**
- Perf: "Heap dump shows 50MB × 40 cached portraits = 2GB. No leak; cache growing as designed. Issue: no eviction policy. Fix: LRU eviction (keep latest 10, purge old). Effort: 2h."
- Engineer: "Cache class missing eviction logic. If you add, no tech debt. Code clean."

**Recomendación:**
```
Not a leak; cache design issue. 
Fix: add LRU eviction policy (2h work).
Test: verify heap stable after 1000 turns.
Future: consider disk cache for oldest portraits (defer).
```

---

## Especialistas — Funciones Específicas

| Especialista | Input | Output | Tempo |
|---|---|---|---|
| **@gameplay-designer** | Mechanic idea, loop question, progression | Fun score, retention signal, design recommendation | ~5-10 min |
| **@gameplay-engineer** | Code review, architecture, scalability | Maintainability score, tech debt, bugs, fix recommendation | ~10-20 min |
| **@performance-engineer** | Speed issue, memory spike, frame drop | Bottleneck identification, profiling, fix priority | ~5-15 min |
| **@qa-tester** | Player complaint, exploit report, bug | Reproducible steps, severity, exploit risk | ~10-20 min |
| **@game-researcher** | Feature comparison, market research, precedent | Similar games, design patterns, risk assessment | ~15-30 min |

---

## Routing Rules (Fallback Si Game-Lead Falla)

Si game-lead no delega correctamente, tú puedes invocar especialista directo:

```
# Si necesitas diseño puro (sin síntesis):
@game-dev/gameplay-designer
¿El loop es divertido?

# Si necesitas code review directo:
@game-dev/gameplay-engineer
Revisá src/backend/graph/graph.service.ts por mantenibilidad.

# Si necesitas QA directo:
@game-dev/qa-tester
Encontrá bugs en permadeath mechanic (edge cases).

# Si necesitas research directo:
@game-dev/game-researcher
¿Qué juegos hacen permadeath + NPC persistence?
```

**Pero preferencia: game-lead primero.** Game-lead sintetiza para vos.

---

## Validación de Delegación (Cómo Saber Si Funciona)

**✅ Delegación OK si:**
- Game-lead entiende tu request (no pregunta aclaraciones)
- Especialistas responden en su expertise (designer ≠ code, QA ≠ architecture)
- Game-lead sintetiza 1-2 conclusiones claras
- Recomendación es accionable (no "depende")

**❌ Delegación falla si:**
- Especialista responde fuera de su rol (designer hace code review)
- Game-lead no sintetiza (solo repite hallazgos)
- Conflicto entre especialistas sin resolución
- Recomendación no accionable

---

## Best Practices de Comunicación

### CON game-lead

```
Claro:
"¿El core loop actual (explore→fight→upgrade→repeat) es divertido?
Considera: 20s cycle time, variación en combates, meta-progression pace."

No claro:
"¿Está bueno el gameplay?"
```

### Qué esperar de game-lead

- Respuesta en 1-3 párrafos (síntesis, no dump)
- Decision matrix clara (3 opciones + pros/cons)
- Timeline realista (effort tags: 2h / 1d / 1w)
- Siguiente paso obvio (test? implement? research first?)

### Qué NO esperar

- Code changes (game-lead only recommends)
- Implementation (especialistas provide recommendations only)
- Guarantees sin player testing (all estimates)

---

## Especialización Industry Best-Practice

Cada agente incorpora:
- **GDC standards** (core loop metrics, fun score, retention data)
- **Shipped game precedent** (comps, postmortems, public metrics)
- **Profiling rigor** (measure before/after, identify bottleneck, fix, remeasure)
- **Reproducible processes** (bug reports, severity tiers, fix prioritization)
- **Caveman output** (terse, no filler, facts only)

---

## Próximos Pasos

1. **Comunicate con game-lead** sobre feature/bug/performance
2. **Game-lead delega** a especialistas apropiados
3. **Especialistas responden** en su expertise
4. **Game-lead sintetiza** + recomienda
5. **Vos decidís** basado en recomendación

**No hables con especialistas directo a menos que necesites expertise pura.** Game-lead es tu mano derecha.

---

**Última actualización:** 2026-08-06  
**Validación:** Especialistas mejorados con best-of-industry standards  
**Próximo:** Iterar basado en feedback real de uso
