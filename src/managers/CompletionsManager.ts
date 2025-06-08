import {
  DEFAULT_MODEL,
  getModelInfo,
  isModelSupported,
} from "../config/modelRegistry";
import {
  DEFAULT_SYSTEM_PROMPT,
  SYSTEM_PROMPTS,
  SystemPromptKey,
} from "../config/systemPrompts";
import { ChatMessage, CompletionOptions, StreamChunk } from "../types";
import { getProviderRegistry } from "../utils/ProviderRegistry";

export class CompletionsManager {
  private providerRegistry = getProviderRegistry();

  private getSystemPrompt(promptKey?: string): string {
    if (promptKey && promptKey in SYSTEM_PROMPTS) {
      return SYSTEM_PROMPTS[promptKey as SystemPromptKey];
    }
    return DEFAULT_SYSTEM_PROMPT;
  }

  private buildMessageHistory(
    userMessage: string,
    systemPrompt: string,
    context?: ChatMessage[]
  ): ChatMessage[] {
    const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

    if (context && context.length > 0) {
      const filteredContext = context.filter((msg) => msg.role !== "system");
      messages.push(...filteredContext);
    }

    messages.push({ role: "user", content: userMessage });
    return messages;
  }

  private validateModel(model: string): string {
    if (!isModelSupported(model)) {
      const availableModels = this.providerRegistry.getAllAvailableModels();
      throw new Error(
        `Unsupported model: ${model}. Available models: ${availableModels.join(
          ", "
        )}`
      );
    }

    const modelInfo = getModelInfo(model);
    if (!modelInfo) {
      throw new Error(`Model info not found for: ${model}`);
    }

    return modelInfo.name;
  }

  public async createStreamingCompletion(
    userMessage: string,
    options: {
      model?: string;
      context?: ChatMessage[];
      promptKey?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<AsyncGenerator<StreamChunk>> {
    const {
      model = DEFAULT_MODEL,
      context = [],
      promptKey,
      maxTokens = 1000,
      temperature = 0.7,
    } = options;

    const validatedModel = this.validateModel(model);
    const systemPrompt = this.getSystemPrompt(promptKey);
    const messages = this.buildMessageHistory(
      userMessage,
      systemPrompt,
      context
    );

    const provider = this.providerRegistry.getProviderForModel(validatedModel);

    const completionOptions: CompletionOptions = {
      model: validatedModel,
      messages,
      maxTokens,
      temperature,
      stream: true,
    };

    return provider.createStreamingCompletion(completionOptions);
  }

  public async createCompletion(
    userMessage: string,
    options: {
      model?: string;
      context?: ChatMessage[];
      promptKey?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ) {
    const {
      model = DEFAULT_MODEL,
      context = [],
      promptKey,
      maxTokens = 1000,
      temperature = 0.7,
    } = options;

    const validatedModel = this.validateModel(model);
    const systemPrompt = this.getSystemPrompt(promptKey);
    const messages = this.buildMessageHistory(
      userMessage,
      systemPrompt,
      context
    );

    const provider = this.providerRegistry.getProviderForModel(validatedModel);

    const completionOptions: CompletionOptions = {
      model: validatedModel,
      messages,
      maxTokens,
      temperature,
      stream: false,
    };

    return provider.createCompletion(completionOptions);
  }

  public getSupportedModels(): string[] {
    return this.providerRegistry.getAllAvailableModels();
  }

  public getSystemPrompts(): Record<string, string> {
    return { ...SYSTEM_PROMPTS };
  }

  public isModelAvailable(model: string): boolean {
    return this.providerRegistry.isModelSupported(model);
  }

  public getAvailableProviders() {
    return this.providerRegistry.getAvailableProviders();
  }
}
