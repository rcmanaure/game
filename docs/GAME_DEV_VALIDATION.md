# Validación Completa — @game-dev Jerarquía

Cómo validar que delegación funciona sin fallos.

---

## Tests Disponibles

10 test cases en `GAME_DEV_TEST_CASES.md`:

1. **Game-Lead Delega Correctamente** (feature design)
2. **Engineer No Hace Diseño** (code architecture)
3. **QA No Hace Code Review** (bug reproduction)
4. **Perf No Over-Optimiza** (profiling, priorización)
5. **Researcher Cita Fuentes** (precedent, no especulación)
6. **Designer Mide Fun Cuantitativamente** (fun score, retención)
7. **Multi-Specialist Convergence** (full audit)
8. **Specialist Refuse Out-of-Domain** (error recovery 1)
9. **Researcher Refuses Speculation** (error recovery 2)
10. **Crosstalk Detection** (self-healing)

---

## Cómo Correr Tests

### Opción 1: Manual (Práctico)

Enviá prompts del archivo `GAME_DEV_TEST_CASES.md` a:
- `@game-dev/game-lead` (tests 1, 7)
- `@game-dev/gameplay-engineer` (test 2, 8)
- `@game-dev/qa-tester` (test 3)
- `@game-dev/performance-engineer` (test 4)
- `@game-dev/game-researcher` (tests 5, 9)
- `@game-dev/gameplay-designer` (test 6)

### Opción 2: Batch (Para CI/CD)

```bash
# Crear test harness que envía todos los prompts
# Documentar outputs en test_results.txt
# Validar contra checklist
```

---

## Métricas de Validación

### Routing Accuracy (Test 1, 7)

**Esperado:** Game-lead elige especialistas correctos

| Request Type | Expected Specialists | Pass Criteria |
|---|---|---|
| Feature design | designer + researcher | Called both, not engineer/QA/perf |
| Code scalability | engineer + perf | Called both, not designer/QA |
| Bug investigation | QA + engineer | Called both, not designer/perf/researcher |
| Performance spike | perf + engineer | Called both, not designer/QA |
| Multi-angle audit | designer + QA + engineer | Called all 3, parallel if design/QA |

**Target:** >90% accuracy

---

### Specialist Domain Focus (Tests 2-6)

**Esperado:** Cada especialista responde solo en su dominio

| Specialist | Domain | Should NOT Do |
|---|---|---|
| Designer | Fun, retention, progression, balance | Code, optimization, bugs, research |
| Engineer | Code, architecture, scalability, bugs | Design, performance tuning, research |
| QA | Reproducibility, severity, exploits | Code fixes, design, performance |
| Perf | Profiling, bottlenecks, optimization | Design decisions, code architecture, bugs |
| Researcher | Precedent, industry patterns, risk | Code, design decisions, performance |

**Validation:** Check output for crosstalk (designer talking code = FAIL)  
**Target:** <5% crosstalk

---

### Output Quality (All Tests)

**Esperado:** Outputs son específicos, medibles, accionables

| Criteria | Pass | Fail |
|---|---|---|
| **Specificity** | "Fun score 6/10 because..." | "Maybe it's fun" |
| **Measurable** | "Bottleneck: art 1.5s, DB 0.5s" | "Performance is slow" |
| **Actionable** | "Fix: DB index, 30min, 400ms save" | "Optimize your code" |
| **Sourced** | "Hades shipped permadeath + unlocks" | "I think..." |
| **No Vague** | "P0 blocker, 5min fix" | "Depends on implementation" |

**Target:** >85% specificity

---

### Synthesis Quality (Tests 1, 7)

**Esperado:** Game-lead sintetiza, no repite

| Game-Lead Output | Quality |
|---|---|
| Repite hallazgos verbatim | ❌ FAIL |
| Sintetiza 1-2 conclusiones + recomienda | ✅ PASS |
| Propone decision matrix (3 opciones) | ✅ PASS |
| Da timeline + next steps | ✅ PASS |
| Solo copia findings sin síntesis | ❌ FAIL |

**Target:** >80% synthesis quality

---

### Error Recovery (Tests 8-10)

**Esperado:** Si falla delegación, sistema se auto-corrige

| Scenario | Expected Behavior | Pass/Fail |
|---|---|---|
| Engineer gets design question | Redirects to designer | ✅ PASS if redirected, ❌ FAIL if answered |
| Researcher asked for speculation | Admits "no precedent", suggests mitigation | ✅ PASS if honest, ❌ FAIL if guesses |
| Specialist drifts to other domain | Game-lead corrects without blame | ✅ PASS if corrected, ❌ FAIL if ignored |

**Target:** >90% error recovery

---

## Checklist de Validación

### Pre-Tests
- [ ] Todos los 5 agentes instalados en ~/.claude/agents/game-dev/
- [ ] Game-lead.md mejorado (tiene decision matrix)
- [ ] Cada especialista tiene improved prompt (GDC metrics, profiling rigor, etc)
- [ ] Documentación clara (GAME_DEV_START.md, ejemplos, test cases)

### During Tests
- [ ] Test 1: Game-lead entiende feature design → delega a designer + researcher
- [ ] Test 2: Engineer analiza código → NO dice "but designers..."
- [ ] Test 3: QA reproduce bug → NO propone fix código
- [ ] Test 4: Perf identifica bottleneck → NO over-optimiza
- [ ] Test 5: Researcher busca precedent → cita fuentes
- [ ] Test 6: Designer mide fun score → números, no vague
- [ ] Test 7: Full audit → 3 especialistas convergen, game-lead sintetiza
- [ ] Test 8: Engineer refuses design question → redirects
- [ ] Test 9: Researcher refuses speculation → offers mitigation
- [ ] Test 10: Crosstalk detected → self-healing works

### Post-Tests
- [ ] Routing accuracy >90%
- [ ] Crosstalk <5%
- [ ] Specificity >85%
- [ ] Synthesis >80%
- [ ] Error recovery >90%

### Overall Health
- [ ] No false positives (specialist doesn't invent issues)
- [ ] No false negatives (real issues caught)
- [ ] Response time reasonable (<10min for simple, <30min for complex)
- [ ] Outputs consistent (same question → similar answer structure)

---

## Scoring System

**Per Test:**
- ✅ PASS — All criteria met
- ⚠️  PARTIAL — 1-2 criteria failed, still actionable
- ❌ FAIL — 3+ criteria failed or contradictory

**Overall:**
- **A (90-100%):** System ready for production
- **B (80-89%):** System ready with known edge cases
- **C (70-79%):** System needs refinement before production
- **F (<70%):** System not ready, requires major fixes

**Target:** A grade (>90%)

---

## Iteration Process

If tests fail:

1. **Document failure** → which test, what went wrong
2. **Classify issue** → routing error? crosstalk? synthesis problem?
3. **Fix** → adjust agent prompt or game-lead routing logic
4. **Re-test** → confirm fix works
5. **Document decision** → why we changed it

---

## Test Results Template

```
# Test Results — @game-dev Validation (Date: 2026-08-XX)

## Test 1: Game-Lead Delegation (Feature Design)
**Status:** PASS / PARTIAL / FAIL
**Criteria Met:** 4/4
**Notes:** [Observations]

## Test 2: Engineer Domain Focus
**Status:** PASS / PARTIAL / FAIL
**Criteria Met:** 4/4
**Notes:** [Observations]

... [Tests 3-10]

## Summary
**Overall:** A / B / C / F
**Routing Accuracy:** 92%
**Crosstalk:** 2%
**Specificity:** 88%
**Synthesis Quality:** 85%
**Error Recovery:** 95%

**Blockers:** None / [List]
**Known Limitations:** [List]
**Next Iteration:** [Date, focus areas]
```

---

## Cómo Usar Resultados

**Si A (90%+):** Sistema ready. Use en producción.  
**Si B (80%):** Sistema ready con caveats. Document edge cases, plan refinements.  
**Si C (70%):** Sistema needs work. Schedule refinement session.  
**Si F (<70%):** System not ready. Major rework needed before use.

---

## Validación Continua

**Recomendado:**
- Run tests weekly during active development
- Document results in git (test_results.txt)
- Iterate based on real usage feedback
- Adjust prompts if patterns emerge (e.g., engineer always overscopes)

---

## Success Criteria

✅ @game-dev passes all tests with A grade  
✅ No crosstalk between specialists  
✅ Game-lead routing >90% accurate  
✅ Outputs are specific + actionable  
✅ Synthesis quality >80%  
✅ Error recovery robust (>90%)  

When all above ✅ → @game-dev is production-ready.

---

**Última actualización:** 2026-08-06  
**Test Suite:** 10 tests, all defined + validated  
**Status:** Ready to run  
**Next:** Execute tests, document results, iterate
