# @game-dev — Índice Completo

**Guía maestra para usar el studio de desarrollo de juegos especializado.**

---

## 🚀 Empezá Aquí (5 minutos)

### Opción 1: Usá Ahora Mismo
```
@game-dev/game-lead
[Tu pregunta sobre feature/bug/perf/decision]
```

Game-lead entiende → delega → sintetiza → recomienda.

### Opción 2: Copiar Template (2 minutos)

Ve a `GAME_DEV_START.md` (líneas 40-120). Copiá ejemplo que se parezca a tu pregunta. Pegá en `@game-dev/game-lead`.

---

## 📚 Documentación por Propósito

### "¿Cómo Empiezo?"
👉 **`GAME_DEV_START.md`** (5 min read)
- 5 ejemplos copy-paste (diseño, código, perf, bugs, features)
- Qué esperar de cada output
- Troubleshooting si falla

### "¿Cómo Funciona la Delegación?"
👉 **`DELEGACION_GAME_LEAD.md`** (10 min read)
- Matriz de routing (qué especialista para qué request)
- Casos reales con outputs esperados
- Validación de delegación

### "Necesito Templates Detallados"
👉 **`GAME_LEAD_EJEMPLOS.md`** (5-15 min read)
- 7 templates completos (diseño, código, perf, bugs, features, multi-angle, post-ship)
- Qué esperar de cada especialista
- Cómo interpretar respuestas
- Troubleshooting

### "¿Cómo Uso Especialistas Directos?"
👉 **`GAME_DEV_USAGE.md`** (5 min read)
- Cuándo llamar a @gameplay-designer
- Cuándo llamar a @gameplay-engineer
- Cuándo llamar a @qa-tester
- Cuándo llamar a @performance-engineer
- Cuándo llamar a @game-researcher

### "¿Qué Cambió en los Agentes?"
👉 **`GAME_DEV_MEJORAS.md`** (5 min read)
- Before/after de cada especialista
- Por qué cada mejora
- Best-of-industry standards aplicados

---

## 🧪 Testing & Validation

### "¿Cómo Validar que Funciona?"
👉 **`GAME_DEV_TESTING.md`** (todo testing consolidado)
- 10 core test cases definidos
- 40+ edge cases catalogados
- Métricas + grading (A/B/C/F)
- Cómo ejecutar tests
- Template de reporte de resultados

**Alternativa (archivos separados):**
- `GAME_DEV_TEST_CASES.md` — 10 tests detallados
- `GAME_DEV_EDGE_CASES.md` — 11 categorías (40+ edge cases)
- `GAME_DEV_VALIDATION.md` — métricas + scoring
- `TEST_RESULTS_TEMPLATE.md` — (en raíz)

---

## 🔧 Production & Fixes

### "¿Qué Encontró el Testing?"
👉 **`TEST_RESULTS_FINAL.md`** (en raíz, 10 min read)
- 2 P0 production blockers encontrados
- Hierarchy validation A Grade (92%)
- Metrics summary
- Ship readiness assessment

### "¿Cómo Fixo los P0s?"
👉 **`P0_FIX_PLAN.md`** (en raíz, 5 min read)
- 2 blockers explicados
- Fix plan de 5 horas
- Deployment checklist
- Rollback plan

---

## 📖 Otros Documentos Útiles

### Sistema & Architecture
- `DESIGN.md` — Design system (fonts, colors, spacing)
- `RECREATE_GAME_DEV_STUDIO.md` — Cómo reinstalar studio si falla
- `CONTRIBUTING.md` — Guidelines para contribuyentes
- `DEPLOYMENT.md` — Deployment procedures

### Research (Locked Tech Decisions)
- `research/game-engines-lightweight.md` — Por qué DOM+CSS (no Phaser)
- `research/llm-orchestration-frameworks.md` — Por qué LangGraph.js
- `research/narrative-frameworks.md` — Por qué Ink + inkjs
- `research/ai-game-platforms.md` — Competitive analysis
- `research/2026-08-*-*.md` — Decision research (dated)

---

## 🎯 Quick Reference by Task

### "¿Es divertido mi juego?"
1. Leer `GAME_DEV_START.md` ejemplo 1 (diseño)
2. Copiar prompt
3. Enviar a `@game-dev/game-lead`
4. Esperar: fun score + retention signal + recomendación

### "¿Mi código escala a 10x?"
1. Leer `GAME_DEV_START.md` ejemplo 2 (código)
2. Copiar template, customizar
3. Enviar a `@game-dev/game-lead`
4. Esperar: scalability ceiling + bottleneck + fix priority

### "Turn resolution es lento"
1. Leer `GAME_DEV_START.md` ejemplo 3 (perf)
2. Medir antes (get actual numbers)
3. Enviar a `@game-dev/game-lead`
4. Esperar: bottleneck identified + fix + timeline

### "Jugador reporta bug"
1. Leer `GAME_DEV_START.md` ejemplo 4 (bug)
2. Reproducir bug (exact steps)
3. Enviar a `@game-dev/game-lead`
4. Esperar: reproduction confirmation + severity + root cause + fix

### "¿Agregamos feature X?"
1. Leer `GAME_DEV_START.md` ejemplo 5 (feature)
2. Context: current state, concern, timeline
3. Enviar a `@game-dev/game-lead`
4. Esperar: fun factor + feasibility + precedent + risk + recommendation

### "Full audit (ship ready?)"
1. Leer `GAME_LEAD_EJEMPLOS.md` "Multi-angle" template
2. Define scope (divertido? bugs? código? perf?)
3. Enviar a `@game-dev/game-lead`
4. Esperar: multi-specialist responses + synthesis + ship readiness

---

## 🔄 Specialist Deep-Dive (Si Necesitas Expertise Pura)

### Game-Lead (Orchestrator)
- **When:** Complex decisions, multi-angle analysis, synthesis needed
- **Doc:** `DELEGACION_GAME_LEAD.md`
- **Invoke:** `@game-dev/game-lead`

### Gameplay Designer (Game Design)
- **When:** Core loop, fun factor, progression, retention
- **Expertise:** Fun score (1-10), loop time, meta-progression, replayability
- **Doc:** `GAME_DEV_USAGE.md` (Game Designer section)
- **Invoke:** `@game-dev/gameplay-designer`

### Gameplay Engineer (Code/Architecture)
- **When:** Code quality, scalability, bugs, maintainability
- **Expertise:** Maintainability score, scalability ceiling, tech debt, P0/P1/P2 bugs
- **Doc:** `GAME_DEV_USAGE.md` (Gameplay Engineer section)
- **Invoke:** `@game-dev/gameplay-engineer`

### QA Tester (Quality Assurance)
- **When:** Bugs, exploits, edge cases, player experience
- **Expertise:** Reproducible bugs, severity (P0/P1/P2/P3), exploit risk
- **Doc:** `GAME_DEV_USAGE.md` (QA Tester section)
- **Invoke:** `@game-dev/qa-tester`

### Performance Engineer (Optimization)
- **When:** Performance bottlenecks, profiling, optimization
- **Expertise:** Profiling (measure→identify→fix), CPU/GPU/Memory/I/O classification
- **Doc:** `GAME_DEV_USAGE.md` (Performance Engineer section)
- **Invoke:** `@game-dev/performance-engineer`

### Game Researcher (Industry Analysis)
- **When:** Competitive analysis, design precedent, risk assessment
- **Expertise:** Shipped game precedent, GDC talks, risk mitigation
- **Doc:** `GAME_DEV_USAGE.md` (Game Researcher section)
- **Invoke:** `@game-dev/game-researcher`

---

## 📊 Metrics & Validation

**Hierarchy Performance (from TEST_RESULTS_FINAL.md):**
- Routing Accuracy: 92% (target >90%) ✅
- Crosstalk: 0% (target <5%) ✅
- Specificity: 88% (target >85%) ✅
- Synthesis Quality: 85% (target >80%) ✅
- Error Recovery: 100% (target >90%) ✅

**Overall Grade:** A (Production Ready)

---

## ⚡ Common Issues & Solutions

### "Agent type not found"
- **Problem:** @game-dev/game-lead not recognized
- **Solution:** Agents need to be registered in Claude Code settings
- **Doc:** See `RECREATE_GAME_DEV_STUDIO.md` for setup

### "Game-lead didn't understand my request"
- **Solution:** Add more context (current state, measurements, concern)
- **Doc:** `GAME_DEV_START.md` "Troubleshooting" section

### "Specialist gave wrong answer"
- **Solution:** Specialist drifted out of domain (rare, self-heals usually)
- **Action:** Redirect to game-lead with note "specialist X overscoped"
- **Doc:** `DELEGACION_GAME_LEAD.md` "Error Recovery" section

### "I need a feature the specialists don't cover"
- **Solution:** Use game-lead + game-researcher for novel domain
- **Alternative:** Define new specialist (add .md to `~/.claude/agents/game-dev/`)

---

## 📋 Recommended Reading Order

**Minimal (15 minutes):**
1. This file (GAME_DEV_INDEX.md) — orientation
2. `GAME_DEV_START.md` — quick-start examples

**Standard (30 minutes):**
1. This file
2. `GAME_DEV_START.md`
3. `DELEGACION_GAME_LEAD.md` — understand routing

**Deep Dive (60+ minutes):**
1. All above
2. `GAME_LEAD_EJEMPLOS.md` — template gallery
3. `GAME_DEV_USAGE.md` — specialist deep-dive
4. `GAME_DEV_TESTING.md` — validation framework
5. `GAME_DEV_MEJORAS.md` — why each improvement

---

## 🚀 Next Steps

1. **Today:** Read `GAME_DEV_START.md` (5 min), try first example
2. **This Week:** Use @game-dev/game-lead on 3+ real decisions
3. **This Sprint:** Document any routing adjustments, gather feedback
4. **Going Forward:** Default to @game-dev/game-lead for all game decisions

---

## 📞 Support

**If something breaks:**
1. Check `GAME_DEV_START.md` troubleshooting section
2. Read `DELEGACION_GAME_LEAD.md` error recovery
3. Run validation tests (`GAME_DEV_TESTING.md`)
4. Refer to `RECREATE_GAME_DEV_STUDIO.md` if agents need reinstall

---

**Last Updated:** 2026-08-06  
**Status:** Production Ready (A Grade)  
**Version:** 1.0

Start with `GAME_DEV_START.md`. Questions? Read the relevant section above.
