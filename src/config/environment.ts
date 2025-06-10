export interface EnvironmentConfig {
  port: number;
  nodeEnv: string;

  mongodbConnectionString?: string;
  mongodbDatabaseName: string;

  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  xaiApiKey?: string;
  deepseekApiKey?: string;
  clerkPublishableKey?: string;
  clerkSecretKey?: string;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    port: parseInt(process.env.PORT || "8080", 10),
    nodeEnv: process.env.NODE_ENV || "development",

    mongodbConnectionString: process.env.MONGODB_CONNECTION_STRING,
    mongodbDatabaseName: process.env.MONGODB_DATABASE_NAME || "sourcechat",

    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
    xaiApiKey: process.env.XAI_API_KEY,
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    clerkSecretKey: process.env.CLERK_SECRET_KEY,
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

  console.log("✓ Environment configuration validated");
};
