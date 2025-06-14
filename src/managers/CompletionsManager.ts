import {
  DEFAULT_SYSTEM_PROMPT,
  SYSTEM_PROMPTS,
  SystemPromptKey,
} from "../config/systemPrompts";
import {
  AIMessage,
  ChatMessage,
  CompletionOptions,
  StreamChunk,
} from "../types";
import { getOpenRouterRegistry } from "../utils/OpenRouterRegistry";

const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini";

export class CompletionsManager {
  private openRouterRegistry = getOpenRouterRegistry();

  private getSystemPrompt(promptKey?: string): string {
    if (promptKey && promptKey in SYSTEM_PROMPTS) {
      return SYSTEM_PROMPTS[promptKey as SystemPromptKey];
    }
    return DEFAULT_SYSTEM_PROMPT;
  }

  private buildMessageHistory(
    userMessage: string,
    modelName: string,
    systemPrompt?: string,
    context?: AIMessage[]
  ): AIMessage[] {
    const messages: AIMessage[] = [];

    const isReasoningModel = this.isReasoningModel(modelName);

    if (systemPrompt && !isReasoningModel) {
      messages.push({ role: "system", content: systemPrompt });
    }

    if (context && context.length > 0) {
      messages.push(...context);
    }

    const finalUserMessage = userMessage.trim();
    if (finalUserMessage) {
      messages.push({ role: "user", content: finalUserMessage });
    }

    return messages;
  }

  private isReasoningModel(modelName?: string): boolean {
    if (!modelName) return false;

    // Check if model is a reasoning model based on name patterns
    const isOpenAIReasoningModel =
      modelName.includes("/o1") ||
      modelName.includes("/o3") ||
      modelName.includes("/o4");
    const isDeepSeekReasoningModel =
      modelName.includes("deepseek-r1") ||
      modelName.includes("deepseek-reasoner");

    return isOpenAIReasoningModel || isDeepSeekReasoningModel;
  }

  private async validateModel(model: string): Promise<string> {
    const isSupported = await this.openRouterRegistry.isModelSupported(model);
    if (!isSupported) {
      const availableModels =
        await this.openRouterRegistry.getAllAvailableModels();
      throw new Error(
        `Unsupported model: ${model}. Available models: ${availableModels
          .slice(0, 10)
          .join(", ")}...`
      );
    }

    return model;
  }

  public async createStreamingCompletion(
    userMessage: string,
    options: {
      model?: string;
      context?: ChatMessage[];
      promptKey?: string;
      maxTokens?: number;
      temperature?: number;
      webSearch?: boolean;
    } = {}
  ): Promise<AsyncGenerator<StreamChunk>> {
    const {
      model = DEFAULT_OPENROUTER_MODEL,
      context = [],
      promptKey,
      maxTokens = 1000,
      temperature = 0.7,
    } = options;

    // Ensure registry is initialized
    await this.openRouterRegistry.initialize();

    const validatedModel = await this.validateModel(model);
    const systemPrompt = this.getSystemPrompt(promptKey);
    const aiContext = context
      ? this.convertChatMessagesToAIMessages(context)
      : undefined;
    const messages = this.buildMessageHistory(
      userMessage,
      validatedModel,
      systemPrompt,
      aiContext
    );

    const provider = this.openRouterRegistry.getProvider();

    const completionOptions: CompletionOptions = {
      model: validatedModel,
      messages,
      maxTokens,
      temperature,
      stream: true,
      webSearch: options.webSearch,
    };

    return provider.createStreamingCompletion(completionOptions);
  }

  public async getSupportedModels(): Promise<string[]> {
    return await this.openRouterRegistry.getAllAvailableModels();
  }

  public getSystemPrompts(): Record<string, string> {
    return { ...SYSTEM_PROMPTS };
  }

  public async isModelAvailable(model: string): Promise<boolean> {
    return await this.openRouterRegistry.isModelSupported(model);
  }

  public getAvailableProviders() {
    return ["openrouter"];
  }

  private convertChatMessagesToAIMessages(
    chatMessages: ChatMessage[]
  ): AIMessage[] {
    return chatMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }
}
