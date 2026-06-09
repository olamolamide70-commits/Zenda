import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Menu, X, User, Laptop } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Shop', to: '/marketplace' },
  { label: 'Calculator', to: '/calculator' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, isAuthenticated } = useApp();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 glass-card mx-2 mt-2 sm:mx-6 sm:mt-6 rounded-3xl sm:rounded-[2rem] shadow-premium">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 transition-all hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <Laptop className="h-5 w-5" />
          </div>
          <span className="text-xl font-black text-foreground uppercase tracking-tighter">Zenda<span className="text-primary italic">.</span></span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-all hover:text-primary ${
                location.pathname === link.to ? 'text-primary' : 'text-muted-foreground/40'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>


        <div className="flex items-center gap-4">
          <Link 
            to="/cart" 
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-muted-foreground/60 transition-all hover:bg-white hover:text-primary border border-slate-100"
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-0 text-[8px] font-black text-white ring-2 ring-white">
                {cartCount}
              </Badge>
            )}
          </Link>
          
          <div className="h-4 w-[1px] bg-slate-100 mx-1 hidden sm:block" />

          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="sm" className="h-10 px-6 rounded-xl bg-primary text-white border-none hover:bg-primary/90 transition-all font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
                <User className="h-3.5 w-3.5 mr-2" /> My Account
              </Button>
            </Link>
          ) : (
            <div className="hidden gap-3 sm:flex">
              <Link to="/login">
                <Button size="sm" variant="ghost" className="h-10 px-4 text-muted-foreground/60 hover:text-primary hover:bg-slate-50 font-bold uppercase text-[10px] tracking-widest">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="h-10 rounded-xl bg-primary text-white font-black hover:bg-primary/90 transition-all px-6 shadow-lg shadow-primary/20 uppercase text-[10px] tracking-widest">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
          <button 
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5 md:hidden" 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="overflow-hidden border-t border-border bg-white px-4 pb-8 pt-4 md:hidden"
          >
            <div className="space-y-1">
              {navLinks.map(l => (
                <Link 
                  key={l.to} 
                  to={l.to} 
                  onClick={() => setMobileOpen(false)} 
                  className={`block rounded-xl px-4 py-4 text-lg font-bold transition-all ${
                    location.pathname === l.to ? 'bg-secondary text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            {!isAuthenticated && (
              <div className="mt-6 flex flex-col gap-4 pt-6 border-t border-border">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button size="lg" variant="ghost" className="w-full h-14 rounded-xl text-muted-foreground font-bold">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="lg" className="w-full h-14 rounded-xl bg-primary text-white font-bold">Get Started</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
