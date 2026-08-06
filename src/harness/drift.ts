import { loadEnv } from "./env.js";
loadEnv();

import { mkdirSync, writeFileSync } from "node:fs";
import { generateArt } from "./art.js";

// T22 (amended 2026-08-05): validates T27's portrait-edit identity drift over
// N sequential edits, and is used to empirically tune Decision #24's
// re-anchor cadence (K) — every K edits, re-anchor the edit chain from the
// ORIGINAL reference portrait instead of chaining from the last edit.
async function main() {
  const [character = "a hooded coterie member", editsArg = "10", kArg = "3"] =
    process.argv.slice(2);
  const numEdits = Number(editsArg);
  const K = Number(kArg);

  if (!Number.isFinite(numEdits) || !Number.isFinite(K) || K < 1) {
    console.error(
      'Usage: npm run harness:drift -- "<character description>" [numEdits=10] [K=3]',
    );
    process.exit(1);
  }

  const outDir = `drift-output-${Date.now()}`;
  mkdirSync(outDir, { recursive: true });

  console.log(`Generating original reference portrait for: "${character}"`);
  const original = await generateArt(character);
  if ("error" in original) {
    console.error(`Original portrait generation failed: ${original.error}`);
    process.exit(1);
  }
  await saveImage(original.url, `${outDir}/turn-0-original.txt`);
  console.log(`Turn 0 (original): ${original.url}`);

  let lastUrl = original.url;
  let editsSinceReanchor = 0;
  const cumulativeChanges: string[] = [];

  for (let turn = 1; turn <= numEdits; turn++) {
    const change = `wound/gear change #${turn}`;
    cumulativeChanges.push(change);

    const reanchor = editsSinceReanchor >= K;
    const referenceUrl = reanchor ? original.url : lastUrl;
    const prompt = reanchor
      ? `${character}. Cumulative state: ${cumulativeChanges.join(", ")}.`
      : `${character}. Apply: ${change}.`;

    const result = await generateArt(prompt, [referenceUrl]);
    if ("error" in result) {
      console.error(`Turn ${turn} failed: ${result.error}`);
      continue;
    }
    await saveImage(result.url, `${outDir}/turn-${turn}${reanchor ? "-reanchored" : ""}.txt`);
    console.log(
      `Turn ${turn}${reanchor ? " (RE-ANCHORED to original)" : ""}: ${result.url}`,
    );

    lastUrl = result.url;
    editsSinceReanchor = reanchor ? 0 : editsSinceReanchor + 1;
  }

  console.log(
    `\nDone. ${numEdits} edits saved to ${outDir}/ — eyeball turn-0 vs turn-${numEdits} for identity drift at K=${K}.`,
  );
}

// Save the URL (or, if the model returned a data: URI, decode it to a real
// image file) so the sequence can be eyeballed without re-fetching.
async function saveImage(url: string, path: string): Promise<void> {
  if (url.startsWith("data:image/")) {
    const b64 = url.split(",")[1] ?? "";
    writeFileSync(path.replace(/\.txt$/, ".png"), Buffer.from(b64, "base64"));
    return;
  }
  writeFileSync(path, url);
}

main().catch((err) => {
  console.error("Drift harness failed:", err);
  process.exit(1);
});
