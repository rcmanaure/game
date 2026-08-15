import type { ArtResult } from "./art.js";

export type GenerateArtFn = (
  archetype: string,
  referenceImageUrls?: string[],
) => Promise<ArtResult>;

/**
 * Wraps art generation with caching. Cache is keyed on archetype only
 * (references bypass cache — T27 edit-chain needs fresh generation).
 * Errors are not cached — a retry will attempt fresh generation.
 * Enables T13's archetype-cache and T27's edit-chain without modification.
 */
export class ArtService {
  private cache = new Map<string, ArtResult>();

  constructor(private generateArtFn: GenerateArtFn) {}

  async generateArt(
    archetype: string,
    referenceImageUrls?: string[],
  ): Promise<ArtResult> {
    // Reference images bypass cache (T27 edit-chain always requests fresh)
    if (referenceImageUrls?.length) {
      return this.generateArtFn(archetype, referenceImageUrls);
    }

    // Check cache for this archetype
    const cached = this.cache.get(archetype);
    if (cached) {
      return cached;
    }

    // Cache miss: generate, store if success, return
    const result = await this.generateArtFn(archetype);
    if ("url" in result) {
      this.cache.set(archetype, result);
    }
    // Don't cache errors — allow retry on next call
    return result;
  }
}
