import { useState } from 'react';
import { SystemPrompts } from '@/types/messages';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompts: SystemPrompts;
  onSave: (prompts: SystemPrompts) => void;
}

export default function Settings({ isOpen, onClose, systemPrompts, onSave }: SettingsProps) {
  const [prompts, setPrompts] = useState<SystemPrompts>(systemPrompts);

  const handleSave = () => {
    onSave(prompts);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-chat-bg p-6 rounded-lg w-[600px] max-h-[80vh] overflow-y-auto border border-border-color shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">System Prompts Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-chat-message-bg rounded-lg text-foreground"
            aria-label="Close settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        {Object.entries(prompts).map(([provider, prompt]) => (
          <div key={provider} className="mb-4">
            <label className="block text-foreground font-medium mb-2">{provider}</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompts(prev => ({...prev, [provider]: e.target.value}))}
              className="w-full h-32 p-2 border rounded-lg bg-textarea-bg text-textarea-text border-border-color"
              placeholder={`Enter system prompt for ${provider}...`}
            />
          </div>
        ))}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-chat-message-bg text-foreground rounded-lg hover:opacity-80 border border-border-color"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}