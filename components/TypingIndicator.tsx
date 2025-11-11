import React from 'react';

interface TypingIndicatorProps {
  message?: string;
  showAvatar?: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  message = "L'IA réfléchit...", 
  showAvatar = true 
}) => {
  return (
    <div className="flex items-end gap-3 justify-start">
      {showAvatar && (
        <div className="w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
          IA
        </div>
      )}
      <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl rounded-bl-none p-4 max-w-xs">
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{message}</p>
        <div className="flex gap-1.5 items-center">
          <div 
            className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div 
            className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

