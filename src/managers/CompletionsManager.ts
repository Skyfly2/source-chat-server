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
import {
  AIMessage,
  ChatMessage,
  CompletionOptions,
  StreamChunk,
} from "../types";
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

    const modelInfo = getModelInfo(modelName);
    if (!modelInfo) return false;

    // Check if model has reasoning feature or is an o1/o3/o4 series model
    const hasReasoningFeature = modelInfo.features?.reasoning === true;
    const isOpenAIReasoningModel = /^(o1|o3|o4)(-|$)/.test(modelName);
    const isDeepSeekReasoningModel =
      modelName.includes("deepseek-r1") ||
      modelName.includes("deepseek-reasoner");

    return (
      hasReasoningFeature || isOpenAIReasoningModel || isDeepSeekReasoningModel
    );
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
    const aiContext = context
      ? this.convertChatMessagesToAIMessages(context)
      : undefined;
    const messages = this.buildMessageHistory(
      userMessage,
      validatedModel,
      systemPrompt,
      aiContext
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

  private convertChatMessagesToAIMessages(
    chatMessages: ChatMessage[]
  ): AIMessage[] {
    return chatMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }
}
