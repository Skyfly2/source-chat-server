import axios from "axios";
import { Request, Response } from "express";
import { ApiResponse } from "../types";

export class ChatController {
  async getData(req: Request, res: Response): Promise<void> {
    try {
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/posts"
      );
      const apiResponse: ApiResponse<any[]> = {
        success: true,
        data: response.data,
      };
      res.json(apiResponse);
    } catch (error) {
      const apiResponse: ApiResponse<never> = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch data",
      };
      res.status(500).json(apiResponse);
    }
  }
}
