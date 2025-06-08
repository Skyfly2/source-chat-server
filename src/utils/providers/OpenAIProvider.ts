import OpenAI from "openai";
import { getModelsByProvider } from "../../config/modelRegistry";
import {
  AIProvider,
  CompletionOptions,
  CompletionResponse,
  ProviderConfig,
  StreamChunk,
} from "../../types";

export class OpenAIProvider extends AIProvider {
  name = "openai";
  private client: OpenAI;

  constructor(config: ProviderConfig) {
    super();
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.baseURL,
    });
  }

  getSupportedModels(): string[] {
    const models = getModelsByProvider("openai");
    console.log("OpenAI models from registry:", models);
    return models.map((model) => model.name);
  }

  isModelSupported(model: string): boolean {
    return this.getSupportedModels().includes(model);
  }

  async createCompletion(
    options: CompletionOptions
  ): Promise<CompletionResponse> {
    const response = await this.client.chat.completions.create({
      model: options.model,
      messages: options.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      stream: false,
    });

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      throw new Error("No content in OpenAI response");
    }

    return {
      content: choice.message.content,
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
      },
    };
  }

  async *createStreamingCompletion(
    options: CompletionOptions
  ): AsyncGenerator<StreamChunk> {
    const stream = await this.client.chat.completions.create({
      model: options.model,
      messages: options.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      const done = chunk.choices[0]?.finish_reason !== null;

      if (content || done) {
        yield {
          content,
          done,
        };
      }
    }
  }
}
