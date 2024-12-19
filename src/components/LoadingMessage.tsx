import { useEffect, useState } from 'react';

interface LoadingMessageProps {
  onCancel: () => void;
}

export const LoadingMessage = ({ onCancel }: LoadingMessageProps) => {
  const [isLongWait, setIsLongWait] = useState(false);
  
  useEffect(() => {
    // Only show the "taking longer" message after a reasonable wait
    const timer = setTimeout(() => {
      setIsLongWait(true);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-[80%] p-4 rounded-2xl shadow-lg bg-chat-message-bg/90 
                    border border-border-color/10 backdrop-blur-sm space-y-4">
      {/* Indeterminate progress bar */}
      <div className="w-full h-1 bg-border-color/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent-primary w-1/3 rounded-full
                     animate-[loading_1.5s_ease-in-out_infinite]"
        />
      </div>

      {/* Loading message */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="animate-spin h-4 w-4">
            <svg className="text-accent-primary" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <span className="text-sm text-text-secondary transition-all duration-300">
            {isLongWait ? 
              'This is taking longer than usual...' : 
              'Generating response...'}
          </span>
        </div>

        <button
          onClick={onCancel}
          className="px-3 py-1 text-sm text-text-secondary hover:text-foreground 
                     bg-chat-message-bg/50 hover:bg-chat-message-bg 
                     rounded-lg transition-all duration-200"
        >
          Cancel
        </button>
      </div>

      {/* Skeleton loading preview */}
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-border-color/20 rounded w-3/4" />
        <div className="h-4 bg-border-color/20 rounded w-1/2" />
      </div>
    </div>
  );
};
