import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Loader2 } from 'lucide-react';

export default function Assistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai'|'user', content: string}[]>([
    { role: 'ai', content: "Hello! I'm your travel assistant. How can I help you refine your expedition today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // For now, we use the same generation endpoint but treat it as a refinement
      // In a real app, this would be a separate refinement/chat endpoint
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          destination: 'Refinement Mode', 
          days: '3', 
          preferences: `Refine current plan based on: ${userMessage}` 
        })
      });

      if (!response.ok) throw new Error('Failed to chat');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: "I've noted that! You can see improvements reflected in your dashboard or ask me more specific questions." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "My telegraph lines are down. I'll be back shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 md:w-96 h-[450px] rounded-2xl shadow-2xl border border-ink/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <header className="bg-ink text-paper p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot size={18} />
              <span className="font-serif font-bold">Thru Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-70">
              <X size={18} />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] bg-fixed">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-stamp-blue text-white rounded-tr-none' 
                    : 'bg-white text-ink border border-ink/10 rounded-tl-none shadow-sm'
                }`}>
                   {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-ink/10 p-3 rounded-xl rounded-tl-none shadow-sm flex items-center space-x-2">
                  <Loader2 size={14} className="animate-spin text-ink-light" />
                  <span className="text-xs font-typewriter italic">Consulting charts...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          <footer className="p-4 bg-white border-t border-ink/10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your assistant..."
                className="w-full bg-paper border border-ink/10 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-ink"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 p-1.5 text-ink hover:text-stamp-red disabled:opacity-30 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </footer>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-ink text-paper p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all group relative"
        >
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-stamp-red rounded-full border-2 border-paper animate-pulse"></div>
          <MessageSquare size={24} />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-ink text-paper px-3 py-1 rounded-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-typewriter uppercase tracking-widest pointer-events-none">
            Need Help?
          </span>
        </button>
      )}
    </div>
  );
}
