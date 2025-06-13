import { AIProvider, AIProviderType, ProviderConfig } from "../types";
import { OpenRouterProvider } from "./providers/OpenRouterProvider";

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
    console.log("Initializing OpenRouter provider...");

    const config: ProviderConfig = {
      apiKey: process.env.OPEN_ROUTER_KEY,
    };

    if (config.apiKey) {
      try {
        this.providers.set("openrouter", new OpenRouterProvider(config));
        console.log("OpenRouter provider initialized successfully");
      } catch (error) {
        console.warn("Failed to initialize OpenRouter provider:", error);
      }
    } else {
      console.warn("OpenRouter API key not found");
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

  public getOpenRouterProvider(): OpenRouterProvider {
    this.ensureInitialized();
    const provider = this.providers.get("openrouter");
    if (!provider) {
      throw new Error(
        "OpenRouter provider not available. Please check your API key configuration."
      );
    }
    return provider as OpenRouterProvider;
  }

  public async getAllAvailableModels(): Promise<string[]> {
    const provider = this.getOpenRouterProvider();
    return await provider.getSupportedModelsAsync();
  }

  public getAvailableProviders(): AIProviderType[] {
    this.ensureInitialized();
    return Array.from(this.providers.keys());
  }

  public async isModelSupported(modelName: string): Promise<boolean> {
    const provider = this.getOpenRouterProvider();
    const supportedModels = await provider.getSupportedModelsAsync();
    return supportedModels.includes(modelName);
  }
}

export const getProviderRegistry = (): ProviderRegistry => {
  return ProviderRegistry.getInstance();
};

export const resetProviderRegistry = (): void => {
  ProviderRegistry.resetInstance();
};
