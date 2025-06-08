import { Request, Response } from "express";
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

// AI Provider Types
export interface CompletionOptions {
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface CompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export abstract class AIProvider {
  abstract name: string;
  abstract getSupportedModels(): string[];
  abstract createCompletion(
    options: CompletionOptions
  ): Promise<CompletionResponse>;
  abstract createStreamingCompletion(
    options: CompletionOptions
  ): AsyncGenerator<StreamChunk>;
  abstract isModelSupported(model: string): boolean;
}

export interface ProviderConfig {
  apiKey?: string;
  baseURL?: string;
  [key: string]: any;
}

export type AIProviderType =
  | "openai"
  | "anthropic"
  | "google"
  | "xai"
  | "deepseek";

export interface ModelInfo {
  name: string;
  provider: AIProviderType;
  displayName: string;
  maxTokens: number;
  supportsStreaming: boolean;
  contextWindow: number;
}

// Request Parameter Types
export interface ChatStreamParams {}

export interface GetModelsParams {}

export interface GetPromptsParams {}

// Request Body Types
export interface ChatStreamBody extends ChatRequest {}

// Response Data Types
export interface ModelsResponse {
  models: string[];
}

export interface PromptsResponse {
  prompts: Record<string, string>;
}

export interface HealthResponse {
  message: string;
  timestamp: string;
}

// Query Parameter Types
export interface ChatStreamQuery {}

export interface GetModelsQuery {}

export interface GetPromptsQuery {}

// Typed Request/Response interfaces for Express endpoints
export interface TypedRequest<P = {}, B = {}, Q = {}> {
  params: P;
  body: B;
  query: Q;
}

export interface TypedResponse<T> {
  json(data: ApiResponse<T>): void;
  status(code: number): TypedResponse<T>;
}

// Express handler utility types
export type ExpressHandler<
  P = {},
  ResBody = any,
  ReqBody = {},
  ReqQuery = {}
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>
) => Promise<void> | void;

export type ApiHandler<T, P = {}, ReqBody = {}, ReqQuery = {}> = ExpressHandler<
  P,
  ApiResponse<T>,
  ReqBody,
  ReqQuery
>;

// Specific endpoint request types
export interface ChatStreamRequest
  extends TypedRequest<ChatStreamParams, ChatStreamBody, ChatStreamQuery> {}

export interface GetModelsRequest
  extends TypedRequest<GetModelsParams, {}, GetModelsQuery> {}

export interface GetPromptsRequest
  extends TypedRequest<GetPromptsParams, {}, GetPromptsQuery> {}

// Specific endpoint handler types
export type ChatStreamHandler = ExpressHandler<{}, any, ChatRequest, {}>;

export type GetModelsHandler = ApiHandler<string[]>;

export type GetPromptsHandler = ApiHandler<Record<string, string>>;

export type HealthHandler = ApiHandler<HealthResponse>;
