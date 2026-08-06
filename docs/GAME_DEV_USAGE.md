# Uso de @game-dev — Studio de Desarrollo de Juegos

Equipo especializado de agentes Claude para decisiones y análisis de desarrollo de juegos.

## Estructura del Studio

```
@game-dev/game-lead (director)
├── @gameplay-designer (diseño, mecánicas, diversión)
├── @gameplay-engineer (código, arquitectura, bugs)
├── @performance-engineer (optimización, CPU/GPU, memoria)
├── @qa-tester (bugs, edge cases, exploits)
└── @game-researcher (análisis competitivo, precedentes)
```

## Especialistas

| Agente | Cuándo Usar | Ejemplos |
|--------|-------------|----------|
| **@game-lead** | Decisiones complejas, delegación | "¿Agregamos permadeath?" |
| **@gameplay-designer** | Core loop, progresión, balance, diversión | "¿El loop es adictivo? Cómo mejorar retención?" |
| **@gameplay-engineer** | Código, refactor, bugs, arquitectura | "Revisá esto por mantenibilidad. ¿Escala a 10x?" |
| **@performance-engineer** | Velocidad, memoria, rendering | "Turn resolution es lento. Optimizá." |
| **@qa-tester** | Bugs, exploits, experiencia de jugador | "Encontrá edge cases en permadeath." |
| **@game-researcher** | Competencia, tendencias, GDC | "¿Qué juegos hacen NPC persistence? Cómo?" |

## Patrones de Uso

### 1. Decisión Compleja → Use @game-lead

```
@game-dev/game-lead
¿Agregamos coterie predefinido o team-building freeform?
Considera: diversión, complejidad, experiencia de jugador, tiempo.
```

→ game-lead delega a gameplay-designer + game-researcher + gameplay-engineer
→ game-lead sintetiza y recomienda

### 2. Especialista Específico → Use Directo

```
@game-dev/gameplay-engineer
Revisá src/backend/graph/graph.service.ts
¿Escala a 10x concurrent players? Qué optimizar primero?
```

→ Respuesta caveman (terse, directo)

### 3. Bug o Issue → Use @qa-tester

```
@game-dev/qa-tester
Jugador dice que permadeath no se triggeró con hp=0.
Reproducí el bug, root cause, cómo fixearlo.
```

### 4. Feature Research → Use @game-researcher

```
@game-dev/game-researcher
¿Qué juegos hacen retrato evolución via AI?
Precedentes, métricas de retención, riesgos.
```

## Dimensiones de Análisis

game-lead siempre evalúa:

### Jugador
- ¿Divertido?
- ¿Motivado a seguir jugando?
- ¿Feedback claro?

### Producción
- ¿Realista en tiempo?
- ¿Esfuerzo/complejidad?
- ¿Riesgos?

### Técnico
- ¿Escala?
- ¿Deuda técnica?
- ¿Alternativa más simple?

## Ejemplos Reales

### Idea: "Agregar sistema de alianzas multi-jugador"

```
@game-dev/game-lead
Estamos pensando agregar alianzas (2-4 jugadores comparten NPC).
¿Vale la pena? Impacto en mecánicas, scope, retención.
```

Esperá: game-lead delega a gameplay-designer + game-researcher + gameplay-engineer
Resultado: Análisis de diversión, precedentes, complejidad técnica, recomendación

### Issue: "Art cache toma mucha memoria"

```
@game-dev/performance-engineer
Memory leak en art cache. Generamos portrait pero no limpiamos.
Profileá, root cause, strategy de optimización.
```

Esperá: Análisis de memoria, bottleneck, solución

### Code: "¿Está listo para deploy?"

```
@game-dev/gameplay-engineer
Revisá el código T14 completo (backend + harness).
¿Hay bugs evidentes? ¿Escala a 1000 turns/min?
Output: caveman format (terse).
```

## Workflow Típico

1. **Traés problema/idea a @game-lead**
2. **game-lead clasifica** (diseño/código/perf/bug)
3. **game-lead delega** a 1-3 especialistas (paralelo)
4. **Especialistas responden** en caveman format (rápido)
5. **game-lead sintetiza** hallazgos + recomendación
6. **Vos decidís** → acción

## Principios del Studio

- **Diversión primero** — Si no es divertido, no se shipea
- **Arquitectura limpia** — Código vive 5+ años
- **Evitar over-engineering** — YAGNI > especulación
- **Respetar especialistas** — Saben su dominio
- **Cuestionar todo** — Desafiar malas ideas

## Invocación

### Opción 1: Directo en prompt

```
@game-dev/gameplay-engineer
[Tu pregunta]
```

### Opción 2: Vía @game-lead (para orquestación)

```
@game-dev/game-lead
[Tu pregunta compleja]
```

---

**Última actualización:** 2026-08-06  
**Studio:** Professional AI Game Development  
**Modelo:** Sonnet (game-lead), Haiku (especialistas)
