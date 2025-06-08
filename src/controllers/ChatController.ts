import { Request, Response } from "express";
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
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(content);
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
    __req: Request<{}, ApiResponse<string[]>, {}, {}>,
    res: Response<ApiResponse<string[]>>
  ): Promise<void> => {
    try {
      const models = this.completionsManager.getSupportedModels();
      const response: ApiResponse<string[]> = {
        success: true,
        data: models,
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
