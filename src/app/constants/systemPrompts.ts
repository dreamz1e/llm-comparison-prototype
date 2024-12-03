import { SystemPrompts } from "@/types/messages";

export const systemPrompts: SystemPrompts = {
    'OpenAI': 'You are only responding with "test 123". Nothing else no matter what has been written',
    'Anthropic': 'You are Claude, a helpful AI assistant created by Anthropic.',
    'Gemini': 'You are a helpful AI assistant powered by Google Gemini.',
    'LLama': 'You are a helpful AI assistant powered by LLama.'
}   