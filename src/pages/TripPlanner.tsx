import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Send, Bot, User, Loader2, MapPin, Calendar, DollarSign } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function TripPlanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{role: 'ai'|'user', content: string}[]>([
    { role: 'ai', content: "Hello traveler. I'm your AI companion. Where would you like to go, and how many days do you have?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState({ destination: '', days: '', preferences: '' });
  const [step, setStep] = useState(0); // 0: Dest/Days, 1: Prefs, 2: Generating
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    if (step === 0) {
      // Very basic extraction for demo purposes
      setTripData(prev => ({ ...prev, destination: userMessage, days: '3' })); // Defaulting days for simplicity if not parsed
      setMessages(prev => [...prev, { role: 'ai', content: "Excellent choice. What kind of traveler are you? (e.g., foodie, history buff, budget backpacker, luxury seeker)" }]);
      setStep(1);
    } else if (step === 1) {
      setTripData(prev => ({ ...prev, preferences: userMessage }));
      setMessages(prev => [...prev, { role: 'ai', content: "Perfect. I'm crafting your itinerary now. This might take a moment..." }]);
      setStep(2);
      generateItinerary(tripData.destination || 'Unknown', '3', userMessage);
    }
  };

  const generateItinerary = async (destination: string, days: string, preferences: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, days, preferences })
      });

      if (!response.ok) throw new Error('Failed to generate');

      const itinerary = await response.json();
      
      // Save to Firestore
      if (user) {
        const tripRef = await addDoc(collection(db, 'trips'), {
          user_id: user.uid,
          destination: itinerary.title || destination,
          status: 'planning',
          itinerary: JSON.stringify(itinerary),
          budget: parseInt(itinerary.budgetEstimate?.replace(/[^0-9]/g, '') || '0'),
          createdAt: serverTimestamp()
        });

        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: `Your itinerary is ready! I've saved it to your journal. \n\n**[View Trip Details](/trips/${tripRef.id})**` 
        }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, my telegraph lines seem to be down. I couldn't generate the itinerary. Please try again later." }]);
      setStep(1); // Go back a step
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-paper">
      <header className="bg-paper-dark border-b border-ink/10 p-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-ink text-paper p-2 rounded-full">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-serif font-bold text-ink">Travel Companion</h2>
            <p className="text-xs font-typewriter text-ink-light">AI Assistant</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]"></div>
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}>
            <div className={`max-w-[85%] md:max-w-[70%] flex space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-stamp-blue text-white' : 'bg-ink text-paper'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`p-4 rounded-lg shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-white border border-ink/10 rounded-tr-none' 
                  : 'bg-paper-dark border border-ink/20 rounded-tl-none relative'
              }`}>
                {/* Sticky note effect for AI */}
                {msg.role === 'ai' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-3 bg-ink/10 rounded-full blur-[1px]"></div>
                )}
                
                <div className="prose prose-sm prose-stone max-w-none font-sans text-ink">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start relative z-10">
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} />
              </div>
              <div className="bg-paper-dark border border-ink/20 p-4 rounded-lg rounded-tl-none flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin text-ink-light" />
                <span className="text-sm font-typewriter text-ink-light">Consulting maps...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white border-t border-ink/10 p-4 z-10 pb-safe">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={loading || step === 2}
            className="w-full bg-paper border border-ink/20 rounded-full py-3 pl-6 pr-12 focus:outline-none focus:border-ink transition-colors font-sans"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || step === 2}
            className="absolute right-2 p-2 bg-ink text-paper rounded-full hover:bg-ink-light disabled:opacity-50 disabled:hover:bg-ink transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}
