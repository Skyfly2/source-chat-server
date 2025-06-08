import { Request, Response } from "express";
import { getAllModels } from "../config/modelRegistry";
import { CompletionsManager } from "../managers/CompletionsManager";
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

  constructor() {
    this.completionsManager = new CompletionsManager();
  }

  streamChat: ChatStreamHandler = async (
    req: Request<{}, any, ChatRequest, {}>,
    res: Response<any>
  ): Promise<void> => {
    try {
      if (!validateChatRequest(req.body)) {
        const errorResponse: ApiResponse<never> = createValidationError(
          "Invalid request body. Message is required and must be a non-empty string."
        );
        res.status(400).json(errorResponse);
        return;
      }

      const { message, model, context, promptKey } = req.body;

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await this.completionsManager.createStreamingCompletion(
        message,
        {
          model,
          context,
          promptKey,
          maxTokens: 1000,
          temperature: 0.7,
        }
      );

      for await (const chunk of stream) {
        if (chunk.content) {
          res.write(chunk.content);
        }
        if (chunk.done) {
          break;
        }
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
