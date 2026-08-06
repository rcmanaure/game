import { loadEnv } from "./env.js";
loadEnv();

import { harnessGraph } from "./graph.js";
import { SAMPLE_CHARACTERS } from "./character.js";

// T22: fire a handful of turns end-to-end (resolve -> narrate -> art-trigger,
// no auth/DB/UI) and print the result for eyeballing narration/art quality
// before T1-T14's full-platform work starts.
async function main() {
  const [characterFlag, ...rest] = process.argv.slice(2);
  let characterId = "mira-ashgrave";
  let actions = [characterFlag, ...rest].filter(Boolean) as string[];

  if (characterFlag === "--character") {
    characterId = rest[0];
    actions = rest.slice(1);
  }

  if (actions.length === 0 || !SAMPLE_CHARACTERS[characterId]) {
    console.error(
      'Usage: npm run harness -- ["--character <id>"] "player action 1" ["player action 2" ...]',
    );
    console.error(`Known characters: ${Object.keys(SAMPLE_CHARACTERS).join(", ")}`);
    process.exit(1);
  }

  for (const [i, playerAction] of actions.entries()) {
    console.log(`\n=== Turn ${i + 1} (${characterId}): "${playerAction}" ===`);
    const result = await harnessGraph.invoke({ playerAction, characterId });

    const e = result.gameEvent!;
    console.log(
      `Check: ${e.rollType} ${e.attribute}${e.skillOrDiscipline ? `+${e.skillOrDiscipline}` : ""} ` +
        `roll=${e.roll}${e.cravingDie ? ` craving=${e.cravingDie}` : ""} mod=${e.modifier} ` +
        `vs DC ${e.targetNumber} -> ${e.success ? "SUCCESS" : "FAIL"} (${e.criticalTier})`,
    );
    if (Object.keys(e.statDeltas).length) {
      console.log(`Stat deltas: ${JSON.stringify(e.statDeltas)}`);
    }
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
