import { useApp } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useApp();
  const items = wishlist;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Shopping</p>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Saved Gadgets</h1>
        <p className="mt-1 text-muted-foreground font-medium">Manage the premium items you've saved for later.</p>
      </div>

      <AnimatePresence mode="popLayout">
        {items.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <motion.div 
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="relative group"
              >
                <ProductCard product={p} />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 top-4 h-10 w-10 rounded-xl bg-white/80 text-muted-foreground backdrop-blur-sm transition-all hover:bg-destructive hover:text-white hover:scale-110 shadow-sm opacity-0 group-hover:opacity-100 border border-border"
                  onClick={() => removeFromWishlist(p.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50/50 py-24 text-center"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white border border-border shadow-sm">
              <Heart className="h-10 w-10 text-slate-500" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Wishlist is Empty</h2>
            <p className="mt-2 text-muted-foreground max-w-xs mx-auto">Browse our premium gadgets and save the ones you love.</p>
            <Link to="/marketplace" className="mt-8">
              <Button className="h-14 px-10 rounded-xl bg-primary text-white font-bold shadow-md">
                Explore Marketplace
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
