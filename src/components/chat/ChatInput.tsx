'use client';
import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] p-4 flex items-end space-x-3">
      <div className="flex-grow relative bg-[var(--bg-elevated)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] focus-within:border-[var(--accent-brand)] transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask about a transaction (e.g., 'Check tx_9832abc')"
          className="w-full bg-transparent p-3 max-h-[120px] resize-none focus:outline-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)] disabled:opacity-50"
          rows={1}
        />
      </div>
      <Button 
        onClick={handleSubmit} 
        disabled={!input.trim() || disabled}
        className="shrink-0 h-12 w-12 rounded-full p-0 flex items-center justify-center shadow-sm"
        aria-label="Send message"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}
