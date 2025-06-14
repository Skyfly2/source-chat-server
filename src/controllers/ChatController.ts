import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { CompletionsManager } from "../managers/CompletionsManager";
import { ThreadsManager } from "../managers/ThreadsManager";
import {
  AllModelsApiResponse,
  ApiResponse,
  AuthenticatedChatStreamHandler,
  ChatMessage,
  GetAllModelsHandler,
  GetImportantModelsHandler,
  GetPromptsHandler,
  ImportantModelsApiResponse,
  OpenRouterModel,
  OpenRouterModelsResponse,
} from "../types";
import {
  createValidationError,
  validateChatRequest,
} from "../utils/validationUtils";

const IMPORTANT_MODELS = new Set([
  // OpenAI
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "openai/o1",
  "openai/o1-mini",
  "openai/gpt-4-turbo",

  // Anthropic
  "anthropic/claude-3.5-sonnet",
  "anthropic/claude-3.5-haiku",
  "anthropic/claude-3-opus",

  // Google
  "google/gemini-2.5-flash",

  // DeepSeek
  "deepseek/deepseek-chat",
  "deepseek/deepseek-r1",
]);

export class ChatController {
  private completionsManager: CompletionsManager;
  private threadsManager: ThreadsManager;

  constructor() {
    this.completionsManager = new CompletionsManager();
    this.threadsManager = new ThreadsManager();
  }

  streamChat: AuthenticatedChatStreamHandler = async (
    req,
    res: Response<any>
  ): Promise<void> => {
    try {
      if (!validateChatRequest(req.body)) {
        const errorResponse: ApiResponse<never> = createValidationError(
          "Invalid request body. Message is required."
        );
        res.status(400).json(errorResponse);
        return;
      }

      const {
        message,
        model,
        promptKey,
        context: providedContext,
        webSearch,
      } = req.body;

      const { user } = req;
      let { threadId } = req.body;

      if (!model) {
        const errorResponse: ApiResponse<never> =
          createValidationError("Model is required.");
        res.status(400).json(errorResponse);
        return;
      }

      let thread;
      if (threadId) {
        thread = await this.threadsManager.getThread(threadId);
        if (!thread) {
          const errorResponse: ApiResponse<never> = {
            success: false,
            error: "Thread not found",
          };
          res.status(404).json(errorResponse);
          return;
        }
      } else {
        const threadTitle = this.threadsManager.generateThreadTitle(message);
        thread = await this.threadsManager.createThread(threadTitle, user.id);
        threadId = thread._id!.toString();
      }

      await this.threadsManager.addMessageToThread(threadId, "user", message);

      // Use provided context from frontend instead of database call for better performance
      let context: ChatMessage[];
      if (providedContext && providedContext.length > 0) {
        // Convert AIMessage[] from frontend to ChatMessage[] format expected by CompletionsManager
        context = providedContext.map((msg) => ({
          role: msg.role,
          content: msg.content,
          threadId: new ObjectId(threadId),
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      } else {
        // Fallback to database call if no context provided
        context = await this.threadsManager.getThreadMessages(threadId);
      }

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Thread-Id", threadId);
      res.setHeader("X-Thread-Title", thread.title);
      res.setHeader("X-Thread-Model", model);

      const stream = await this.completionsManager.createStreamingCompletion(
        message,
        {
          model,
          context,
          promptKey,
          maxTokens: 1000,
          temperature: 0.7,
          webSearch,
        }
      );

      let assistantResponse = "";
      for await (const chunk of stream) {
        if (chunk.content) {
          assistantResponse += chunk.content;
          res.write(chunk.content);
        }
        if (chunk.done) {
          break;
        }
      }

      if (assistantResponse) {
        await this.threadsManager.addMessageToThread(
          threadId,
          "assistant",
          assistantResponse
        );
      }

      res.end();
    } catch (error) {
      console.error("Streaming error:", error);

      if (!res.headersSent) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to stream chat response",
        };
        res.status(500).json(errorResponse);
      } else {
        res.end();
      }
    }
  };

  private async fetchAndFilterModels(): Promise<{
    importantModels: OpenRouterModel[];
    allModels: OpenRouterModel[];
    totalModels: number;
  }> {
    const response = await fetch("https://openrouter.ai/api/v1/models");

    if (!response.ok) {
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as OpenRouterModelsResponse;
    const allModels = data.data || [];

    const filteredModels = allModels.filter(
      (model: OpenRouterModel) =>
        model.context_length >= 4000 &&
        parseFloat(model.pricing?.prompt || "0") < 1.0 &&
        parseFloat(model.pricing?.completion || "0") < 1.0
    );

    const importantModels = filteredModels.filter((model: OpenRouterModel) =>
      IMPORTANT_MODELS.has(model.id)
    );

    const sortModels = (models: OpenRouterModel[]) =>
      models.sort((a, b) => {
        const providerA = a.id.split("/")[0];
        const providerB = b.id.split("/")[0];
        if (providerA !== providerB) {
          return providerA.localeCompare(providerB);
        }
        return a.name.localeCompare(b.name);
      });

    return {
      importantModels: sortModels([...importantModels]),
      allModels: sortModels([...filteredModels]),
      totalModels: allModels.length,
    };
  }

  getImportantModels: GetImportantModelsHandler = async (
    __req: Request<{}, ApiResponse<ImportantModelsApiResponse>, {}, {}>,
    res: Response<ApiResponse<ImportantModelsApiResponse>>
  ): Promise<void> => {
    try {
      const { importantModels } = await this.fetchAndFilterModels();

      const apiResponse: ApiResponse<ImportantModelsApiResponse> = {
        success: true,
        data: {
          models: importantModels,
          count: importantModels.length,
        },
      };
      res.json(apiResponse);
    } catch (error) {
      console.error("Error fetching important models from OpenRouter:", error);
      const errorResponse: ApiResponse<never> = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get important models",
      };
      res.status(500).json(errorResponse);
    }
  };

  getAllModels: GetAllModelsHandler = async (
    __req: Request<{}, ApiResponse<AllModelsApiResponse>, {}, {}>,
    res: Response<ApiResponse<AllModelsApiResponse>>
  ): Promise<void> => {
    try {
      const { allModels, totalModels } = await this.fetchAndFilterModels();

      const apiResponse: ApiResponse<AllModelsApiResponse> = {
        success: true,
        data: {
          models: allModels,
          totalModels,
        },
      };
      res.json(apiResponse);
    } catch (error) {
      console.error("Error fetching all models from OpenRouter:", error);
      const errorResponse: ApiResponse<never> = {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get all models",
      };
      res.status(500).json(errorResponse);
    }
  };

  getSystemPrompts: GetPromptsHandler = async (
    __req: Request<{}, ApiResponse<Record<string, string>>, {}, {}>,
    res: Response<ApiResponse<Record<string, string>>>
  ): Promise<void> => {
    try {
      const prompts = this.completionsManager.getSystemPrompts();
      const response: ApiResponse<Record<string, string>> = {
        success: true,
        data: prompts,
      };
      res.json(response);
    } catch (error) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get system prompts",
      };
      res.status(500).json(errorResponse);
    }
  };
}
