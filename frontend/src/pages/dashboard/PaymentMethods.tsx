import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, Loader2, ShieldCheck, Zap, Palette, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { paymentService, authService } from '@/services';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import VirtualCard, { CardSkin } from '@/components/VirtualCard';

const SKINS: { id: CardSkin; name: string; description: string; color: string }[] = [
  { id: 'default', name: 'Premium Blue', description: 'The classic Zenda aesthetic.', color: 'bg-primary' },
  { id: 'obsidian', name: 'Obsidian Black', description: 'Stealthy, sleek, and minimalist.', color: 'bg-zinc-900' },
  { id: 'gold', name: 'Royal Gold', description: 'For the high-flyers and achievers.', color: 'bg-amber-600' },
  { id: 'midnight', name: 'Midnight Purple', description: 'Deep, mysterious, and vibrant.', color: 'bg-indigo-900' },
  { id: 'glass', name: 'Clear Glass', description: 'Futuristic transparency and light.', color: 'bg-white/20' }
];

export default function PaymentMethods() {
  const { user, setUser } = useApp();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [previewSkin, setPreviewSkin] = useState<CardSkin>((user?.card_design as CardSkin) || 'default');

  const { data: cards, isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: () => paymentService.getCards()
  });

  const activateCardMutation = useMutation({
    mutationFn: () => authService.activateCard(),
    onSuccess: (updatedUser) => {
      setUser({ ...user, ...updatedUser });
      toast.success('Virtual installment card activated!');
    }
  });

  const updateDesignMutation = useMutation({
    mutationFn: (skin: CardSkin) => authService.updateProfile({ card_design: skin }),
    onSuccess: (updatedUser) => {
      setUser({ ...user, ...updatedUser });
      toast.success('Card design updated!');
    }
  });

  const removeCardMutation = useMutation({
    mutationFn: (id: string) => paymentService.removeCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success('Payment method removed');
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">My Wallet</p>
          <h1 className="text-5xl font-black text-foreground tracking-tighter">Finance & Style</h1>
          <p className="mt-2 text-muted-foreground font-medium max-w-md">Manage your active payment methods and customize your Virtual Installment Card.</p>
        </div>
        <Button 
          className="h-16 px-10 rounded-2xl bg-primary text-base font-black text-white transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-105 active:scale-95"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="mr-2 h-6 w-6" /> Add New Card
        </Button>
      </div>

      <div className="grid gap-12 lg:grid-cols-5 items-start">
        {/* Left Column: Card Preview & Customizer */}
        <div className="lg:col-span-3 space-y-10">
          <div className="p-10 rounded-[3rem] bg-slate-50/50 border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Preview</span>
             </div>
             
             <div className="flex justify-center">
                <VirtualCard 
                    userName={user?.name || 'Valued Member'} 
                    creditLimit={user?.credit_limit || 150000} 
                    availableLimit={(user?.credit_limit || 150000) * 0.7} 
                    skin={previewSkin}
                    isActive={user?.is_card_active}
                />
             </div>

             {/* Skin Selector & Activation */}
             <div className="mt-12">
                {!user?.is_card_active ? (
                    <div className="text-center py-6 bg-white/50 rounded-[2rem] border border-dashed border-primary/20">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-4">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-black text-foreground tracking-tight mb-2">Activate Your Installment Line</h3>
                        <p className="text-sm font-medium text-muted-foreground mb-8 max-w-[280px] mx-auto">Click below to create your secure virtual card and unlock your spending power.</p>
                        <Button 
                            className="h-14 px-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                            onClick={() => activateCardMutation.mutate()}
                            disabled={activateCardMutation.isPending}
                        >
                            {activateCardMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Zap className="h-5 w-5 mr-2 fill-white" />}
                            Create Virtual Card
                        </Button>
                    </div>
                ) : (
                    <>
                        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-6">Select Premium Skin</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            {SKINS.map((skin) => (
                                <button
                                    key={skin.id}
                                    onClick={() => {
                                        setPreviewSkin(skin.id);
                                        updateDesignMutation.mutate(skin.id);
                                    }}
                                    className={`
                                        relative group flex flex-col items-center p-4 rounded-2xl transition-all duration-300
                                        ${previewSkin === skin.id ? 'bg-white shadow-xl ring-2 ring-primary ring-inset' : 'bg-transparent hover:bg-slate-100'}
                                    `}
                                >
                                    <div className={`h-10 w-10 rounded-full ${skin.color} shadow-lg mb-3 ${skin.id === 'glass' ? 'border border-slate-200' : ''}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground text-center line-clamp-1">{skin.name}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
             </div>
          </div>

          {/* Tips Section */}
          <div className="p-8 rounded-3xl bg-indigo-50 border border-indigo-100 flex gap-6">
             <div className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Zap className="h-6 w-6" />
             </div>
             <div>
                <h4 className="font-black text-indigo-900 leading-tight">Pro Tip: Spending Power</h4>
                <p className="text-xs font-bold text-indigo-600/70 mt-1">Your available balance refreshes instantly after every successful installment payment. Keep your card active to maintain high limits!</p>
             </div>
          </div>
        </div>

        {/* Right Column: Active Cards List */}
        <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-foreground tracking-tight">Saved Methods</h2>
                <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-[10px] uppercase">{cards?.length || 0} Saved</Badge>
            </div>

            <div className="space-y-4">
                {cards && cards.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {cards.map((card: any, i: number) => (
                            <motion.div 
                                key={card.id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-slate-50 border border-border group-hover:bg-primary/5 transition-colors">
                                            <CreditCard className="h-7 w-7 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-black text-foreground uppercase tracking-tight">{card.card_type} •••• {card.last4}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Exp: {card.exp_month}/{card.exp_year}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => removeCardMutation.mutate(card.id)}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3 text-success" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-success italic">Secure & Verified</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-slate-50/50 py-20 text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-4" />
                        <h3 className="font-black text-foreground uppercase tracking-widest text-[10px]">No Methods Found</h3>
                        <p className="text-xs font-bold text-muted-foreground mt-1 max-w-[140px]">Add your first card to start shopping.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Add Card Modal / Simulation */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8">
                    <button onClick={() => setIsAdding(false)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>

                <div className="text-center mb-10">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-black text-foreground tracking-tighter">Add Secure Card</h2>
                    <p className="text-sm font-medium text-muted-foreground mt-2">Connecting to Paystack Secure Gateway...</p>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 italic opacity-50">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">Connecting...</span>
                    </div>
                    
                    <Button 
                        className="w-full h-16 rounded-2xl bg-black text-white font-black uppercase tracking-[0.2em]"
                        onClick={() => {
                            toast.info("Paystack integration is ready for production credentials.");
                            setIsAdding(false);
                        }}
                    >
                        Connect Card
                    </Button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

