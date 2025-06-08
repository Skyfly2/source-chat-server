import { Request, Response } from "express";
import { ApiResponse, ChatRequest } from "../types";
import { getOpenAIClient } from "../utils/openaiClient";

export class ChatController {
  async streamChat(
    req: Request<{}, {}, ChatRequest>,
    res: Response
  ): Promise<void> {
    try {
      const { message } = req.body;

      if (!message || typeof message !== "string") {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: "Message is required and must be a string",
        };
        res.status(400).json(errorResponse);
        return;
      }

      const openai = getOpenAIClient();

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
        stream: true,
      });

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
  }
}
