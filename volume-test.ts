import { loadEnv } from "./src/harness/env.js";
loadEnv();

import { harnessGraph, ensureCheckpointer } from "./src/harness/graph.js";
import { SAMPLE_CHARACTERS } from "./src/harness/character.js";

const ITERATIONS = parseInt(process.env.ITERATIONS || "100", 10);
const SAMPLE_ACTIONS = [
  "I swing at the goblin",
  "I cast fireball",
  "I try to persuade the NPC",
  "I search for hidden traps",
  "I attack with my sword",
  "I cast shield spell",
  "I investigate the chest",
  "I negotiate with the merchant",
];

async function main() {
  // Creates the checkpointer's tables when DATABASE_URL is set; no-op otherwise.
  await ensureCheckpointer();

  const character = SAMPLE_CHARACTERS["mira-ashgrave"];
  const stats = {
    total: ITERATIONS,
    success: 0,
    failure: 0,
    totalMs: 0,
    minMs: Infinity,
    maxMs: 0,
    errors: [] as string[],
    // M4.2: a bare success/failure count can't tell a real narration from
    // every call being refused/timed-out and landing on the deterministic
    // template — this was the "100% success masked by fail-open fallback"
    // gap. Counted separately so template-fallback rate is a real number.
    narrationSource: { primary: 0, alt: 0, template: 0, none: 0 } as Record<string, number>,
  };

  console.log(`=== T14 Volume Test (${ITERATIONS} iterations) ===\n`);
  console.log(`Character: ${character.name}`);
  console.log(`Starting at ${new Date().toISOString()}\n`);

  for (let i = 0; i < ITERATIONS; i++) {
    const action = SAMPLE_ACTIONS[i % SAMPLE_ACTIONS.length];
    const start = performance.now();

    try {
      const result = await harnessGraph.invoke({
        playerAction: action,
        character,
        turnNumber: i + 1,
      });

      const elapsed = performance.now() - start;
      stats.totalMs += elapsed;
      stats.minMs = Math.min(stats.minMs, elapsed);
      stats.maxMs = Math.max(stats.maxMs, elapsed);

      if (result.gameEvent && result.narration) {
        stats.success++;
        const source = result.narrationSource ?? "none";
        stats.narrationSource[source] = (stats.narrationSource[source] ?? 0) + 1;
      } else {
        stats.failure++;
        stats.errors.push(`Turn ${i + 1}: missing gameEvent or narration`);
      }

      if ((i + 1) % 10 === 0) {
        process.stdout.write(`\r  ${i + 1}/${ITERATIONS} complete`);
      }
    } catch (err) {
      stats.failure++;
      const msg = err instanceof Error ? err.message : String(err);
      stats.errors.push(`Turn ${i + 1}: ${msg.substring(0, 80)}`);
    }
  }

  console.log("\n\n=== RESULTS ===");
  console.log(`Success: ${stats.success}/${stats.total} (${((stats.success / stats.total) * 100).toFixed(1)}%)`);
  console.log(`Failure: ${stats.failure}/${stats.total} (${((stats.failure / stats.total) * 100).toFixed(1)}%)`);
  console.log(`\nNarration source (of ${stats.success} successes):`);
  for (const [source, count] of Object.entries(stats.narrationSource)) {
    if (count === 0) continue;
    console.log(`  ${source}: ${count} (${((count / stats.success) * 100).toFixed(1)}%)`);
  }
  if (stats.narrationSource.template > 0) {
    console.log(
      `\n  ${stats.narrationSource.template} of ${stats.success} "successful" turns actually fell` +
        ` through to the deterministic template (LLM refusal/timeout/error on both primary and alt) —` +
        ` not a real model narration.`,
    );
  }
  console.log(`\nLatency (ms):`);
  console.log(`  Min: ${stats.minMs.toFixed(2)}`);
  console.log(`  Max: ${stats.maxMs.toFixed(2)}`);
  console.log(`  Avg: ${(stats.totalMs / stats.total).toFixed(2)}`);

  if (stats.errors.length > 0) {
    console.log(`\nFirst 5 errors:`);
    stats.errors.slice(0, 5).forEach((err) => console.log(`  - ${err}`));
  }

  console.log(`\nCompleted at ${new Date().toISOString()}`);

  // Exit with error if >5% failure
  if (stats.failure / stats.total > 0.05) {
    console.error(`\n⚠ ALERT: Failure rate >5% (${((stats.failure / stats.total) * 100).toFixed(1)}%)`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Volume test failed:", err);
  process.exit(1);
});
