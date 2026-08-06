import { STYLE_FORMULA } from "./style-formula.js";
import { imageModelId, openRouterApiKey } from "./models.js";

const OPENROUTER_IMAGES_URL = "https://openrouter.ai/api/v1/images";

export type ArtResult = { url: string } | { error: string };

// Testing knob: skip the paid OpenRouter image call entirely and return a
// free placeholder (picsum.photos, no key/signup/cost) so the LOGIC/CREATIVE
// pipeline can be exercised without burning image-gen credits. Deterministic
// per archetype (same seed -> same photo) so re-runs are comparable. Unset
// (or "false") to use real art generation.
function placeholderUrl(archetype: string): string {
  const seed = encodeURIComponent(archetype);
  return `https://picsum.photos/seed/${seed}/512/512`;
}

/**
 * Decision #20's note: OpenRouter image-model calls stay a plain REST call,
 * not routed through ChatOpenRouter — nothing in the LangChain JS API
 * surfaces an image-gen content type for it.
 *
 * referenceImageUrls present -> image-to-image edit (T27's drift-mitigation
 * path); absent -> fresh generation (T13's archetype-cache path).
 */
export async function generateArt(
  archetype: string,
  referenceImageUrls?: string[],
): Promise<ArtResult> {
  if (process.env.DISABLE_IMAGE_GEN === "true") {
    return { url: placeholderUrl(archetype) };
  }

  const prompt = `${archetype}. ${STYLE_FORMULA}`;
  const body: Record<string, unknown> = { model: imageModelId(), prompt };
  if (referenceImageUrls?.length) {
    body.input_references = referenceImageUrls.map((url) => ({
      type: "image_url",
      image_url: { url },
    }));
  }

  let res: Response;
  try {
    res = await fetch(OPENROUTER_IMAGES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return { error: `network error: ${(err as Error).message}` };
  }

  if (!res.ok) {
    return { error: `OpenRouter images API ${res.status}: ${await res.text()}` };
  }

  const json = (await res.json()) as Record<string, unknown>;
  // Response shape isn't pinned down in LangChain's docs (OpenRouter-specific
  // endpoint) — accept the OpenAI-images-API-style conventions OpenRouter's
  // own docs model this on, and fail loud with the raw payload if none match
  // rather than guess silently.
  const url = extractImageUrl(json);
  if (!url) {
    return { error: `unrecognized response shape: ${JSON.stringify(json)}` };
  }
  return { url };
}

function extractImageUrl(json: Record<string, unknown>): string | null {
  const data = (json.data ?? json.images) as
    | Array<Record<string, unknown>>
    | undefined;
  const first = data?.[0];
  if (!first) return null;
  if (typeof first.url === "string") return first.url;
  if (typeof first.b64_json === "string") {
    return `data:image/png;base64,${first.b64_json}`;
  }
  return null;
}
