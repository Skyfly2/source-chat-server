import { Request, Response } from "express";
import { ThreadsManager } from "../managers/ThreadsManager";
import {
  ApiResponse,
  ChatMessage,
  CreateThreadHandler,
  DeleteThreadHandler,
  GetThreadHandler,
  GetThreadsHandler,
  ThreadResponse,
  ThreadsResponse,
  UpdateThreadHandler,
  UpdateThreadRequest,
} from "../types";
import { createValidationError } from "../utils/validationUtils";

export class ThreadsController {
  private threadsManager: ThreadsManager;

  constructor() {
    this.threadsManager = new ThreadsManager();
  }

  createThread: CreateThreadHandler = async (
    req,
    res: Response<ApiResponse<ThreadResponse>>
  ): Promise<void> => {
    try {
      const { title, model } = req.body;
      const { user } = req;

      if (!title || typeof title !== "string" || title.trim().length === 0) {
        const errorResponse = createValidationError(
          "Title is required and must be a non-empty string"
        );
        res.status(400).json(errorResponse);
        return;
      }

      if (!model || typeof model !== "string" || model.trim().length === 0) {
        const errorResponse = createValidationError(
          "Model is required and must be a non-empty string"
        );
        res.status(400).json(errorResponse);
        return;
      }

      const thread = await this.threadsManager.createThread(
        title.trim(),
        user.id
      );

      const response: ApiResponse<ThreadResponse> = {
        success: true,
        data: { thread },
      };
      res.status(201).json(response);
    } catch (error) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create thread",
      };
      res.status(500).json(errorResponse);
    }
  };

  getThread: GetThreadHandler = async (
    req: Request<{ threadId: string }, ApiResponse<ThreadResponse>, {}, {}>,
    res: Response<ApiResponse<ThreadResponse>>
  ): Promise<void> => {
    try {
      const { threadId } = req.params;

      if (!threadId) {
        const errorResponse = createValidationError("Thread ID is required");
        res.status(400).json(errorResponse);
        return;
      }

      const thread = await this.threadsManager.getThread(threadId);

      if (!thread) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: "Thread not found",
        };
        res.status(404).json(errorResponse);
        return;
      }

      const response: ApiResponse<ThreadResponse> = {
        success: true,
        data: { thread },
      };
      res.json(response);
    } catch (error) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get thread",
      };
      res.status(500).json(errorResponse);
    }
  };

  getThreads: GetThreadsHandler = async (
    req: Request<
      {},
      ApiResponse<ThreadsResponse>,
      {},
      { limit?: string; skip?: string; search?: string }
    >,
    res: Response<ApiResponse<ThreadsResponse>>
  ): Promise<void> => {
    try {
      const { limit = "10", skip = "0", search } = req.query;

      const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
      const skipNum = Math.max(0, parseInt(skip, 10) || 0);

      let threads;
      if (search) {
        threads = await this.threadsManager.searchThreads(search, limitNum);
      } else {
        threads = await this.threadsManager.getAllThreads(limitNum, skipNum);
      }

      const response: ApiResponse<ThreadsResponse> = {
        success: true,
        data: {
          threads,
          total: threads.length,
        },
      };
      res.json(response);
    } catch (error) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get threads",
      };
      res.status(500).json(errorResponse);
    }
  };

  updateThread: UpdateThreadHandler = async (
    req: Request<
      { threadId: string },
      ApiResponse<ThreadResponse>,
      UpdateThreadRequest,
      {}
    >,
    res: Response<ApiResponse<ThreadResponse>>
  ): Promise<void> => {
    try {
      const { threadId } = req.params;
      const { title } = req.body;

      if (!threadId) {
        const errorResponse = createValidationError("Thread ID is required");
        res.status(400).json(errorResponse);
        return;
      }

      if (!title) {
        const errorResponse = createValidationError(
          "At least one field (title) must be provided"
        );
        res.status(400).json(errorResponse);
        return;
      }

      let thread = await this.threadsManager.updateThreadTitle(threadId, title);

      if (!thread) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: "Thread not found",
        };
        res.status(404).json(errorResponse);
        return;
      }

      const response: ApiResponse<ThreadResponse> = {
        success: true,
        data: { thread },
      };
      res.json(response);
    } catch (error) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update thread",
      };
      res.status(500).json(errorResponse);
    }
  };

  getThreadMessages = async (
    req: Request<
      { threadId: string },
      ApiResponse<{ messages: ChatMessage[] }>,
      {},
      {}
    >,
    res: Response<ApiResponse<{ messages: ChatMessage[] }>>
  ): Promise<void> => {
    try {
      const { threadId } = req.params;

      if (!threadId) {
        const errorResponse = createValidationError("Thread ID is required");
        res.status(400).json(errorResponse);
        return;
      }

      const thread = await this.threadsManager.getThread(threadId);
      if (!thread) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: "Thread not found",
        };
        res.status(404).json(errorResponse);
        return;
      }

      const messages = await this.threadsManager.getThreadMessages(threadId);

      const response: ApiResponse<{ messages: ChatMessage[] }> = {
        success: true,
        data: { messages },
      };
      res.json(response);
    } catch (error) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get thread messages",
      };
      res.status(500).json(errorResponse);
    }
  };

  deleteThread: DeleteThreadHandler = async (
    req: Request<{ threadId: string }, ApiResponse<never>, {}, {}>,
    res: Response<ApiResponse<never>>
  ): Promise<void> => {
    try {
      const { threadId } = req.params;

      if (!threadId) {
        const errorResponse = createValidationError("Thread ID is required");
        res.status(400).json(errorResponse);
        return;
      }

      const deleted = await this.threadsManager.deleteThread(threadId);

      if (!deleted) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: "Thread not found",
        };
        res.status(404).json(errorResponse);
        return;
      }

      const response: ApiResponse<never> = {
        success: true,
        message: "Thread deleted successfully",
      };
      res.json(response);
    } catch (error) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete thread",
      };
      res.status(500).json(errorResponse);
    }
  };
}
