import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ShoppingBag, LayoutDashboard, Settings, History, HelpCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Listen for Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const actions = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', category: 'Navigation' },
    { name: 'Browse Gadgets', icon: ShoppingBag, path: '/marketplace', category: 'Navigation' },
    { name: 'Payment History', icon: History, path: '/dashboard/orders', category: 'Navigation' },
    { name: 'Account Settings', icon: Settings, path: '/dashboard/settings', category: 'Account' },
    { name: 'Support Help', icon: HelpCircle, path: '/contact', category: 'Account' },
  ];

  const filteredActions = query === '' 
    ? actions 
    : actions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));

  const handleAction = useCallback((path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  }, [navigate]);

  return (
    <>
      {/* Floating Search Toggle */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 h-14 w-14 bg-white border border-slate-100 rounded-2xl shadow-premium flex items-center justify-center text-slate-400 hover:text-primary transition-all z-50 group hover:scale-110 active:scale-95"
      >
        <Command className="h-6 w-6" />
        <span className="absolute -top-2 -left-2 px-1.5 py-0.5 bg-primary text-[8px] font-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">CMD+K</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 glass-grain"
            >
              <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                <Search className="h-6 w-6 text-primary" />
                <input 
                  autoFocus
                  placeholder="Search for gadgets, actions, or settings..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-bold text-slate-700 placeholder:text-slate-300"
                />
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                {filteredActions.length > 0 ? (
                  <div className="space-y-4">
                    {/* Group by category if needed, here just simple list */}
                    {filteredActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleAction(action.path)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <action.icon className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-slate-700 tracking-tight">{action.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{action.category}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-slate-300 font-bold">No results found for "{query}"</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <div className="flex gap-4">
                   <span><span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 mr-1">↑↓</span> Navigate</span>
                   <span><span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 mr-1">Enter</span> Select</span>
                 </div>
                 <div>Zenda Command Palette</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Helper Icons for the navigation inside SearchPalette */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
      `}</style>
    </>
  );
}

// ArrowRight icon for the list items
function ArrowRight(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
