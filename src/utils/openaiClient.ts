import OpenAI from "openai";

class OpenAIClientSingleton {
  private static instance: OpenAI | null = null;

  private constructor() {}

  public static getInstance(): OpenAI {
    if (!OpenAIClientSingleton.instance) {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
      }

      OpenAIClientSingleton.instance = new OpenAI({
        apiKey: apiKey,
      });
    }

    return OpenAIClientSingleton.instance;
  }

  public static resetInstance(): void {
    OpenAIClientSingleton.instance = null;
  }
}

export const getOpenAIClient = (): OpenAI => {
  return OpenAIClientSingleton.getInstance();
};

export const resetOpenAIClient = (): void => {
  OpenAIClientSingleton.resetInstance();
};
