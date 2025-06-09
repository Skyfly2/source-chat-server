import { AIProviderType, ModelInfo } from "../types";

export const MODEL_REGISTRY: Record<string, ModelInfo> = {
  // OpenAI Models

  // o-series models (Reasoning Models)
  o3: {
    name: "o3",
    provider: "openai",
    displayName: "o3",
    maxTokens: 100000,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      reasoning: true,
      vision: true,
      multimodal: true,
    },
  },
  "o4-mini": {
    name: "o4-mini",
    provider: "openai",
    displayName: "o4-mini",
    maxTokens: 100000,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      reasoning: true,
      vision: true,
      multimodal: true,
    },
  },
  "o4-mini-high": {
    name: "o4-mini-high",
    provider: "openai",
    displayName: "o4-mini-high",
    maxTokens: 100000,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      reasoning: true,
      vision: true,
      multimodal: true,
    },
  },
  "o3-mini": {
    name: "o3-mini",
    provider: "openai",
    displayName: "o3-mini",
    maxTokens: 100000,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      reasoning: true,
      vision: true,
      multimodal: true,
    },
  },
  o1: {
    name: "o1",
    provider: "openai",
    displayName: "o1",
    maxTokens: 100000,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      reasoning: true,
    },
  },
  "o1-pro": {
    name: "o1-pro",
    provider: "openai",
    displayName: "o1 Pro",
    maxTokens: 100000,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      reasoning: true,
    },
  },
  "o1-preview": {
    name: "o1-preview",
    provider: "openai",
    displayName: "o1 Preview",
    maxTokens: 32768,
    supportsStreaming: true,
    contextWindow: 128000,
    features: {
      reasoning: true,
    },
  },
  "o1-mini": {
    name: "o1-mini",
    provider: "openai",
    displayName: "o1 Mini",
    maxTokens: 65536,
    supportsStreaming: true,
    contextWindow: 128000,
    features: {
      reasoning: true,
    },
  },

  // GPT-4.5 Series
  "gpt-4.5": {
    name: "gpt-4.5",
    provider: "openai",
    displayName: "GPT-4.5",
    maxTokens: 16384,
    supportsStreaming: true,
    contextWindow: 128000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },
  "gpt-4.5-preview": {
    name: "gpt-4.5-preview",
    provider: "openai",
    displayName: "GPT-4.5 Preview",
    maxTokens: 16384,
    supportsStreaming: true,
    contextWindow: 128000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },

  // GPT-4.1 Series
  "gpt-4.1": {
    name: "gpt-4.1",
    provider: "openai",
    displayName: "GPT-4.1",
    maxTokens: 32768,
    supportsStreaming: true,
    contextWindow: 1047576, // 1M+ tokens
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },
  "gpt-4.1-mini": {
    name: "gpt-4.1-mini",
    provider: "openai",
    displayName: "GPT-4.1 Mini",
    maxTokens: 32768,
    supportsStreaming: true,
    contextWindow: 1047576,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },
  "gpt-4.1-nano": {
    name: "gpt-4.1-nano",
    provider: "openai",
    displayName: "GPT-4.1 Nano",
    maxTokens: 32768,
    supportsStreaming: true,
    contextWindow: 1047576,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },

  // GPT-4o Series (Latest versions)
  "gpt-4o": {
    name: "gpt-4o",
    provider: "openai",
    displayName: "GPT-4o",
    maxTokens: 16384,
    supportsStreaming: true,
    contextWindow: 128000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },
  "gpt-4o-2024-11-20": {
    name: "gpt-4o-2024-11-20",
    provider: "openai",
    displayName: "GPT-4o (Nov 2024)",
    maxTokens: 16384,
    supportsStreaming: true,
    contextWindow: 128000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },
  "gpt-4o-2024-08-06": {
    name: "gpt-4o-2024-08-06",
    provider: "openai",
    displayName: "GPT-4o (Aug 2024)",
    maxTokens: 16384,
    supportsStreaming: true,
    contextWindow: 128000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },
  "gpt-4o-2024-05-13": {
    name: "gpt-4o-2024-05-13",
    provider: "openai",
    displayName: "GPT-4o (May 2024)",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 128000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },
  "gpt-4o-mini": {
    name: "gpt-4o-mini",
    provider: "openai",
    displayName: "GPT-4o Mini",
    maxTokens: 16384,
    supportsStreaming: true,
    contextWindow: 128000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },
  "gpt-4o-mini-2024-07-18": {
    name: "gpt-4o-mini-2024-07-18",
    provider: "openai",
    displayName: "GPT-4o Mini (Jul 2024)",
    maxTokens: 16384,
    supportsStreaming: true,
    contextWindow: 128000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },

  // GPT-4 Series (Legacy)
  "gpt-4-turbo": {
    name: "gpt-4-turbo",
    provider: "openai",
    displayName: "GPT-4 Turbo",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 128000,
  },
  "gpt-4-turbo-2024-04-09": {
    name: "gpt-4-turbo-2024-04-09",
    provider: "openai",
    displayName: "GPT-4 Turbo with Vision",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 128000,
  },
  "gpt-4-turbo-preview": {
    name: "gpt-4-turbo-preview",
    provider: "openai",
    displayName: "GPT-4 Turbo Preview",
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
  "gpt-4-0613": {
    name: "gpt-4-0613",
    provider: "openai",
    displayName: "GPT-4 (Jun 2023)",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 8192,
  },
  "gpt-4-0314": {
    name: "gpt-4-0314",
    provider: "openai",
    displayName: "GPT-4 (Mar 2023)",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 8192,
  },
  "gpt-4-32k": {
    name: "gpt-4-32k",
    provider: "openai",
    displayName: "GPT-4 32K",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 32768,
  },
  "gpt-4-32k-0613": {
    name: "gpt-4-32k-0613",
    provider: "openai",
    displayName: "GPT-4 32K (Jun 2023)",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 32768,
  },
  "gpt-4-32k-0314": {
    name: "gpt-4-32k-0314",
    provider: "openai",
    displayName: "GPT-4 32K (Mar 2023)",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 32768,
  },

  // GPT-3.5 Series
  "gpt-3.5-turbo": {
    name: "gpt-3.5-turbo",
    provider: "openai",
    displayName: "GPT-3.5 Turbo",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 16385,
  },
  "gpt-3.5-turbo-0125": {
    name: "gpt-3.5-turbo-0125",
    provider: "openai",
    displayName: "GPT-3.5 Turbo (Jan 2024)",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 16385,
  },
  "gpt-3.5-turbo-1106": {
    name: "gpt-3.5-turbo-1106",
    provider: "openai",
    displayName: "GPT-3.5 Turbo (Nov 2023)",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 16385,
  },
  "gpt-3.5-turbo-16k": {
    name: "gpt-3.5-turbo-16k",
    provider: "openai",
    displayName: "GPT-3.5 Turbo 16K",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 16385,
  },
  "gpt-3.5-turbo-instruct": {
    name: "gpt-3.5-turbo-instruct",
    provider: "openai",
    displayName: "GPT-3.5 Turbo Instruct",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 4097,
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
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
      codeExecution: true,
    },
  },
  "claude-opus-4-0": {
    name: "claude-opus-4-20250514",
    provider: "anthropic",
    displayName: "Claude Opus 4",
    maxTokens: 32000,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
      codeExecution: true,
    },
  },
  "claude-sonnet-4-20250514": {
    name: "claude-sonnet-4-20250514",
    provider: "anthropic",
    displayName: "Claude Sonnet 4",
    maxTokens: 64000,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
      codeExecution: true,
    },
  },
  "claude-sonnet-4-0": {
    name: "claude-sonnet-4-20250514",
    provider: "anthropic",
    displayName: "Claude Sonnet 4",
    maxTokens: 64000,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
      codeExecution: true,
    },
  },
  // Claude 3.7 Models
  "claude-3-7-sonnet-20250219": {
    name: "claude-3-7-sonnet-20250219",
    provider: "anthropic",
    displayName: "Claude 3.7 Sonnet",
    maxTokens: 64000,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
      codeExecution: true,
    },
  },
  // Claude 3.5 Models
  "claude-3-5-sonnet-20241022": {
    name: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    displayName: "Claude 3.5 Sonnet",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
      codeExecution: true,
    },
  },
  "claude-3-5-haiku-20241022": {
    name: "claude-3-5-haiku-20241022",
    provider: "anthropic",
    displayName: "Claude 3.5 Haiku",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },
  // Claude 3 Models
  "claude-3-opus-20240229": {
    name: "claude-3-opus-20240229",
    provider: "anthropic",
    displayName: "Claude 3 Opus",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },
  "claude-3-sonnet-20240229": {
    name: "claude-3-sonnet-20240229",
    provider: "anthropic",
    displayName: "Claude 3 Sonnet",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },
  "claude-3-haiku-20240307": {
    name: "claude-3-haiku-20240307",
    provider: "anthropic",
    displayName: "Claude 3 Haiku",
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 200000,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },

  // Google Gemini Models

  // Gemini 2.5 Series
  "gemini-2.5-pro-preview-06-05": {
    name: "gemini-2.5-pro-preview-06-05",
    provider: "google",
    displayName: "Gemini 2.5 Pro Preview",
    maxTokens: 65536,
    supportsStreaming: true,
    contextWindow: 1048576, // 1M tokens
  },
  "gemini-2.5-pro": {
    name: "gemini-2.5-pro-preview-06-05",
    provider: "google",
    displayName: "Gemini 2.5 Pro",
    maxTokens: 65536,
    supportsStreaming: true,
    contextWindow: 1048576,
  },
  "gemini-2.5-flash-preview-05-20": {
    name: "gemini-2.5-flash-preview-05-20",
    provider: "google",
    displayName: "Gemini 2.5 Flash Preview",
    maxTokens: 65536,
    supportsStreaming: true,
    contextWindow: 1048576,
  },
  "gemini-2.5-flash": {
    name: "gemini-2.5-flash-preview-05-20",
    provider: "google",
    displayName: "Gemini 2.5 Flash",
    maxTokens: 65536,
    supportsStreaming: true,
    contextWindow: 1048576,
  },

  // Gemini 2.0 Series
  "gemini-2.0-flash": {
    name: "gemini-2.0-flash",
    provider: "google",
    displayName: "Gemini 2.0 Flash",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1048576,
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
      codeExecution: true,
    },
  },
  "gemini-2.0-flash-001": {
    name: "gemini-2.0-flash-001",
    provider: "google",
    displayName: "Gemini 2.0 Flash Stable",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1048576,
  },
  "gemini-2.0-flash-exp": {
    name: "gemini-2.0-flash-exp",
    provider: "google",
    displayName: "Gemini 2.0 Flash Experimental",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1048576,
  },
  "gemini-2.0-flash-lite": {
    name: "gemini-2.0-flash-lite",
    provider: "google",
    displayName: "Gemini 2.0 Flash-Lite",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1048576,
  },
  "gemini-2.0-flash-lite-001": {
    name: "gemini-2.0-flash-lite-001",
    provider: "google",
    displayName: "Gemini 2.0 Flash-Lite Stable",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1048576,
  },

  // Gemini 1.5 Series
  "gemini-1.5-pro": {
    name: "gemini-1.5-pro",
    provider: "google",
    displayName: "Gemini 1.5 Pro",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 2097152, // 2M tokens
    features: {
      vision: true,
      multimodal: true,
      attachments: true,
    },
  },
  "gemini-1.5-pro-latest": {
    name: "gemini-1.5-pro-latest",
    provider: "google",
    displayName: "Gemini 1.5 Pro Latest",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 2097152,
  },
  "gemini-1.5-pro-001": {
    name: "gemini-1.5-pro-001",
    provider: "google",
    displayName: "Gemini 1.5 Pro Stable",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 2097152,
  },
  "gemini-1.5-pro-002": {
    name: "gemini-1.5-pro-002",
    provider: "google",
    displayName: "Gemini 1.5 Pro v2",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 2097152,
  },
  "gemini-1.5-flash": {
    name: "gemini-1.5-flash",
    provider: "google",
    displayName: "Gemini 1.5 Flash",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1048576,
  },
  "gemini-1.5-flash-latest": {
    name: "gemini-1.5-flash-latest",
    provider: "google",
    displayName: "Gemini 1.5 Flash Latest",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1048576,
  },
  "gemini-1.5-flash-001": {
    name: "gemini-1.5-flash-001",
    provider: "google",
    displayName: "Gemini 1.5 Flash Stable",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1048576,
  },
  "gemini-1.5-flash-002": {
    name: "gemini-1.5-flash-002",
    provider: "google",
    displayName: "Gemini 1.5 Flash v2",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1048576,
  },
  "gemini-1.5-flash-8b": {
    name: "gemini-1.5-flash-8b",
    provider: "google",
    displayName: "Gemini 1.5 Flash-8B",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1048576,
  },
  "gemini-1.5-flash-8b-latest": {
    name: "gemini-1.5-flash-8b-latest",
    provider: "google",
    displayName: "Gemini 1.5 Flash-8B Latest",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1048576,
  },
  "gemini-1.5-flash-8b-001": {
    name: "gemini-1.5-flash-8b-001",
    provider: "google",
    displayName: "Gemini 1.5 Flash-8B Stable",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 1048576,
  },

  // Legacy Gemini Models
  "gemini-pro": {
    name: "gemini-pro",
    provider: "google",
    displayName: "Gemini Pro (Legacy)",
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
    features: {
      internet: true,
      reasoning: true,
    },
  },
  "grok-3-mini": {
    name: "grok-3-mini",
    provider: "xai",
    displayName: "Grok 3 Mini",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 131072,
    features: {
      internet: true,
      reasoning: true,
    },
  },
  "grok-3-vision": {
    name: "grok-3-vision",
    provider: "xai",
    displayName: "Grok 3 Vision",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 131072,
    features: {
      internet: true,
      reasoning: true,
      vision: true,
      multimodal: true,
    },
  },

  // DeepSeek Models

  // DeepSeek API Models (only two actual models available)
  "deepseek-chat": {
    name: "deepseek-chat",
    provider: "deepseek",
    displayName: "DeepSeek Chat (V3-0324)",
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 64000,
    features: {
      reasoning: true,
      coding: true,
      mathematics: true,
      functionCalling: true,
    },
  },
  "deepseek-reasoner": {
    name: "deepseek-reasoner",
    provider: "deepseek",
    displayName: "DeepSeek R1 Reasoner (R1-0528)",
    maxTokens: 64000,
    supportsStreaming: true,
    contextWindow: 64000,
    features: {
      reasoning: true,
      stepByStep: true,
      mathematics: true,
      coding: true,
    },
  },
} as const;

export const DEFAULT_MODEL = "gpt-4o";

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
