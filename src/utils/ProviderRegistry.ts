import { getModelInfo } from "../config/modelRegistry";
import { AIProvider, AIProviderType, ProviderConfig } from "../types";
import { AnthropicProvider } from "./providers/AnthropicProvider";
import { DeepSeekProvider } from "./providers/DeepSeekProvider";
import { GoogleProvider } from "./providers/GoogleProvider";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { XAIProvider } from "./providers/XAIProvider";

export class ProviderRegistry {
  private providers: Map<AIProviderType, AIProvider> = new Map();
  private static instance: ProviderRegistry | null = null;
  private initialized = false;

  private constructor() {
    // Don't initialize providers in constructor - do it lazily
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public static resetInstance(): void {
    ProviderRegistry.instance = null;
  }

  private initializeProviders(): void {
    console.log("Initializing providers...");

    const configs: Record<AIProviderType, ProviderConfig> = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
      google: {
        apiKey: process.env.GOOGLE_API_KEY,
      },
      xai: {
        apiKey: process.env.XAI_API_KEY,
      },
      deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY,
      },
    };

    console.log("Config API keys present:", {
      openai: !!configs.openai.apiKey,
      anthropic: !!configs.anthropic.apiKey,
      google: !!configs.google.apiKey,
      xai: !!configs.xai.apiKey,
      deepseek: !!configs.deepseek.apiKey,
    });

    // Only initialize providers with valid API keys
    if (configs.openai.apiKey) {
      try {
        console.log("Initializing OpenAI provider...");
        this.providers.set("openai", new OpenAIProvider(configs.openai));
        console.log("OpenAI provider initialized successfully");
      } catch (error) {
        console.warn("Failed to initialize OpenAI provider:", error);
      }
    }

    if (configs.anthropic.apiKey) {
      try {
        console.log("Initializing Anthropic provider...");
        this.providers.set(
          "anthropic",
          new AnthropicProvider(configs.anthropic)
        );
        console.log("Anthropic provider initialized successfully");
      } catch (error) {
        console.warn("Failed to initialize Anthropic provider:", error);
      }
    }

    if (configs.google.apiKey) {
      try {
        console.log("Initializing Google provider...");
        this.providers.set("google", new GoogleProvider(configs.google));
        console.log("Google provider initialized successfully");
      } catch (error) {
        console.warn("Failed to initialize Google provider:", error);
      }
    }

    if (configs.xai.apiKey) {
      try {
        console.log("Initializing xAI provider...");
        this.providers.set("xai", new XAIProvider(configs.xai));
        console.log("xAI provider initialized successfully");
      } catch (error) {
        console.warn("Failed to initialize xAI provider:", error);
      }
    }

    if (configs.deepseek.apiKey) {
      try {
        console.log("Initializing DeepSeek provider...");
        this.providers.set("deepseek", new DeepSeekProvider(configs.deepseek));
        console.log("DeepSeek provider initialized successfully");
      } catch (error) {
        console.warn("Failed to initialize DeepSeek provider:", error);
      }
    }

    console.log(
      "Provider initialization complete. Total providers:",
      this.providers.size
    );
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initializeProviders();
      this.initialized = true;
    }
  }

  public getProviderForModel(modelName: string): AIProvider {
    this.ensureInitialized();

    const modelInfo = getModelInfo(modelName);
    if (!modelInfo) {
      throw new Error(`Unsupported model: ${modelName}`);
    }

    const provider = this.providers.get(modelInfo.provider);
    if (!provider) {
      throw new Error(
        `Provider ${modelInfo.provider} not available. Please check your API key configuration.`
      );
    }

    if (!provider.isModelSupported(modelName)) {
      throw new Error(
        `Model ${modelName} is not supported by ${provider.name} provider`
      );
    }

    return provider;
  }

  public getAllAvailableModels(): string[] {
    this.ensureInitialized();

    const availableModels: string[] = [];

    console.log("Providers in registry:", Array.from(this.providers.keys()));

    for (const provider of this.providers.values()) {
      console.log(`Getting models from ${provider.name} provider`);
      const models = provider.getSupportedModels();
      console.log(`${provider.name} models:`, models);
      availableModels.push(...models);
    }

    console.log("All available models:", availableModels);
    return availableModels;
  }

  public getAvailableProviders(): AIProviderType[] {
    this.ensureInitialized();
    return Array.from(this.providers.keys());
  }

  public isModelSupported(modelName: string): boolean {
    this.ensureInitialized();
    try {
      this.getProviderForModel(modelName);
      return true;
    } catch {
      return false;
    }
  }

  public addProvider(type: AIProviderType, provider: AIProvider): void {
    this.providers.set(type, provider);
  }

  public removeProvider(type: AIProviderType): void {
    this.providers.delete(type);
  }
}

export const getProviderRegistry = (): ProviderRegistry => {
  return ProviderRegistry.getInstance();
};

export const resetProviderRegistry = (): void => {
  ProviderRegistry.resetInstance();
};
