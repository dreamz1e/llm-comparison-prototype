"use client";

import { useState, useEffect } from "react";
import { Message, SystemPrompts, CodeContext } from "@/types/messages";
import Settings from "@/components/Settings";
import { systemPrompts } from "@/app/constants/systemPrompts";
import { models } from "@/app/constants/models";
import FolderUpload from "@/components/FolderUpload";
import { MessageFormatter } from "@/utils/messageFormatter";
import { formatLLMResponse } from "@/utils/responseFormatter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useTheme } from '@/components/ThemeProvider';
import { TokenInfo } from "@/components/TokenInfo";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4-turbo");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localSystemPrompts, setLocalSystemPrompts] = useState<SystemPrompts>(systemPrompts);
  const [codeContext, setCodeContext] = useState<CodeContext>({ files: [] });
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const savedPrompts = localStorage.getItem('systemPrompts');
    if (savedPrompts) {
      try {
        const parsedPrompts = JSON.parse(savedPrompts);
        setLocalSystemPrompts(parsedPrompts);
      } catch (error) {
        console.error('Error parsing saved system prompts:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessage: Message = {
      content: input,
      role: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          model: selectedModel,
          systemPrompt:
            localSystemPrompts[
              Object.keys(models).find((provider) =>
                models[provider].includes(selectedModel)
              ) || "OpenAI"
            ],
          codeContext: codeContext.files.length > 0 ? codeContext : undefined,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const formattedResponse = data.response.message;

      setMessages((prev) => [
        ...prev,
        {
          content: formattedResponse,
          role: "assistant",
          timestamp: new Date().toISOString(),
          tokenUtils: data.response.tokenUtils,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderStructureUpdate = (files: CodeContext["files"]) => {
    setCodeContext({ files });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
    setMessages([]);
  };

  const handleSystemPromptsChange = (updatedPrompts: SystemPrompts) => {
    setLocalSystemPrompts(updatedPrompts);
    
    try {
      localStorage.setItem('systemPrompts', JSON.stringify(updatedPrompts));
    } catch (error) {
      console.error('Error saving system prompts:', error);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-background transition-colors duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
        {/* Chat Interface */}
        <div className="col-span-2 bg-chat-bg dark-gradient rounded-2xl shadow-2xl overflow-hidden border border-border-color/10">
          {/* Header */}
          <div className="p-4 border-b border-border-color/10 vibrancy">
            <div className="flex justify-between items-center">
              <select
                value={selectedModel}
                onChange={handleModelChange}
                className="w-full p-2.5 border rounded-xl text-select-text bg-select-bg/80 border-border-color/10 mr-2 
                         [&>optgroup]:bg-select-option-bg [&>optgroup]:text-select-option-text 
                         [&>optgroup>option]:bg-select-option-bg [&>optgroup>option]:text-select-option-text 
                         focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary/20
                         transition-all duration-200"
              >
                {Object.entries(models).map(([provider, modelList]) => (
                  <optgroup label={provider} key={provider} className="text-select-option-text font-medium">
                    {modelList.map((model) => (
                      <option value={model} key={model} className="text-select-option-text">
                        {model}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2.5 bg-chat-message-bg/80 text-foreground rounded-xl 
                           hover:bg-chat-message-bg transition-all duration-200 
                           border border-border-color/10 backdrop-blur-sm"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-4 py-2.5 bg-chat-message-bg/80 text-foreground rounded-xl 
                           hover:bg-chat-message-bg transition-all duration-200 
                           border border-border-color/10 backdrop-blur-sm"
                >
                  Settings
                </button>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="h-[60vh] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border-color/20 scrollbar-track-transparent">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[80%] p-4 rounded-2xl shadow-lg transition-all duration-200 ${
                  message.role === "user"
                    ? "ml-auto bg-accent-primary text-white"
                    : "bg-chat-message-bg/90 text-foreground border border-border-color/10 backdrop-blur-sm"
                }`}
              >
                <div className={message.role === "user" ? "" : "prose dark:prose-invert max-w-none"}>
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <MessageFormatter content={message.content} />
                  )}
                </div>
                {message.tokenUtils && (
                  <TokenInfo tokenUtils={message.tokenUtils} role={message.role} />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border-color/10 vibrancy">
            <div className="p-3 text-sm text-text-secondary">
              Total Tokens: {messages.reduce((acc, msg) => acc + (msg.tokenUtils?.totalTokens || 0), 0)}
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-border-color/10 rounded-xl 
                           bg-input-bg/80 text-input-text placeholder-text-secondary/50
                           focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary/20
                           transition-all duration-200 backdrop-blur-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-accent-primary text-white rounded-xl
                           hover:bg-accent-primary/90 disabled:opacity-50 
                           transition-all duration-200 font-medium"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="lg:col-span-1">
          <FolderUpload onStructureUpdate={handleFolderStructureUpdate} />
        </div>
      </div>

      {/* Settings Modal */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemPrompts={localSystemPrompts}
        onSave={handleSystemPromptsChange}
      />
    </main>
  );
}
