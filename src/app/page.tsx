"use client";

import { useState } from "react";
import { Message, SystemPrompts, CodeContext } from "@/types/messages";
import Settings from "@/components/Settings";
import { systemPrompts } from "@/app/constants/systemPrompts";
import { models } from "@/app/constants/models";
import FolderUpload from "@/components/FolderUpload";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4-turbo");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localSystemPrompts, setSystemPrompts] =
    useState<SystemPrompts>(systemPrompts);
  const [codeContext, setCodeContext] = useState<CodeContext>({ files: [] });

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

      setMessages((prev) => [
        ...prev,
        {
          content: data.response,
          role: "assistant",
          timestamp: new Date().toISOString(),
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

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1600px] mx-auto">
        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="w-full p-2 border rounded-lg text-gray-900 mr-2"
            >
              {Object.entries(models).map(([provider, modelList]) => (
                <optgroup label={provider} key={provider}>
                  {modelList.map((model) => (
                    <option value={model} key={model}>
                      {model}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
            >
              Settings
            </button>
          </div>

          <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "ml-auto bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg text-gray-900"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Code Structure Analysis
            </h2>
            {codeContext.files.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {codeContext.files.length} files loaded as context
              </p>
            )}
          </div>
          <div className="p-4">
            <FolderUpload onStructureUpdate={handleFolderStructureUpdate} />
          </div>
        </div>
      </div>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemPrompts={localSystemPrompts}
        onSave={setSystemPrompts}
      />
    </main>
  );
}
