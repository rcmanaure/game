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
  });

  const policy = adapter.getRetryPolicy();
  assert.strictEqual(policy.budget, 2);
  assert.strictEqual(policy.strategy, "content-refusal");
});

test("respects env-configured model IDs", () => {
  const original = process.env.LOGIC_MODEL;
  process.env.LOGIC_MODEL = "env/override";

  const adapter = LogicAdapter.fromEnv();
  const model = adapter.getModel();

  assert.strictEqual(model.model, "env/override");

  if (original) process.env.LOGIC_MODEL = original;
  else delete process.env.LOGIC_MODEL;
});

test("falls back to default model ID when env not set", () => {
  const original = process.env.LOGIC_MODEL;
  delete process.env.LOGIC_MODEL;

  const adapter = LogicAdapter.fromEnv();
  const model = adapter.getModel();

  assert.strictEqual(model.model, "google/gemini-2.0-flash-001");

  if (original) process.env.LOGIC_MODEL = original;
});
