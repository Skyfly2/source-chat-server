import axios from "axios";
import { getModelsByProvider } from "../../config/modelRegistry";
import {
  AIProvider,
  ChatMessage,
  CompletionOptions,
  CompletionResponse,
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

  private formatMessages(messages: ChatMessage[]): any[] {
    const formattedMessages = [];
    let systemPrompt = "";

    for (const message of messages) {
      if (message.role === "system") {
        systemPrompt = message.content;
      } else {
        formattedMessages.push({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        });
      }
    }

    if (systemPrompt && formattedMessages.length > 0) {
      const firstMessage = formattedMessages[0];
      if (firstMessage.role === "user") {
        firstMessage.parts[0].text = `${systemPrompt}\n\n${firstMessage.parts[0].text}`;
      }
    }

    return formattedMessages;
  }

  async createCompletion(
    options: CompletionOptions
  ): Promise<CompletionResponse> {
    const messages = this.formatMessages(options.messages);

    const body = {
      contents: messages,
      generationConfig: {
        maxOutputTokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
      },
    };

    const response = await axios.post(
      `${this.baseURL}/v1beta/models/${options.model}:generateContent?key=${this.apiKey}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    };

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      content,
      model: options.model,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount,
        completionTokens: data.usageMetadata?.candidatesTokenCount,
        totalTokens: data.usageMetadata?.totalTokenCount,
      },
    };
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
