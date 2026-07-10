import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const PRESET_PROMPTS = [
  "Tell me about Turpeen You Perfume 🌸",
  "Help me choose a Balm Dotcom flavor 🍒",
  "How do I use Futuredew for a glowing routine? ✨",
  "A gentle skincare routine for sensitive skin 🧴"
];

export default function AijayChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "Hi darling! I'm Aijay, your personal Turpeen beauty consultant. ✨ Whether you need help styling your brows with Boy Brow, choosing an irresistible Balm Dotcom flavor, or crafting a custom daily routine—I'm here to guide you. What's on your mind today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Keep only last 10 messages for context window to stay performant and elegant
      const chatHistory = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        text: msg.text
      })).slice(-10);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory
        })
      });

      if (!response.ok) {
        throw new Error('Our boutique consultants are momentarily occupied. Please try again!');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        text: data.text || "I'm here to help, but had a small lapse in beauty thoughts. Ask me anything else!"
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        text: "Hi darling! I'm Aijay, your personal Turpeen beauty consultant. ✨ Whether you need help styling your brows with Boy Brow, choosing an irresistible Balm Dotcom flavor, or crafting a custom daily routine—I'm here to guide you. What's on your mind today?"
      }
    ]);
    setError(null);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        id="aijay-chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-20 z-50 flex items-center space-x-2 bg-black hover:bg-neutral-800 text-white pl-4 pr-5 py-3 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-neutral-800"
        title="Chat with Aijay"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-rose-300 animate-pulse group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-neutral-100">
          Ask Aijay
        </span>
      </button>

      {/* Chat Window Drawer/Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="aijay-chatbot-window"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col font-sans"
          >
            {/* Elegant Header */}
            <div className="bg-neutral-900 text-white px-5 py-4 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-400 to-rose-200 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-4 h-4 text-neutral-950" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-serif italic font-bold tracking-wide text-lg text-white">aijay<span className="text-rose-400 font-sans not-italic">.</span></h3>
                    <span className="text-[8px] font-mono tracking-widest bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full uppercase font-bold">AI Concierge</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono tracking-wider">Turpeen Beauty Guide</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {/* Clear chat button */}
                <button
                  onClick={resetChat}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Reset conversation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Panel */}
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-50/50 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === 'user' ? 'bg-neutral-200 text-neutral-700' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-neutral-900 text-white rounded-tr-none'
                        : 'bg-white text-neutral-800 shadow-sm border border-neutral-100 rounded-tl-none'
                    }`}>
                      <div className="whitespace-pre-line">{msg.text}</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loader */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="px-3.5 py-3 rounded-2xl rounded-tl-none bg-white text-neutral-500 shadow-sm border border-neutral-100 text-xs">
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-100 text-center">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 py-3 bg-white border-t border-neutral-100 overflow-x-auto whitespace-nowrap scrollbar-none flex space-x-2">
                {PRESET_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetClick(prompt)}
                    className="inline-block bg-neutral-50 hover:bg-rose-50/50 hover:text-rose-700 hover:border-rose-200 border border-neutral-200 text-neutral-600 rounded-full px-3.5 py-1.5 text-[10px] font-medium transition-all cursor-pointer select-none shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 bg-white border-t border-neutral-100 flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Aijay about ingredients, routines..."
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition-all text-neutral-800 placeholder-neutral-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-9 h-9 rounded-full bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-black active:scale-95 shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
