export type Message = {
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  tokenUtils?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export type Response = {
  message: string;
  tokenUtils: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export type CodeContext = {
  files: {
    relativePath: string;
    content: string;
    language: string;
  }[];
};

export type ChatApiRequest = {
  message: string;
  model: string;
  systemPrompt: string;
  codeContext?: CodeContext;
};

export type SystemPrompts = {
  [key: string]: string;
};

export interface ModelConfig {
  [provider: string]: string[];
}
