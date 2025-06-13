import axios from "axios";
import { getModelsByProvider } from "../../config/modelRegistry";
import {
  AIMessage,
  AIProvider,
  CompletionOptions,
  ProviderConfig,
  StreamChunk,
} from "../../types";

export class GoogleProvider extends AIProvider {
  name = "google";
  private apiKey: string;
  private baseURL: string;

  constructor(config: ProviderConfig) {
    super();
    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY || "";
    this.baseURL =
      config.baseURL || "https://generativelanguage.googleapis.com";

    if (!this.apiKey) {
      throw new Error("Google API key is required");
    }
  }

  getSupportedModels(): string[] {
    return getModelsByProvider("google").map((model) => model.name);
  }

  isModelSupported(model: string): boolean {
    return this.getSupportedModels().includes(model);
  }

  private formatMessages(messages: AIMessage[]): any[] {
    return messages.map((message) => {
      if (message.role === "system") {
        return {
          role: "user",
          content: `System: ${message.content}`,
        };
      }
      return {
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content,
      };
    });
  }

  async *createStreamingCompletion(
    options: CompletionOptions
  ): AsyncGenerator<StreamChunk> {
    const messages = this.formatMessages(options.messages);

    const body = {
      contents: messages,
      generationConfig: {
        maxOutputTokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
      },
    };

    const response = await axios.post(
      `${this.baseURL}/v1beta/models/${options.model}:streamGenerateContent?key=${this.apiKey}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    const stream = response.data;
    let buffer = "";

    for await (const chunk of stream) {
      buffer += chunk.toString();
    }

    try {
      const data = JSON.parse(buffer) as Array<{
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
          finishReason?: string;
        }>;
      }>;

      for (const item of data) {
        const candidate = item.candidates?.[0];
        const content = candidate?.content?.parts?.[0]?.text || "";
        const done = candidate?.finishReason !== undefined;

        if (content) {
          yield { content, done: false };
        }

        if (done) {
          yield { content: "", done: true };
          return;
        }
      }
    } catch (e) {
      console.error("Failed to parse Google streaming response:", e);
      console.error("Raw buffer:", buffer);
    }

    yield { content: "", done: true };
  }
}
