import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: 'Hi! I am your Zenda financial assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMsg = message;
    setMessage('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { message: userMsg });
      setChat(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (error) {
      setChat(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-6 w-[380px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-background shadow-premium"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-primary p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-black tracking-tight">Financial AI</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Online & Ready</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-xl p-2 transition-colors hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat */}
            <div ref={scrollRef} className="h-[400px] overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm font-bold tracking-tight ${
                    msg.role === 'user' ? 'bg-primary text-white ml-auto' : 'bg-white/5 text-gray-300'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="animate-pulse rounded-2xl bg-white/5 px-5 py-3 text-xs text-gray-500 font-black uppercase tracking-widest">
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/5 p-4 bg-white/[0.02]">
              <div className="flex gap-2">
                <Input 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about plans, credit..." 
                  className="rounded-xl border-white/5 bg-white/5 text-white h-12"
                />
                <Button onClick={handleSend} className="h-12 w-12 rounded-xl bg-primary p-0">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-primary text-white shadow-premium transition-transform hover:scale-110 active:scale-95"
      >
        <MessageSquare className="h-8 w-8" />
      </button>
    </div>
  );
}
