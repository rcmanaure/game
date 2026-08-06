# Empezá Aquí — @game-dev Quick Start

Tu mano derecha de game development. Especialistas best-of-industry listos para ayudarte.

---

## 5 Segundos

Necesitas decisión sobre tu juego? Hablá con:

```
@game-dev/game-lead
[Tu pregunta]
```

Game-lead entiende, delega a especialistas, sintetiza, recomienda.

---

## Ejemplos Rápidos (Copy-Paste)

### "¿Es divertido el core loop?"

```
@game-dev/game-lead

¿El core loop actual (explore→fight→upgrade) es divertido para players?
Considera: 20-segundo loop, variación en combates, meta-progression pace.
Necesito: fun score, retention signal, recomendación.
```

**Esperá:** Designer dice fun score + razones. Researcher compara con Hades/Risk of Rain. Game-lead recomienda qué mejorar.

### "¿Este código escala?"

```
@game-dev/game-lead

¿El backend escala a 1000 concurrent players?
Preocupación: GraphService.runTurn() + NPC recall query.
Necesito: scalability ceiling, bottlenecks, quick wins.
```

**Esperá:** Engineer identifica ceiling (100 concurrent, DB bottleneck). Perf sugiere fix (DB index, 30min). Game-lead prioriza.

### "¿Por qué es lento?"

```
@game-dev/game-lead

Turn resolution toma 3 segundos. ¿Qué optimizar primero?
Medición: LLM 1.0s, art generation 1.5s, DB 0.5s.
Necesito: bottleneck, fix priority, timeline.
```

**Esperá:** Perf identifica art generation como fixable (cache). LLM es network bound (ok). Timeline: 2-3 horas.

### "¿Hay bugs?"

```
@game-dev/game-lead

Jugador reporta: Permadeath no se trigueó a hp=0.
Character shows hp=-2, still alive.
Reproducción: (1) 10 hp char. (2) Take 12 damage. (3) Should die.
Necesito: severity, root cause, fix.
```

**Esperá:** QA confirma P0 blocker. Engineer identifica root cause (line 145, `<` not `<=`). Fix: 5 minutes.

---

## Documentación (En Orden de Lectura)

1. **Este archivo** (2 min) — qué es, cómo empezar
2. `GAME_LEAD_EJEMPLOS.md` (5 min) — 7 templates copy-paste, qué esperar
3. `DELEGACION_GAME_LEAD.md` (10 min) — cómo delega game-lead, casos reales, validación
4. `GAME_DEV_MEJORAS.md` (5 min) — qué mejoró, por qué, best-of-industry standards

**Total:** 22 minutos para ser expert en @game-dev.

---

## Especialistas (Si Necesitas Expertise Pura)

```
@game-dev/gameplay-designer  # Diseño, loops, fun factor, retention
@game-dev/gameplay-engineer  # Código, arquitectura, scalability, bugs
@game-dev/qa-tester          # QA, bugs, exploits, reproducibilidad
@game-dev/performance-engineer  # Performance, profiling, bottlenecks
@game-dev/game-researcher    # Competencia, precedentes, risk assessment
```

**Pero preferencia:** Usa game-lead primero. Game-lead sintetiza para vos.

---

## Qué Esperar de game-lead

### Input
```
Tu pregunta clara + contexto
(qué preocupa, qué mediste, qué necesitas)
```

### Output
```
[Síntesis de 1-2 párrafos]
[Decision matrix: opciones + pros/cons]
[Recomendación clara]
[Timeline / Effort]
[Siguiente paso]
```

### Ejemplo Salida Real
```
Core loop está bien pero meta-progression débil. Retention va a ser baja sin progression rewards.

Options:
1. Ship as-is (fast, pero retention risk)
2. Add T26 coterie unlocks before ship (slower, mejor retention)  
3. Post-launch meta-progression (compromise)

Recommendation: Option 3.
Timeline: Ship core loop hoy (3 días para exploits). Add T26 dentro de 1 semana.
Next: Fix 2 P1 exploits. Then plan T26 research.
```

---

## Cómo Sé Si Funciona

✅ **Delegación OK:**
- Game-lead entiende tu request (no pide aclaraciones)
- Especialistas responden en su expertise
- Game-lead sintetiza (1-2 conclusiones claras)
- Recomendación es accionable

❌ **Delegación falla:**
- Especialista responde fuera de su rol
- Game-lead no sintetiza
- Recomendación ambigua ("depende")

---

## Troubleshooting

### Game-lead no entiende

Agregá más context:
```
Current state: T14 complete, 50 concurrent players tested
Concern: [Specific problem]
What I need: [Decision? Validation? Deep dive?]
```

### Especialista responde fuera de su rol

Redirige: "Preguntale al [especialista correcto] esto."

### Necesito respuesta rápida

Especificá en tu request: "Necesito decisión en 15 min" → game-lead usa menos especialistas.

---

## Status

✅ @game-dev está especializado (best-of-industry standards)  
✅ Documentación clara (ejemplos, casos reales, validación)  
✅ Listo para uso real sin fallos  
✅ Vos solo hablas con game-lead (simplicity for you, complexity handled inside)

---

## Siguientes Pasos

1. Léé `GAME_LEAD_EJEMPLOS.md` (5 min, templates)
2. Enviá tu primer request a @game-dev/game-lead
3. Iterá basado en feedback real

---

**¿Listo?** Copy-paste un ejemplo arriba y envialo a **@game-dev/game-lead**.

Game-dev es tu mano derecha.
