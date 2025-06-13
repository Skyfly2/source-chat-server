import axios from "axios";
import { getModelsByProvider } from "../../config/modelRegistry";
import {
  AIProvider,
  CompletionOptions,
  ProviderConfig,
  StreamChunk,
} from "../../types";

export class DeepSeekProvider extends AIProvider {
  name = "deepseek";
  private apiKey: string;
  private baseURL: string;

  constructor(config: ProviderConfig) {
    super();
    this.apiKey = config.apiKey || process.env.DEEPSEEK_API_KEY || "";
    this.baseURL = config.baseURL || "https://api.deepseek.com";

    if (!this.apiKey) {
      throw new Error("DeepSeek API key is required");
    }
  }

  getSupportedModels(): string[] {
    return getModelsByProvider("deepseek").map((model) => model.name);
  }

  isModelSupported(model: string): boolean {
    return this.getSupportedModels().includes(model);
  }

  private isReasoningModel(model: string): boolean {
    return model === "deepseek-reasoner";
  }

  async *createStreamingCompletion(
    options: CompletionOptions
  ): AsyncGenerator<StreamChunk> {
    const isReasoning = this.isReasoningModel(options.model);
    console.log(
      `DeepSeek: Model ${options.model}, isReasoning: ${isReasoning}, temperature: ${options.temperature}`
    );

    const body: any = {
      model: options.model,
      messages: options.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: options.maxTokens || 4096,
      stream: true,
    };

    // DeepSeek reasoning models might not support custom temperature
    if (!isReasoning) {
      body.temperature = options.temperature || 0.7;
    }

    console.log("DeepSeek Request body:", JSON.stringify(body, null, 2));

    let response;
    try {
      response = await axios.post(`${this.baseURL}/v1/chat/completions`, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        responseType: "stream",
      });
    } catch (error: any) {
      if (error.response) {
        console.log(
          "DeepSeek Error Response:",
          error.response.status,
          error.response.data
        );
        try {
          const errorData = await error.response.data.read();
          console.log("DeepSeek Error Details:", errorData.toString());
        } catch (e) {
          // Ignore read errors
        }
      }
      throw error;
    }

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
              choices?: Array<{
                delta?: {
                  content?: string;
                };
                finish_reason?: string;
              }>;
            };

            const choice = data.choices?.[0];
            const content = choice?.delta?.content || "";
            const done = choice?.finish_reason !== null;

            if (content || done) {
              yield { content, done };
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
