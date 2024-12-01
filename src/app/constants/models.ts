import { ModelConfig } from "@/types/messages";

export const models: ModelConfig = {
    'OpenAI': ['chatgpt-4o-latest','gpt-4-turbo', 'gpt-3.5-turbo'],
    'Anthropic': ['claude-3-opus', 'claude-3-sonnet'],
    'Gemini': ['gemini-pro'],
    'LLama': ['llama-2-70b']
};