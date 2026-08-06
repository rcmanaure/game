import { loadEnv } from "./src/harness/env.js";
loadEnv();

import { harnessGraph } from "./src/harness/graph.js";
import { SAMPLE_CHARACTERS } from "./src/harness/character.js";

async function main() {
  let character = SAMPLE_CHARACTERS["mira-ashgrave"];
  const actions = [
    "I swing at the goblin",
    "I try to reason with the creature",
    "I move closer to observe its behavior",
  ];

  console.log("=== T14 Multi-Turn Latency Samples ===\n");

  for (const action of actions) {
    const start = performance.now();
    const result = await harnessGraph.invoke({
      playerAction: action,
      character,
    });
    const ms = (performance.now() - start).toFixed(2);
    character = result.character;

    console.log(`Turn: "${action}"`);
    console.log(`  Latency: ${ms}ms`);
    console.log(`  Event: ${result.gameEvent?.summary}`);
    console.log(`  Narration: ${result.narration?.substring(0, 70)}...`);
    console.log();
  }
}

main().catch((err) => {
  console.error("Multi-turn test failed:", err);
  process.exit(1);
});
