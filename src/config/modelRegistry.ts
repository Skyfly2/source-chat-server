import { AIProviderType, ModelInfo } from "../types";

export const MODEL_REGISTRY: Record<string, ModelInfo> = {
  // OpenAI Models
  "gpt-4o": {
    name: "gpt-4o",
    provider: "openai",
    displayName: "GPT-4o",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 128000,
  },
  "gpt-4o-mini": {
    name: "gpt-4o-mini",
    provider: "openai",
    displayName: "GPT-4o Mini",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 128000,
  },
  "gpt-4-turbo": {
    name: "gpt-4-turbo",
    provider: "openai",
    displayName: "GPT-4 Turbo",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 128000,
  },
  "gpt-4": {
    name: "gpt-4",
    provider: "openai",
    displayName: "GPT-4",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 8192,
  },
  "gpt-3.5-turbo": {
    name: "gpt-3.5-turbo",
    provider: "openai",
    displayName: "GPT-3.5 Turbo",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 16385,
  },

  // Anthropic Claude Models
  // Claude 4 Models
  "claude-opus-4-20250514": {
    name: "claude-opus-4-20250514",
    provider: "anthropic",
    displayName: "Claude Opus 4",
    maxTokens: 32000,
    supportsStreaming: true,
    contextWindow: 200000,
  },
  "claude-opus-4-0": {
    name: "claude-opus-4-20250514",
    provider: "anthropic",
    displayName: "Claude Opus 4",
    maxTokens: 32000,
    supportsStreaming: true,
    contextWindow: 200000,
  },
  "claude-sonnet-4-20250514": {
    name: "claude-sonnet-4-20250514",
    provider: "anthropic",
    displayName: "Claude Sonnet 4",
    maxTokens: 64000,
    supportsStreaming: true,
    contextWindow: 200000,
  },
  "claude-sonnet-4-0": {
    name: "claude-sonnet-4-20250514",
    provider: "anthropic",
    displayName: "Claude Sonnet 4",
    maxTokens: 64000,
    supportsStreaming: true,
    contextWindow: 200000,
  },
  // Claude 3.7 Models
  "claude-3-7-sonnet-20250219": {
    name: "claude-3-7-sonnet-20250219",
    provider: "anthropic",
    displayName: "Claude 3.7 Sonnet",
    maxTokens: 64000,
    supportsStreaming: true,
    contextWindow: 200000,
  },
  // Claude 3.5 Models
  "claude-3-5-sonnet-20241022": {
    name: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    displayName: "Claude 3.5 Sonnet",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 200000,
  },
  "claude-3-5-haiku-20241022": {
    name: "claude-3-5-haiku-20241022",
    provider: "anthropic",
    displayName: "Claude 3.5 Haiku",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 200000,
  },
  // Claude 3 Models
  "claude-3-opus-20240229": {
    name: "claude-3-opus-20240229",
    provider: "anthropic",
    displayName: "Claude 3 Opus",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 200000,
  },
  "claude-3-sonnet-20240229": {
    name: "claude-3-sonnet-20240229",
    provider: "anthropic",
    displayName: "Claude 3 Sonnet",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 200000,
  },
  "claude-3-haiku-20240307": {
    name: "claude-3-haiku-20240307",
    provider: "anthropic",
    displayName: "Claude 3 Haiku",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 200000,
  },

  // Google Gemini Models
  "gemini-1.5-pro": {
    name: "gemini-1.5-pro",
    provider: "google",
    displayName: "Gemini 1.5 Pro",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 2000000,
  },
  "gemini-1.5-flash": {
    name: "gemini-1.5-flash",
    provider: "google",
    displayName: "Gemini 1.5 Flash",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1000000,
  },
  "gemini-pro": {
    name: "gemini-pro",
    provider: "google",
    displayName: "Gemini Pro",
    maxTokens: 2048,
    supportsStreaming: true,
    contextWindow: 32768,
  },

  // xAI Grok Models
  "grok-3": {
    name: "grok-3",
    provider: "xai",
    displayName: "Grok 3",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 131072,
  },
  "grok-3-vision": {
    name: "grok-3-vision",
    provider: "xai",
    displayName: "Grok 3 Vision",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 131072,
  },
  "grok-beta": {
    name: "grok-beta",
    provider: "xai",
    displayName: "Grok Beta",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 131072,
  },
  "grok-vision-beta": {
    name: "grok-vision-beta",
    provider: "xai",
    displayName: "Grok Vision Beta",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 131072,
  },

  // DeepSeek Models
  "deepseek-chat": {
    name: "deepseek-chat",
    provider: "deepseek",
    displayName: "DeepSeek Chat",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 32000,
  },
  "deepseek-coder": {
    name: "deepseek-coder",
    provider: "deepseek",
    displayName: "DeepSeek Coder",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 16000,
  },
} as const;

export const DEFAULT_MODEL = "gpt-4o-mini";

export const getModelInfo = (modelName: string): ModelInfo | undefined => {
  return MODEL_REGISTRY[modelName];
};

export const getModelsByProvider = (provider: AIProviderType): ModelInfo[] => {
  return Object.values(MODEL_REGISTRY).filter(
    (model) => model.provider === provider
  );
};

export const getAllModels = (): ModelInfo[] => {
  return Object.values(MODEL_REGISTRY);
};

export const getSupportedModelNames = (): string[] => {
  return Object.keys(MODEL_REGISTRY);
};

export const isModelSupported = (modelName: string): boolean => {
  return modelName in MODEL_REGISTRY;
};
