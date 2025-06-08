import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  model?: string;
  context?: ChatMessage[];
  promptKey?: string;
}

export interface CompletionConfig {
  model: string;
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
  stream: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
