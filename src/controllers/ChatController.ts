import { Request, Response } from "express";
import { getAllModels } from "../config/modelRegistry";
import { CompletionsManager } from "../managers/CompletionsManager";
import { ThreadsManager } from "../managers/ThreadsManager";
import {
  ApiResponse,
  ChatRequest,
  ChatStreamHandler,
  GetModelsHandler,
  GetPromptsHandler,
} from "../types";
import {
  createValidationError,
  validateChatRequest,
} from "../utils/validationUtils";

export class ChatController {
  private completionsManager: CompletionsManager;
  private threadsManager: ThreadsManager;

  constructor() {
    this.completionsManager = new CompletionsManager();
    this.threadsManager = new ThreadsManager();
  }

  streamChat: ChatStreamHandler = async (
    req: Request<{}, any, ChatRequest, {}>,
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

      const { message, model, promptKey } = req.body;
      let { threadId } = req.body;

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
        const defaultModel = model || "claude-sonnet-4-0";
        const threadTitle = this.threadsManager.generateThreadTitle(message);
        thread = await this.threadsManager.createThread(
          threadTitle,
          defaultModel
        );
        threadId = thread._id!.toString();
      }

      await this.threadsManager.addMessageToThread(threadId, "user", message);

      const context = await this.threadsManager.getThreadMessages(threadId);

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Thread-Id", threadId);
      res.setHeader("X-Thread-Title", thread.title);
      res.setHeader("X-Thread-Model", thread.model);

      const stream = await this.completionsManager.createStreamingCompletion(
        message,
        {
          model: model || thread.model,
          context,
          promptKey,
          maxTokens: 1000,
          temperature: 0.7,
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

  createCompletion = async (
    req: Request<{}, any, ChatRequest, {}>,
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

      const { message, model, promptKey } = req.body;
      let { threadId } = req.body;

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
        const defaultModel = model || "claude-sonnet-4-0";
        const threadTitle = this.threadsManager.generateThreadTitle(message);
        thread = await this.threadsManager.createThread(
          threadTitle,
          defaultModel
        );
        threadId = thread._id!.toString();
      }

      await this.threadsManager.addMessageToThread(threadId, "user", message);

      const context = await this.threadsManager.getThreadMessages(threadId);

      const response = await this.completionsManager.createCompletion(message, {
        model: model || thread.model,
        context,
        promptKey,
        maxTokens: 1000,
        temperature: 0.7,
      });

      await this.threadsManager.addMessageToThread(
        threadId,
        "assistant",
        response
      );

      const apiResponse: ApiResponse<any> = {
        success: true,
        data: {
          content: response,
          thread: {
            id: threadId,
            title: thread.title,
            model: thread.model,
          },
        },
      };
      res.json(apiResponse);
    } catch (error) {
      console.error("Completion error:", error);
      const errorResponse: ApiResponse<never> = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create completion",
      };
      res.status(500).json(errorResponse);
    }
  };

  getModels: GetModelsHandler = async (
    __req: Request<{}, ApiResponse<any>, {}, {}>,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const allModels = getAllModels();
      const availableProviders =
        this.completionsManager.getAvailableProviders();

      // Filter models to only include those whose providers are available
      const availableModels = allModels.filter((model) =>
        availableProviders.includes(model.provider)
      );

      // Get all registry keys (including aliases) for available providers
      const { MODEL_REGISTRY } = require("../config/modelRegistry");
      const allRegistryKeys = Object.keys(MODEL_REGISTRY).filter((key) => {
        const modelInfo = MODEL_REGISTRY[key];
        return availableProviders.includes(modelInfo.provider);
      });

      // Deduplicate model details by actual model name
      const uniqueModelDetails = new Map();
      availableModels.forEach((model) => {
        if (!uniqueModelDetails.has(model.name)) {
          uniqueModelDetails.set(model.name, {
            name: model.name,
            displayName: model.displayName,
            provider: model.provider,
            maxTokens: model.maxTokens,
            contextWindow: model.contextWindow,
            supportsStreaming: model.supportsStreaming,
            features: model.features,
          });
        }
      });

      const response: ApiResponse<any> = {
        success: true,
        data: {
          models: allRegistryKeys,
          modelDetails: Array.from(uniqueModelDetails.values()),
          availableProviders,
        },
      };
      res.json(response);
    } catch (error) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get models",
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
