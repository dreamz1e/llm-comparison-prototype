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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[600px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">System Prompts Settings</h2>
        
        {Object.entries(prompts).map(([provider, prompt]) => (
          <div key={provider} className="mb-4">
            <label className="block text-gray-900 font-medium mb-2">{provider}</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompts(prev => ({...prev, [provider]: e.target.value}))}
              className="w-full h-32 p-2 border rounded-lg text-gray-900"
              placeholder={`Enter system prompt for ${provider}...`}
            />
          </div>
        ))}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
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