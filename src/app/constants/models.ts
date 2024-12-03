import { ModelConfig } from "@/types/messages";

export const models: ModelConfig = {
  OpenAI: ["chatgpt-4o-latest", "gpt-4-turbo", "gpt-3.5-turbo"],
  Anthropic: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"],
  Gemini: ["gemini-1.5-pro", "gemini-1.5-flash-8b", "gemini-1.5-flash"],
  LLama: ["llama-2-70b"],
};
