import React, { useRef, useEffect } from 'react';
import { Message, UserTier } from '../types';
import { Bot, User, Sparkles } from 'lucide-react';
import CodeBlock from './CodeBlock';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  tier: UserTier;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading, tier }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Helper to detect Arabic text for RTL
  const isArabic = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };

  const renderContent = (content: string) => {
    // Basic markdown parsing for code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const match = part.match(/^```(\w+)?\n([\s\S]*)```$/);
        const language = match ? match[1] : '';
        const code = match ? match[2] : part.slice(3, -3); // Fallback
        return <CodeBlock key={index} language={language} code={code} />;
      }
      
      // Regular text (handle newlines)
      // Check if this specific paragraph is Arabic
      const isRTL = isArabic(part);
      return (
        <p key={index} className={`whitespace-pre-wrap mb-2 ${isRTL ? 'text-right' : 'text-left'} leading-relaxed text-gray-300`}>
          {part}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 relative">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
           <div className="w-20 h-20 bg-gradient-to-tr from-neon-blue/20 to-neon-purple/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
             <Sparkles className="w-10 h-10 text-neon-blue" />
           </div>
           <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
             UltraCode <span className="text-neon-blue">AI</span>
           </h2>
           <p className="text-gray-400 max-w-md">
             {tier === 'PRO' ? 'Professional System Active.' : 'Free Tier Active.'} Start by describing your project, pasting code to debug, or asking for a concept explanation.
           </p>
           <p className="mt-4 text-xs text-gray-500 font-mono border border-gray-800 px-3 py-1 rounded-full">
             Model: Gemini 3 Pro Preview
           </p>
        </div>
      )}

      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.role === 'model' && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex-shrink-0 flex items-center justify-center shadow-lg shadow-neon-blue/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
          )}

          <div 
            className={`max-w-[85%] lg:max-w-[75%] rounded-2xl p-4 lg:p-6 shadow-xl border 
              ${msg.role === 'user' 
                ? 'bg-gray-800 border-gray-700 rounded-tr-none' 
                : 'glass-panel rounded-tl-none border-white/5'
              }`}
          >
             {renderContent(msg.content)}
          </div>

          {msg.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center border border-gray-600">
              <User className="w-4 h-4 text-gray-300" />
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-4 max-w-4xl mx-auto">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex-shrink-0 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white animate-spin" />
          </div>
          <div className="glass-panel p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
            <div className="w-2 h-2 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
};

export default ChatArea;