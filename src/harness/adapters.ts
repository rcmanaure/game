import { ChatOpenRouter } from "@langchain/openrouter";

export interface ModelConfig {
  modelId: string;
  temperature: number;
  retryBudget: number;
  maxTokens: number;
  apiKey: string;
}

export interface RetryPolicy {
  budget: number;
  strategy: "parse-error" | "content-refusal";
}

export interface PromptAdapter {
  getModel(): ChatOpenRouter;
  getRetryPolicy(): RetryPolicy;
}

// The narrate node needs a second model for its refusal-retry chain
// (Decision #2's alt-provider fallback) — a capability the resolve node's
// LogicAdapter has no use for, so it stays a separate interface rather than
// widening PromptAdapter with a method only one implementor means.
export interface NarrationAdapter extends PromptAdapter {
  getAltModel(): ChatOpenRouter;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} not set. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

// Reading the environment is `fromEnv`'s job alone — construction stays pure
// so an adapter can be built (and asserted on) without an ambient API key.
export class LogicAdapter implements PromptAdapter {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  static fromEnv(): LogicAdapter {
    return new LogicAdapter({
      modelId:
        process.env.LOGIC_MODEL ?? "google/gemini-2.0-flash-001",
      temperature: 0,
      retryBudget: 1,
      maxTokens: 1024,
      apiKey: requireEnv("OPENROUTER_API_KEY"),
    });
  }

  getModel(): ChatOpenRouter {
    return new ChatOpenRouter({
      apiKey: this.config.apiKey,
      model: this.config.modelId,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });
  }

  getRetryPolicy(): RetryPolicy {
    return {
      budget: this.config.retryBudget,
      strategy: "parse-error",
    };
  }
}

export class CreativeAdapter implements NarrationAdapter {
  private config: ModelConfig;
  private altAdapter: LogicAdapter;

  constructor(config: ModelConfig, altConfig?: ModelConfig) {
    this.config = config;
    // Alt adapter for fallback (content refusal retry)
    this.altAdapter = new LogicAdapter({
      modelId:
        altConfig?.modelId ??
        (process.env.CREATIVE_MODEL_ALT ??
          "nvidia/nemotron-3-super-120b-a12b:free"),
      temperature:
        altConfig?.temperature ?? this.config.temperature,
      retryBudget: 1,
      maxTokens: altConfig?.maxTokens ?? this.config.maxTokens,
      apiKey: altConfig?.apiKey ?? this.config.apiKey,
    });
  }

  static fromEnv(): CreativeAdapter {
    return new CreativeAdapter({
      modelId:
        process.env.CREATIVE_MODEL ?? "anthropic/claude-3.5-sonnet",
      temperature: 0.8,
      retryBudget: 1,
      maxTokens: 2048,
      apiKey: requireEnv("OPENROUTER_API_KEY"),
    });
  }

  getModel(): ChatOpenRouter {
    return new ChatOpenRouter({
      apiKey: this.config.apiKey,
      model: this.config.modelId,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });
  }

  getAltModel(): ChatOpenRouter {
    return this.altAdapter.getModel();
  }

  getRetryPolicy(): RetryPolicy {
    return {
      budget: this.config.retryBudget,
      strategy: "content-refusal",
    };
  }
}
