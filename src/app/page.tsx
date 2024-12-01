'use client';

import { useState } from 'react';
import { Message, SystemPrompts } from '@/types/messages';
import Settings from '@/components/Settings';
import { systemPrompts } from '@/app/constants/systemPrompts';
import { models } from '@/app/constants/models';
import FileUpload from '@/components/FileUpload';
import { ProcessedFile } from '@/types/fileProcessing';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localSystemPrompts, setSystemPrompts] = useState<SystemPrompts>(systemPrompts);
  const [uploadedFiles, setUploadedFiles] = useState<ProcessedFile[]>([]);
  const [codeContext, setCodeContext] = useState<string>('');

  const handleFilesProcessed = (formattedContent: string, files: ProcessedFile[]) => {
    setUploadedFiles(files);
    setCodeContext(formattedContent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessage: Message = {
      content: input,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          model: selectedModel,
          systemPrompt: localSystemPrompts[Object.keys(models).find(provider => 
            models[provider].includes(selectedModel)
          ) || 'OpenAI'],
          codeContext: codeContext
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      setMessages(prev => [...prev, {
        content: data.response,
        role: 'assistant',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error:', error);
      // You could add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-2 border rounded-lg text-gray-900 mr-2"
          >
            {Object.entries(models).map(([provider, modelList]) => (
              <optgroup label={provider} key={provider}>
                {modelList.map(model => (
                  <option value={model} key={model}>{model}</option>
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

        <div className="p-4 border-b">
          <FileUpload onFilesProcessed={handleFilesProcessed} />
          {uploadedFiles.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {uploadedFiles.length} files uploaded
            </div>
          )}
        </div>

        <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'ml-auto bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-900'
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
      
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemPrompts={localSystemPrompts}
        onSave={setSystemPrompts}
      />
    </main>
  );
}