import { loadEnv } from "./env.js";
loadEnv();

import { harnessGraph } from "./graph.js";

// T22: fire a handful of turns end-to-end (resolve -> narrate -> art-trigger,
// no auth/DB/UI) and print the result for eyeballing narration/art quality
// before T1-T14's full-platform work starts.
async function main() {
  const actions = process.argv.slice(2);
  if (actions.length === 0) {
    console.error(
      'Usage: npm run harness -- "player action 1" ["player action 2" ...]',
    );
    process.exit(1);
  }

  for (const [i, playerAction] of actions.entries()) {
    console.log(`\n=== Turn ${i + 1}: "${playerAction}" ===`);
    const result = await harnessGraph.invoke({ playerAction });

    console.log(`GameEvent: ${JSON.stringify(result.gameEvent)}`);
    console.log(`Narration: ${result.narration}`);
    if (result.artUrl) {
      console.log(`Art: ${result.artUrl}`);
    } else {
      console.log(`Art FAILED: ${result.artError}`);
    }
  }
}

main().catch((err) => {
  console.error("Harness run failed:", err);
  process.exit(1);
});
