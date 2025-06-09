import axios from "axios";
import { getModelsByProvider } from "../../config/modelRegistry";
import {
  AIMessage,
  AIProvider,
  CompletionOptions,
  CompletionResponse,
  ProviderConfig,
  StreamChunk,
} from "../../types";

export class AnthropicProvider extends AIProvider {
  name = "anthropic";
  private apiKey: string;
  private baseURL: string;

  constructor(config: ProviderConfig) {
    super();
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || "";
    this.baseURL = config.baseURL || "https://api.anthropic.com";

    if (!this.apiKey) {
      throw new Error("Anthropic API key is required");
    }
  }

  getSupportedModels(): string[] {
    return getModelsByProvider("anthropic").map((model) => model.name);
  }

  isModelSupported(model: string): boolean {
    return this.getSupportedModels().includes(model);
  }

  private formatMessages(messages: AIMessage[]): {
    system?: string;
    messages: AIMessage[];
  } {
    const systemMessage = messages.find((msg) => msg.role === "system");
    const conversationMessages = messages.filter(
      (msg) => msg.role !== "system"
    );

    return {
      system: systemMessage?.content,
      messages: conversationMessages,
    };
  }

  async createCompletion(
    options: CompletionOptions
  ): Promise<CompletionResponse> {
    const { system, messages } = this.formatMessages(options.messages);

    const body = {
      model: options.model,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      system,
      messages,
    };

    const response = await axios.post(`${this.baseURL}/v1/messages`, body, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
    });

    const data = response.data as {
      content?: Array<{ text?: string }>;
      model: string;
      usage?: {
        input_tokens?: number;
        output_tokens?: number;
      };
    };

    return {
      content: data.content?.[0]?.text || "",
      model: data.model,
      usage: {
        promptTokens: data.usage?.input_tokens,
        completionTokens: data.usage?.output_tokens,
        totalTokens:
          (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    };
  }

  async *createStreamingCompletion(
    options: CompletionOptions
  ): AsyncGenerator<StreamChunk> {
    const { system, messages } = this.formatMessages(options.messages);

    const body = {
      model: options.model,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      system,
      messages,
      stream: true,
    };

    const response = await axios.post(`${this.baseURL}/v1/messages`, body, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      responseType: "stream",
    });

    const stream = response.data;

    let buffer = "";

    for await (const chunk of stream) {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6);
          if (dataStr === "[DONE]") {
            yield { content: "", done: true };
            return;
          }

          try {
            const data = JSON.parse(dataStr) as {
              type?: string;
              delta?: { text?: string };
            };
            if (data.type === "content_block_delta") {
              yield {
                content: data.delta?.text || "",
                done: false,
              };
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    yield { content: "", done: true };
  }
}
