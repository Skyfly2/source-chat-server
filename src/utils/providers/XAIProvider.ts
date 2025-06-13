import axios from "axios";
import { getModelsByProvider } from "../../config/modelRegistry";
import {
  AIProvider,
  CompletionOptions,
  ProviderConfig,
  StreamChunk,
} from "../../types";

export class XAIProvider extends AIProvider {
  name = "xai";
  private apiKey: string;
  private baseURL: string;

  constructor(config: ProviderConfig) {
    super();
    this.apiKey = config.apiKey || process.env.XAI_API_KEY || "";
    this.baseURL = config.baseURL || "https://api.x.ai";

    if (!this.apiKey) {
      throw new Error("xAI API key is required");
    }
  }

  getSupportedModels(): string[] {
    return getModelsByProvider("xai").map((model) => model.name);
  }

  isModelSupported(model: string): boolean {
    return this.getSupportedModels().includes(model);
  }

  async *createStreamingCompletion(
    options: CompletionOptions
  ): AsyncGenerator<StreamChunk> {
    const body = {
      model: options.model,
      messages: options.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      stream: true,
    };

    const response = await axios.post(
      `${this.baseURL}/v1/chat/completions`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        responseType: "stream",
      }
    );

    const stream = response.data;
    let buffer = "";

    for await (const chunk of stream) {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6).trim();
          if (dataStr === "[DONE]") {
            yield { content: "", done: true };
            return;
          }

          try {
            const data = JSON.parse(dataStr) as {
              choices?: Array<{
                delta?: {
                  content?: string;
                };
                finish_reason?: string | null;
              }>;
            };

            const choice = data.choices?.[0];
            const content = choice?.delta?.content || "";
            const done =
              choice?.finish_reason !== null &&
              choice?.finish_reason !== undefined;

            if (content) {
              yield { content, done: false };
            }

            if (done) {
              yield { content: "", done: true };
              return;
            }
          } catch (e) {
            // Skip invalid JSON
            console.warn("Failed to parse xAI streaming chunk:", dataStr);
          }
        }
      }
    }

    yield { content: "", done: true };
  }
}
