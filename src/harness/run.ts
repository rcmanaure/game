import { loadEnv } from "./env.js";
loadEnv();

import { harnessGraph, ensureCheckpointer } from "./graph.js";
import { SAMPLE_CHARACTERS } from "./character.js";

// T22: fire a handful of turns end-to-end (resolve -> rulesValidate ->
// narrate -> art-trigger, no auth/DB/UI) and print the result for
// eyeballing narration/art quality before T1-T14's full-platform work
// starts. T1's rules-validator needs a mutating character to gate against
// — the character now persists ACROSS turns within one CLI invocation
// (in-memory only, no DB per T22's scope; T4/T14 own real persistence).
async function main() {
  // Creates the checkpointer's tables when DATABASE_URL is set; no-op otherwise.
  await ensureCheckpointer();

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

  let character = SAMPLE_CHARACTERS[characterId];

  for (const [i, playerAction] of actions.entries()) {
    console.log(`\n=== Turn ${i + 1} (${characterId}): "${playerAction}" ===`);
    const result = await harnessGraph.invoke({ playerAction, character });
    character = result.character; // carry any mutation into the next turn

    const e = result.gameEvent!;
    const vsDetail =
      e.rollType === "opposedCheck"
        ? `vs opponent roll=${e.opponentRoll} (${e.opponentTier})`
        : `vs DC ${e.targetNumber}`;
    console.log(
      `Check: ${e.rollType} ${e.attribute}${e.skillOrDiscipline ? `+${e.skillOrDiscipline}` : ""} ` +
        `roll=${e.roll}${e.cravingDie ? ` craving=${e.cravingDie}` : ""} mod=${e.modifier} ` +
        `${vsDetail} -> ${e.success ? "SUCCESS" : "FAIL"} (${e.criticalTier})`,
    );
    if (Object.keys(e.statDeltas).length) {
      console.log(`Stat deltas: ${JSON.stringify(e.statDeltas)}`);
    }
    console.log(`Character: ${character.hp}/${character.maxHp} hp, status=${character.status}, craving=${character.craving}`);
    console.log(`Narration: ${result.narration}`);
    if (result.artUrl) {
      console.log(`Art: ${result.artUrl}`);
    } else {
      console.log(`Art FAILED: ${result.artError}`);
    }

    if (character.status === "dead") {
      console.log(`\n${character.name} has met Final Death — no further turns can be taken.`);
      break;
    }
  }
}

main().catch((err) => {
  console.error("Harness run failed:", err);
  process.exit(1);
});
