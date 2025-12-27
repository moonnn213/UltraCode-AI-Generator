import React, { useState, useCallback, useEffect } from 'react';
import { Send, Upload, Eraser, Github, ArrowRight, Zap } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { streamResponse } from './services/geminiService';
import { Message, AppMode, UserTier } from './types';

const generateId = () => Math.random().toString(36).substring(2, 9);
const STORAGE_KEY = 'ultraCode_history_v1';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATOR);
  const [tier, setTier] = useState<UserTier>('FREE');
  const [activeCodeContext, setActiveCodeContext] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to LocalStorage whenever messages change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a placeholder for the bot message
      const botMessageId = generateId();
      
      const botMessage: Message = {
        id: botMessageId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, botMessage]);

      await streamResponse(
        [...messages, userMessage],
        mode,
        activeCodeContext,
        (textChunk) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, content: textChunk } 
                : msg
            )
          );
        }
      );

    } catch (error) {
       setMessages(prev => [...prev, {
         id: generateId(),
         role: 'model',
         content: "Error: Unable to connect to UltraCode Core. Please check API configuration.",
         timestamp: Date.now(),
         isError: true
       }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if(window.confirm("Clear current session history? This cannot be undone.")) {
        setMessages([]);
        setActiveCodeContext('');
        localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setActiveCodeContext(text);
        setInput(prev => prev + `\nI have uploaded ${file.name}. Please analyze it.`);
      };
      reader.readAsText(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case AppMode.DEBUGGER: return "Paste your error log or buggy code here...";
      case AppMode.REFACTOR: return "Paste code to refactor or optimization requirements...";
      case AppMode.EXPLAINER: return "Paste code to explain or ask a concept...";
      default: return "Describe the functionality you need...";
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg text-gray-200 overflow-hidden font-sans selection:bg-neon-blue/30 selection:text-white">
      {/* Sidebar */}
      <Sidebar mode={mode} setMode={setMode} tier={tier} setTier={setTier} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        
        {/* Top Bar */}
        <div className="h-16 border-b border-dark-border bg-dark-surface/50 backdrop-blur-md flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">{mode} MODE</span>
            {activeCodeContext && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800">
                    File Context Active
                </span>
            )}
          </div>
          <div className="flex items-center gap-4">
             {/* Social/Ext Link */}
             <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
             </a>
             <div className="text-[10px] text-gray-600 font-mono hidden md:block">
                 @tt66_t
             </div>
          </div>
        </div>

        {/* Chat Area */}
        <ChatArea messages={messages} isLoading={isLoading} tier={tier} />

        {/* Input Area */}
        <div className="p-4 lg:p-6 bg-dark-bg border-t border-dark-border relative z-20">
            {/* Input Wrapper */}
            <div className={`relative rounded-2xl bg-dark-surface border transition-all duration-300
                ${isLoading ? 'border-gray-700 opacity-80' : 'border-gray-600 focus-within:border-neon-blue shadow-lg shadow-black/50'}`}>
                
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={getPlaceholder()}
                    className="w-full bg-transparent border-none text-gray-100 placeholder-gray-500 p-4 pr-32 min-h-[60px] max-h-[200px] resize-none focus:ring-0 rounded-2xl font-mono text-sm"
                    rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 8) : 1}
                />

                {/* Actions Toolbar (Inside Input) */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <label className="p-2 text-gray-400 hover:text-neon-blue hover:bg-neon-blue/10 rounded-lg cursor-pointer transition-colors" title="Upload Code File">
                        <Upload className="w-4 h-4" />
                        <input type="file" className="hidden" onChange={handleFileUpload} accept=".js,.ts,.py,.java,.c,.cpp,.html,.css,.json,.sql" />
                    </label>
                    
                    <button 
                        onClick={handleClear}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Clear Chat"
                    >
                        <Eraser className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className={`ml-2 p-2 px-4 rounded-xl flex items-center gap-2 font-bold text-sm transition-all duration-300
                            ${isLoading || !input.trim() 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:scale-105 active:scale-95'
                            }`}
                    >
                        <span>{isLoading ? 'Processing...' : 'Run'}</span>
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            
            <div className="mt-3 text-center">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                    AI generated code can be inaccurate. Review before deploying.
                </p>
            </div>
        </div>

        {/* Decorative Background Elements & Logo */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
            {/* Large Background Logo */}
            <div className="opacity-[0.03] transform scale-150 text-white">
                <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                   <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            </div>
            
            {/* Gradients */}
            <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[100px]"></div>
        </div>
      </div>
    </div>
  );
};

export default App;