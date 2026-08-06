import { loadEnv } from "./src/harness/env.js";
loadEnv();

import { harnessGraph } from "./src/harness/graph.js";
import { SAMPLE_CHARACTERS } from "./src/harness/character.js";

async function main() {
  const character = SAMPLE_CHARACTERS["mira-ashgrave"];
  const playerAction = "I swing at the goblin";

  console.log("=== T14 Core Loop Performance Audit ===\n");
  console.log(`Testing with character: ${character.name}`);
  console.log(`Player action: "${playerAction}"\n`);

  // Measure total time
  const totalStart = performance.now();

  const result = await harnessGraph.invoke({
    playerAction,
    character,
  });

  const totalEnd = performance.now();
  const totalMs = totalEnd - totalStart;

  console.log(`\n=== RESULTS ===`);
  console.log(`Total turn latency: ${totalMs.toFixed(2)}ms`);
  console.log(`Game event: ${result.gameEvent?.summary}`);
  console.log(`Narration length: ${result.narration?.length} chars`);
  console.log(`Art URL: ${result.artUrl?.substring(0, 50)}...`);
}

main().catch((err) => {
  console.error("Perf test failed:", err);
  process.exit(1);
});
