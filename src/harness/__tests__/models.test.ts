import { test } from "node:test";
import assert from "node:assert/strict";
import { llmTimeoutMs } from "../models.js";

// Only the env-parsing logic is testable here — the actual deadline
// enforcement is LangChain RunnableConfig's `timeout` (AbortSignal-based),
// not code this repo owns.

test("llmTimeoutMs: defaults to 45000ms when LLM_TIMEOUT_MS is unset", () => {
  const original = process.env.LLM_TIMEOUT_MS;
  delete process.env.LLM_TIMEOUT_MS;
  assert.equal(llmTimeoutMs(), 45_000);
  if (original !== undefined) process.env.LLM_TIMEOUT_MS = original;
});

test("llmTimeoutMs: honors a valid override", () => {
  const original = process.env.LLM_TIMEOUT_MS;
  process.env.LLM_TIMEOUT_MS = "10000";
  assert.equal(llmTimeoutMs(), 10_000);
  if (original === undefined) delete process.env.LLM_TIMEOUT_MS;
  else process.env.LLM_TIMEOUT_MS = original;
});

test("llmTimeoutMs: falls back to default on garbage/non-positive input", () => {
  const original = process.env.LLM_TIMEOUT_MS;
  for (const bad of ["not-a-number", "-500", "0", ""]) {
    process.env.LLM_TIMEOUT_MS = bad;
    assert.equal(llmTimeoutMs(), 45_000, `input ${JSON.stringify(bad)} should fall back`);
  }
  if (original === undefined) delete process.env.LLM_TIMEOUT_MS;
  else process.env.LLM_TIMEOUT_MS = original;
});
