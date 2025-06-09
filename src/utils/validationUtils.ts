import { ChatRequest } from "../types";

export const validateChatRequest = (body: any): body is ChatRequest => {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof body.message === "string" &&
    body.message.trim().length > 0 &&
    (body.threadId === undefined ||
      (typeof body.threadId === "string" && body.threadId.trim().length > 0)) &&
    (body.model === undefined || typeof body.model === "string") &&
    (body.context === undefined ||
      (Array.isArray(body.context) &&
        body.context.every(
          (msg: any) =>
            typeof msg === "object" &&
            msg !== null &&
            typeof msg.role === "string" &&
            ["system", "user", "assistant"].includes(msg.role) &&
            typeof msg.content === "string"
        ))) &&
    (body.promptKey === undefined || typeof body.promptKey === "string")
  );
};

export const createValidationError = (message: string) => ({
  success: false as const,
  error: message,
});

export const isNonEmptyString = (value: any): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};
