import axios from "axios";
import {
  AIProvider,
  CompletionOptions,
  ProviderConfig,
  StreamChunk,
} from "../../types";

export class OpenRouterProvider extends AIProvider {
  name = "openrouter";
  private apiKey: string;
  private baseURL: string;
  private supportedModels: string[] = [];
  private modelsInitialized = false;

  constructor(config: ProviderConfig) {
    super();
    this.apiKey = config.apiKey || process.env.OPEN_ROUTER_KEY || "";
    this.baseURL = config.baseURL || "https://openrouter.ai/api/v1";

    if (!this.apiKey) {
      throw new Error("OpenRouter API key is required");
    }
  }

  getSupportedModels(): string[] {
    if (!this.modelsInitialized) {
      console.warn("Models not initialized yet. Call initialize() first.");
      return [];
    }
    return this.supportedModels;
  }

  async getSupportedModelsAsync(): Promise<string[]> {
    if (!this.modelsInitialized) {
      await this.fetchSupportedModels();
    }
    return this.supportedModels;
  }

  private async fetchSupportedModels(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      this.supportedModels =
        response.data.data?.map((model: any) => model.id) || [];
      this.modelsInitialized = true;
    } catch (error) {
      console.error("Failed to fetch supported models from OpenRouter:", error);
      this.supportedModels = [];
      this.modelsInitialized = false;
    }
  }

  async initialize(): Promise<void> {
    await this.fetchSupportedModels();
  }

  async *createStreamingCompletion(
    options: CompletionOptions
  ): AsyncGenerator<StreamChunk> {
    const body = {
      model: options.webSearch ? `${options.model}:online` : options.model,
      messages: options.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      stream: true,
    };

    const response = await axios.post(
      `${this.baseURL}/chat/completions`,
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
            console.warn(
              "Failed to parse OpenRouter streaming chunk:",
              dataStr
            );
          }
        }
      }
    }

    yield { content: "", done: true };
  }
}
