export interface Message {
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
  }
  
export interface ModelConfig {
  [provider: string]: string[];
}

export interface SystemPrompts {
    [provider: string]: string;
}