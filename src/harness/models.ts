import { ChatOpenRouter } from "@langchain/openrouter";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} not set. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

const apiKey = () => requireEnv("OPENROUTER_API_KEY");

// Decision #20: model calls via @langchain/openrouter's ChatOpenRouter, not a
// hand-rolled client. Model IDs are env-configurable — T15's cost-model pass
// hasn't picked final models yet, so the harness must not silently lock one in.
export function logicModel() {
  return new ChatOpenRouter({
    apiKey: apiKey(),
    model: process.env.LOGIC_MODEL ?? "google/gemini-2.0-flash-001",
    temperature: 0,
  });
}

export function creativeModel() {
  return new ChatOpenRouter({
    apiKey: apiKey(),
    model: process.env.CREATIVE_MODEL ?? "anthropic/claude-3.5-sonnet",
    temperature: 0.8,
  });
}

// T2: alt-model retry target for content-refusal fallback — a different
// provider/model than CREATIVE_MODEL so a refusal rooted in one provider's
// content policy has a real chance of not repeating on retry.
export function creativeAltModel() {
  return new ChatOpenRouter({
    apiKey: apiKey(),
    model: process.env.CREATIVE_MODEL_ALT ?? "nvidia/nemotron-3-super-120b-a12b:free",
    temperature: 0.8,
  });
}

export function imageModelId(): string {
  return process.env.IMAGE_MODEL ?? "google/gemini-2.5-flash-image";
}

export function openRouterApiKey(): string {
  return apiKey();
}
