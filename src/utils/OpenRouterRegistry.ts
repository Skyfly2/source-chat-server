import { OpenRouterProvider } from "./providers/OpenRouterProvider";

export class OpenRouterRegistry {
  private provider: OpenRouterProvider;
  private initialized = false;

  constructor() {
    this.provider = new OpenRouterProvider({
      apiKey: process.env.OPEN_ROUTER_KEY,
    });
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.provider.initialize();
      this.initialized = true;
    }
  }

  getProvider(): OpenRouterProvider {
    return this.provider;
  }

  async getAllAvailableModels(): Promise<string[]> {
    return await this.provider.getSupportedModelsAsync();
  }

  async isModelSupported(model: string): Promise<boolean> {
    const supportedModels = await this.provider.getSupportedModelsAsync();
    return supportedModels.includes(model);
  }
}

let registryInstance: OpenRouterRegistry | null = null;

export const getOpenRouterRegistry = (): OpenRouterRegistry => {
  if (!registryInstance) {
    registryInstance = new OpenRouterRegistry();
  }
  return registryInstance;
};
