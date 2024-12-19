import { useState } from 'react';
import { SystemPrompts } from '@/types/messages';
import { useAutoHeight } from '@/hooks/useAutoHeight';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompts: SystemPrompts;
  onSave: (prompts: SystemPrompts) => void;
}

export default function Settings({ isOpen, onClose, systemPrompts, onSave }: SettingsProps) {
  const [prompts, setPrompts] = useState<SystemPrompts>(systemPrompts);
  const { textareaRef, adjustHeight } = useAutoHeight();

  const handleSave = () => {
    onSave(prompts);
    onClose();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, provider: string) => {
    setPrompts(prev => ({...prev, [provider]: e.target.value}));
    adjustHeight();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center transition-all duration-200">
      <div className="bg-chat-bg/90 backdrop-blur-xl p-8 rounded-2xl w-[600px] max-h-[80vh] overflow-y-auto 
                    border-2 border-border-color/20 shadow-2xl">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-border-color/10">
          <h2 className="text-2xl font-semibold text-foreground">System Prompts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-chat-message-bg/80 rounded-xl text-foreground/80 hover:text-foreground 
                     transition-all duration-200 border border-border-color/20"
            aria-label="Close settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(prompts).map(([provider, prompt]) => (
            <div key={provider} className="group p-4 rounded-xl border border-border-color/20 
                                        bg-chat-message-bg/40 backdrop-blur-sm">
              <label className="block text-foreground/90 font-medium mb-2 text-sm">{provider}</label>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => handleTextareaChange(e, provider)}
                className="w-full min-h-[8rem] p-3 rounded-xl bg-input-bg/80 text-input-text 
                         border border-border-color/20 placeholder-text-secondary/50 
                         backdrop-blur-sm focus:ring-2 focus:ring-accent-primary/20 
                         focus:border-accent-primary/20 transition-all duration-200
                         resize-none overflow-hidden"
                placeholder={`Enter system prompt for ${provider}...`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border-color/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-chat-message-bg/80 text-foreground rounded-xl 
                     hover:bg-chat-message-bg transition-all duration-200 
                     border border-border-color/20 backdrop-blur-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-accent-primary text-white rounded-xl
                     hover:bg-accent-primary/90 transition-all duration-200 font-medium
                     border border-white/10"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}