export interface EnvironmentConfig {
  port: number;
  nodeEnv: string;

  mongoUri?: string;

  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  xaiApiKey?: string;
  deepseekApiKey?: string;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",

    mongoUri: process.env.MONGO_URI,

    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
    xaiApiKey: process.env.XAI_API_KEY,
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  };
};

export const validateEnvironment = (): void => {
  const config = getEnvironmentConfig();

  const hasAnyApiKey = Boolean(
    config.openaiApiKey ||
      config.anthropicApiKey ||
      config.googleApiKey ||
      config.xaiApiKey ||
      config.deepseekApiKey
  );

  if (!hasAnyApiKey) {
    console.warn(
      "Warning: No AI provider API keys found. Please set at least one of the following environment variables:"
    );
    console.warn("- OPENAI_API_KEY");
    console.warn("- ANTHROPIC_API_KEY");
    console.warn("- GOOGLE_API_KEY");
    console.warn("- XAI_API_KEY");
    console.warn("- DEEPSEEK_API_KEY");
  }

  console.log("Available AI providers:");
  if (config.openaiApiKey) console.log("✓ OpenAI");
  if (config.anthropicApiKey) console.log("✓ Anthropic (Claude)");
  if (config.googleApiKey) console.log("✓ Google (Gemini)");
  if (config.xaiApiKey) console.log("✓ xAI (Grok)");
  if (config.deepseekApiKey) console.log("✓ DeepSeek");
};
