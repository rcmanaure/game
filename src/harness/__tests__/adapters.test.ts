import { test } from "node:test";
import assert from "node:assert";
import type { PromptAdapter, ModelConfig } from "../adapters.js";
import { LogicAdapter, CreativeAdapter } from "../adapters.js";

test("LogicAdapter builds model with correct config", () => {
  const adapter = new LogicAdapter({
    modelId: "test/model",
    temperature: 0,
    retryBudget: 2,
    maxTokens: 1024,
    apiKey: "test-key",
  });

  const model = adapter.getModel();
  assert(model, "model should be defined");
  assert.strictEqual(model.model, "test/model");
  assert.strictEqual(model.temperature, 0);
});

test("CreativeAdapter builds model with correct config", () => {
  const adapter = new CreativeAdapter({
    modelId: "test/creative",
    temperature: 0.8,
    retryBudget: 2,
    maxTokens: 2048,
    apiKey: "test-key",
  });

  const model = adapter.getModel();
  assert(model, "model should be defined");
  assert.strictEqual(model.model, "test/creative");
  assert.strictEqual(model.temperature, 0.8);
});

test("LogicAdapter uses default retry policy", () => {
  const adapter = new LogicAdapter({
    modelId: "test/model",
    temperature: 0,
    retryBudget: 1,
    maxTokens: 1024,
    apiKey: "test-key",
  });

  const policy = adapter.getRetryPolicy();
  assert.strictEqual(policy.budget, 1);
  assert.strictEqual(policy.strategy, "parse-error");
});

test("CreativeAdapter uses refusal retry policy", () => {
  const adapter = new CreativeAdapter({
    modelId: "test/creative",
    temperature: 0.8,
    retryBudget: 2,
    maxTokens: 2048,
    apiKey: "test-key",
  });

  const policy = adapter.getRetryPolicy();
  assert.strictEqual(policy.budget, 2);
  assert.strictEqual(policy.strategy, "content-refusal");
});

// fromEnv() is the one place that reads the environment, so these two tests
// own the key themselves rather than depending on a populated .env.
test("respects env-configured model IDs", () => {
  const original = process.env.LOGIC_MODEL;
  process.env.LOGIC_MODEL = "env/override";
  process.env.OPENROUTER_API_KEY ??= "test-key";

  const adapter = LogicAdapter.fromEnv();
  const model = adapter.getModel();

  assert.strictEqual(model.model, "env/override");

  if (original) process.env.LOGIC_MODEL = original;
  else delete process.env.LOGIC_MODEL;
});

test("falls back to default model ID when env not set", () => {
  const original = process.env.LOGIC_MODEL;
  delete process.env.LOGIC_MODEL;
  process.env.OPENROUTER_API_KEY ??= "test-key";

  const adapter = LogicAdapter.fromEnv();
  const model = adapter.getModel();

  assert.strictEqual(model.model, "google/gemini-2.0-flash-001");

  if (original) process.env.LOGIC_MODEL = original;
});

test("CreativeAdapter getAltModel returns a ChatOpenRouter instance", () => {
  const adapter = new CreativeAdapter({
    modelId: "test/creative",
    temperature: 0.8,
    retryBudget: 1,
    maxTokens: 2048,
    apiKey: "test-key",
  });

  const altModel = adapter.getAltModel();
  assert(altModel, "alt model should be defined");
  assert(altModel.model, "alt model should have a model ID");
});

test("CreativeAdapter alt model uses fallback model ID when env not set", () => {
  const original = process.env.CREATIVE_MODEL_ALT;
  delete process.env.CREATIVE_MODEL_ALT;

  const adapter = new CreativeAdapter({
    modelId: "test/creative",
    temperature: 0.8,
    retryBudget: 1,
    maxTokens: 2048,
    apiKey: "test-key",
  });

  const altModel = adapter.getAltModel();
  assert.strictEqual(altModel.model, "nvidia/nemotron-3-super-120b-a12b:free");

  if (original) process.env.CREATIVE_MODEL_ALT = original;
  else delete process.env.CREATIVE_MODEL_ALT;
});

test("CreativeAdapter alt model respects env-configured model ID", () => {
  const original = process.env.CREATIVE_MODEL_ALT;
  process.env.CREATIVE_MODEL_ALT = "test/alt-override";

  const adapter = new CreativeAdapter({
    modelId: "test/creative",
    temperature: 0.8,
    retryBudget: 1,
    maxTokens: 2048,
    apiKey: "test-key",
  });

  const altModel = adapter.getAltModel();
  assert.strictEqual(altModel.model, "test/alt-override");

  if (original) process.env.CREATIVE_MODEL_ALT = original;
  else delete process.env.CREATIVE_MODEL_ALT;
});
