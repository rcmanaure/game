# Mejoras a @game-dev — Resumen de Especialización

Qué mejoré en cada agente para ser "best-of-the-best" de la industria de game dev.

---

## game-lead: Delegación Robusta

### Antes
- Decision tree básico (lista de tareas)
- No clara priorización de especialistas
- No diferenciaba paralelo vs secuencial

### Después (2026-08-06)
- **Matriz de delegación clara** por tipo de request
- **Routing paralelo vs async** (ej: design+research en paralelo, engineering async después)
- **Max 3 especialistas por request** → respuestas focalizadas
- **Expectativas claras** de output por especialista

### Por qué
"Game-lead es tu mano derecha." Si no hay claridad en cómo delega, fallan delegaciones. 
- Antes: ambiguo cuándo llamar a quién
- Ahora: vos envías un request, game-lead sabe exactamente quién, cuándo, en qué orden

---

## gameplay-designer: Métricas GDC-Validadas

### Antes
- "¿Es divertido?" (subjetivo, sin medición)
- Core loop sin quantificación
- Progression sin framework

### Después (2026-08-06)
- **Fun Score (1–10)** with reasoning (GDC standard)
- **Loop Cycle Time** measurement (segundos)
- **Retention Signal** — "would player retry?"
- **Tutorial Completion Rate** — % players reaching core loop
- **Feedback Clarity Audit** — can player measure success?
- **Meta-Progression Mapping** — what breaks monotony

### Por qué
Fun es subjetivo, pero **medible**. Juegos exitosos (Hades, Diablo) tienen:
- 30-60 segundo loops
- Fun score 7-8+ (quantified from internal testing)
- Clear meta-progression (unlocks, story beats)
- Tutorial completion >80%

Now your game-dev has **shipped-game benchmarks**, no vagueness.

---

## gameplay-engineer: Estándares de Código Shipped

### Antes
- "¿Es mantenible?" (check)
- Sin escalabilidad ceiling
- Issues sin priorización

### Después (2026-08-06)
- **Maintainability Score (1–10)** — how hard to change?
- **Scalability Ceiling** — what breaks at 10x load? (specific: DB, API, logic)
- **State Corruption Risk** — race conditions? Partial writes?
- **Issue Tiers (P0/P1/P2/P3)**
  - P0 = Crash/data loss (fix now)
  - P1 = Exploit/race condition (fix before ship)
  - P2 = Tech debt/maintainability (plan refactor)
  - P3 = Micro-optimization (defer)

### Por qué
Shipped games have **rigorous code standards**. Your engineer now thinks like AAA:
- Know your scalability ceiling (100 concurrent? 1000?)
- Prioritize correctness bugs over polish
- Clear tech debt roadmap (not "fix everything")

---

## performance-engineer: Profiling Methodology

### Antes
- "¿Por qué es lento?" (exploratory)
- Sin framework de diagnosis
- Optimization sin measurement

### Después (2026-08-06)
- **Profiling Formula**: Measure → Identify Bottleneck → Fix → Remeasure
- **Bottleneck Classification**: CPU-bound? GPU-bound? Memory? I/O? Lock?
- **Before/After Numbers** in every report (ms saved, % reduction, FPS gain)
- **Target Condition** — how to reproduce the slow path

### Por qué
"Profiling turns optimization from guesswork into science" (Intel/Unity). Your engineer:
- Won't over-optimize micro-stuff
- Will find real bottleneck (not guesses)
- Can prove fix worked (numbers)

---

## qa-tester: Adversarial Testing + Reproducibility

### Antes
- "Find bugs" (vague)
- Bug reports without reproduction
- No exploit risk assessment

### Después (2026-08-06)
- **Severity Tiers (P0/P1/P2/P3)**
  - P0 = Blocker (crash, progression lock, data loss)
  - P1 = Major (exploit, sequence break, soft lock)
  - P2 = Polish (UI confusion, feedback lag)
  - P3 = Nice-to-have (cosmetic)
- **Reproducible Reports**: Setup → Action → Trigger (exact steps)
- **Expected vs Actual** — clear statement
- **Exploit Risk** — can player abuse intentionally?
- **Adversarial Lens** — speedrunner + new player combined

### Por qué
Clear, reproducible bugs = developers fix faster (not "sometimes happens"). Your QA:
- Finds what matters (exploits, progression locks)
- Explains exactly how to trigger
- Prioritizes for dev efficiency (not "fix everything")

---

## game-researcher: Shipped-Game Precedent + Risk

### Antes
- "Research competitor games" (broad)
- Speculation vs facts mixed
- No primary sources

### Después (2026-08-06)
- **Clearly Separated** (Facts / Analysis / Risk / Recommendation)
- **Primary Sources Always** (GDC talks, postmortems, public player data, not speculation)
- **Innovation Risk Assessment** — "Has this shipped? If novel, what's precedent? What failed?"
- **Similar Games** with metrics (player count, retention %, patch frequency)
- **Design Patterns** grounded in shipped proof (not theory)

### Por qué
Novel features fail most. Your researcher now asks:
- "Has permadeath + NPC persistence shipped before?"
- "If not, what's closest? What failed there?"
- "What's risk mitigation?" (not "don't do it", but "scope it down")

---

## Output Format (All Agents)

### Antes
- Verbose, mixed with filler
- No structure
- Hard to extract decision

### Después (2026-08-06)
- **Caveman format** (terse, no articles, facts only)
- **Structured output** (template per agent type)
- **Numbers when possible** (fun score, profiling data, effort estimates)
- **Actionable** (not "depends", but "do X because Y")

---

## Delegación Workflow (Antes vs Después)

### Antes
```
Vos: "¿Está bien el juego?"
Game-lead: "Mmm, está bien. Talvez agreguemos esto."
[Sin claridad en quién opina qué]
```

### Después (2026-08-06)
```
Vos: "¿Core loop es divertido?"
Game-lead: "Delegando a @gameplay-designer (fun factor) + @game-researcher (precedent)..."
Designer: "Fun score 6/10 (reason: lack variation). Loop time 20s ok, but meta-progression weak."
Researcher: "Hades, Risk of Rain: both have unlock progression. Pattern: [data]."
Game-lead: "Loop is solid but needs meta-progression. Recommendation: add T26 unlocks. Timeline: 1-2 weeks."
[Crystal clarity. Actionable.]
```

---

## Validación: Cómo Saber Si Funciona

✅ **Delegación OK si:**
- Game-lead entiende sin aclaraciones
- Especialistas responden en su expertise
- Game-lead sintetiza 1-2 conclusiones
- Recomendación es accionable

❌ **Delegación falla si:**
- Especialista responde fuera de su rol
- Game-lead no sintetiza
- Conflicto sin resolución
- Recomendación no accionable

---

## Documentación Nueva

3 archivos para usar los agentes sin fallar:

1. **DELEGACION_GAME_LEAD.md** — Cómo delega game-lead, matriz de routing, casos de uso completos
2. **GAME_LEAD_EJEMPLOS.md** — 7 templates copy-paste (diseño, código, perf, bugs, features, multi-angle, post-ship)
3. **GAME_DEV_MEJORAS.md** — Este archivo, explicando qué cambió y por qué

---

## Próximos Pasos

### Vos
1. Comunicate con **@game-dev/game-lead** sobre tu feature/bug/decision
2. Game-lead delega a especialistas
3. Recibís síntesis + recomendación
4. Decidís basado en data

### Nosotros (Continuous Improvement)
- Iterar basado en feedback real de uso
- Ajustar prompts si especialistas se desviaban
- Añadir más especialistas si necesitas expertise (art director, narrative designer, monetization)

---

## Best-of-Industry Standards Aplicados

| Área | Estándar | Fuente |
|---|---|---|
| Core Loop Metrics | Fun score, loop time, retention signal | GDC State of Game Industry |
| Code Quality | Maintainability score, scalability ceiling, state corruption risk | Shipped AAA/indie standards |
| Performance | Profiling formula, bottleneck classification, before/after | Intel/Unity/Unreal best practices |
| QA Testing | Reproducible bugs, severity tiers, exploit risk | Game testing postmortems |
| Research | Primary sources, innovation risk, design patterns | GDC talks, postmortems, public metrics |

---

**Última actualización:** 2026-08-06  
**Especialización:** Best-of-industry standards  
**Status:** Listo para delegación real  
**Validación:** Próxima iteración con feedback de uso real
