import { test } from "node:test";
import assert from "node:assert/strict";
import { ArtService } from "../art-service.js";

test("ArtService", async (t) => {
  await t.test("returns cached result on hit", async () => {
    const mockGenerateArt = async () => ({ url: "https://example.com/art1.jpg" });
    const service = new ArtService(mockGenerateArt);

    const result1 = await service.generateArt("dragon-scene");
    const result2 = await service.generateArt("dragon-scene");

    assert.deepEqual(result1, { url: "https://example.com/art1.jpg" });
    assert.deepEqual(result2, { url: "https://example.com/art1.jpg" });
  });

  await t.test("calls generateArt once per unique archetype", async () => {
    let callCount = 0;
    const mockGenerateArt = async () => {
      callCount++;
      return { url: `https://example.com/art${callCount}.jpg` };
    };
    const service = new ArtService(mockGenerateArt);

    await service.generateArt("dragon-scene");
    await service.generateArt("dragon-scene");
    await service.generateArt("dragon-scene");
    await service.generateArt("forest-path");

    assert.equal(callCount, 2); // Called twice: dragon-scene once, forest-path once
  });

  await t.test("handles errors and does not cache them", async () => {
    let callCount = 0;
    const mockGenerateArt = async () => {
      callCount++;
      if (callCount === 1) {
        return { error: "network error" };
      }
      return { url: "https://example.com/art.jpg" };
    };
    const service = new ArtService(mockGenerateArt);

    const result1 = await service.generateArt("test-scene");
    const result2 = await service.generateArt("test-scene");

    assert.deepEqual(result1, { error: "network error" });
    assert.deepEqual(result2, { url: "https://example.com/art.jpg" });
    assert.equal(callCount, 2); // Retried after error
  });

  await t.test("cache hit works with reference images (no cache)", async () => {
    let callCount = 0;
    const mockGenerateArt = async (archetype: string, refs?: string[]) => {
      callCount++;
      return {
        url: `https://example.com/art${callCount}.jpg?refs=${refs?.length ?? 0}`,
      };
    };
    const service = new ArtService(mockGenerateArt);

    const result1 = await service.generateArt("dragon-scene", [
      "https://ref1.jpg",
    ]);
    const result2 = await service.generateArt("dragon-scene", [
      "https://ref1.jpg",
    ]);

    // Reference images bypass cache (T27 edit-chain always requests fresh)
    assert.equal(callCount, 2);
  });
});
