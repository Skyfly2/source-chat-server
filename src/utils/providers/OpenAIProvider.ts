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

  private isReasoningModel(model: string): boolean {
    return /^(o1|o3|o4)(-|$)/.test(model);
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
    const isReasoning = this.isReasoningModel(options.model);
    const requestParams: any = {
      model: options.model,
      messages: options.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: false,
    };

    // Reasoning models don't support custom temperature
    if (!isReasoning && options.temperature !== undefined) {
      requestParams.temperature = options.temperature;
    }

    // Use max_completion_tokens for reasoning models, max_tokens for others
    if (isReasoning) {
      if (options.maxTokens) {
        requestParams.max_completion_tokens = options.maxTokens;
      }
    } else {
      if (options.maxTokens) {
        requestParams.max_tokens = options.maxTokens;
      }
    }

    const response = await this.client.chat.completions.create(requestParams);

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
    const isReasoning = this.isReasoningModel(options.model);
    console.log(
      `OpenAI: Model ${options.model}, isReasoning: ${isReasoning}, temperature: ${options.temperature}`
    );

    const requestParams: any = {
      model: options.model,
      messages: options.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    };

    // Reasoning models don't support custom temperature
    if (!isReasoning && options.temperature !== undefined) {
      requestParams.temperature = options.temperature;
    }

    // Use max_completion_tokens for reasoning models, max_tokens for others
    if (isReasoning) {
      if (options.maxTokens) {
        requestParams.max_completion_tokens = options.maxTokens;
      }
    } else {
      if (options.maxTokens) {
        requestParams.max_tokens = options.maxTokens;
      }
    }

    console.log(
      "OpenAI Request params:",
      JSON.stringify(requestParams, null, 2)
    );

    const stream = (await this.client.chat.completions.create(
      requestParams
    )) as any;

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
