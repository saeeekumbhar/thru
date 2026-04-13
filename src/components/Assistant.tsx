import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      // Small delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessages(prev => [...prev, { role: 'ai', content: "I've noted that! You can see improvements reflected in your planner or ask me more specific questions." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "My telegraph lines are down. I'll be back shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white w-80 md:w-96 h-[500px] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-ink/10 flex flex-col overflow-hidden mb-4"
          >
            <header className="bg-ink text-paper p-5 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-paper/10 flex items-center justify-center">
                  <Bot size={18} className="text-paper/80" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm leading-tight">thru Assistant</h3>
                  <p className="text-[8px] font-typewriter uppercase tracking-widest text-paper/60">Refining Your Journey</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="h-8 w-8 rounded-full hover:bg-paper/10 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper bg-map-texture">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-ink text-paper rounded-tr-none' 
                      : 'bg-white text-ink border border-ink/5 rounded-tl-none font-sans leading-relaxed'
                  }`}>
                     {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-ink/5 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                    <Loader2 size={14} className="animate-spin text-ink-light" />
                    <span className="text-[10px] font-typewriter italic text-ink-light">Consulting the itinerary...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 bg-white border-t border-ink/5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for advice or refinements..."
                  className="w-full bg-paper/50 border border-ink/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-ink focus:bg-white transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 h-8 w-8 bg-ink text-paper rounded-lg flex items-center justify-center hover:bg-ink-light disabled:opacity-30 transition-all shadow-md active:scale-90"
                >
                  <Send size={14} />
                </button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-end">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all group relative overflow-hidden ${
            isOpen ? 'bg-stamp-red text-paper' : 'bg-ink text-paper'
          }`}
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X size={28} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <MessageSquare size={28} />
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {!isOpen && (
              <motion.span 
                initial={{ opacity: 0, x: 20 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-ink text-paper px-4 py-2 rounded-lg text-[10px] whitespace-nowrap font-typewriter uppercase tracking-widest pointer-events-none shadow-xl border border-white/10"
              >
                Need help planning?
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
