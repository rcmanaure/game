import { ChatOpenRouter } from "@langchain/openrouter";

export interface LogicConfig {
  modelId: string;
  temperature: number;
  retryBudget: number;
  maxTokens: number;
}

export interface CreativeConfig {
  modelId: string;
  temperature: number;
  retryBudget: number;
  maxTokens: number;
}

export interface RetryPolicy {
  budget: number;
  strategy: "parse-error" | "content-refusal";
}

export interface PromptAdapter {
  getModel(): ChatOpenRouter;
  getRetryPolicy(): RetryPolicy;
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

export class LogicAdapter implements PromptAdapter {
  private config: LogicConfig;
  private apiKey: string;

  constructor(config: LogicConfig) {
    this.config = config;
    this.apiKey = requireEnv("OPENROUTER_API_KEY");
  }

  static fromEnv(): LogicAdapter {
    return new LogicAdapter({
      modelId:
        process.env.LOGIC_MODEL ?? "google/gemini-2.0-flash-001",
      temperature: 0,
      retryBudget: 1,
      maxTokens: 1024,
    });
  }

  getModel(): ChatOpenRouter {
    return new ChatOpenRouter({
      apiKey: this.apiKey,
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

export class CreativeAdapter implements PromptAdapter {
  private config: CreativeConfig;
  private apiKey: string;
  private altAdapter: LogicAdapter;

  constructor(config: CreativeConfig, altConfig?: CreativeConfig) {
    this.config = config;
    this.apiKey = requireEnv("OPENROUTER_API_KEY");
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
    });
  }

  static fromEnv(): CreativeAdapter {
    return new CreativeAdapter({
      modelId:
        process.env.CREATIVE_MODEL ?? "anthropic/claude-3.5-sonnet",
      temperature: 0.8,
      retryBudget: 1,
      maxTokens: 2048,
    });
  }

  getModel(): ChatOpenRouter {
    return new ChatOpenRouter({
      apiKey: this.apiKey,
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
