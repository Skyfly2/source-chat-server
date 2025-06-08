import {
  DEFAULT_MODEL,
  DEFAULT_SYSTEM_PROMPT,
  SUPPORTED_MODELS,
  SupportedModel,
  SYSTEM_PROMPTS,
  SystemPromptKey,
} from "../config/systemPrompts";
import { ChatMessage } from "../types";
import { getOpenAIClient } from "../utils/openaiClient";

export class CompletionsManager {
  private validateModel(model: string): SupportedModel {
    if (!SUPPORTED_MODELS.includes(model as SupportedModel)) {
      throw new Error(
        `Unsupported model: ${model}. Supported models: ${SUPPORTED_MODELS.join(
          ", "
        )}`
      );
    }
    return model as SupportedModel;
  }

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

  public async createStreamingCompletion(
    userMessage: string,
    options: {
      model?: string;
      context?: ChatMessage[];
      promptKey?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<AsyncIterable<any>> {
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

    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: validatedModel,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: maxTokens,
      temperature: temperature,
      stream: true,
    });

    return completion;
  }

  public getSupportedModels(): SupportedModel[] {
    return [...SUPPORTED_MODELS];
  }

  public getSystemPrompts(): Record<string, string> {
    return { ...SYSTEM_PROMPTS };
  }
}
