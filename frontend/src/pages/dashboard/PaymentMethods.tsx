import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService, authService, walletService, giftCardService } from '@/services';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, Plus, Trash2, Loader2, ShieldCheck, Zap, Palette, 
  AlertCircle, Send, Gift, History, ArrowDownLeft, ArrowUpRight, CheckCircle2, X 
} from 'lucide-react';
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

  // Modals / Overlays
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  
  // Customization
  const [previewSkin, setPreviewSkin] = useState<CardSkin>((user?.card_design as CardSkin) || 'default');

  // Input states
  const [recipientEmail, setRecipientEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');
  const [voucherCode, setVoucherCode] = useState('');

  // 1. Query Saved Cards
  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: () => paymentService.getCards()
  });

  // 2. Query Wallet Balance & History
  const { data: walletDetails = { balance: 10000, transactions: [] }, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet-details', user?.id],
    queryFn: () => walletService.getDetails(),
    refetchInterval: 5000 // Refetch every 5 seconds for live cash flow!
  });

  // Mutations
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

  // P2P Send Money Mutation
  const sendMoneyMutation = useMutation({
    mutationFn: (data: { recipientEmail: string; amount: number; description?: string }) => walletService.transfer(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-details'] });
      toast.success(res.message);
      setIsTransferring(false);
      setRecipientEmail('');
      setTransferAmount('');
      setTransferDesc('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Transfer failed');
    }
  });

  // Voucher Redeem Mutation
  const redeemVoucherMutation = useMutation({
    mutationFn: (code: string) => giftCardService.redeem({ code }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-details'] });
      toast.success(res.message);
      setVoucherCode('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Redemption failed');
    }
  });

  const handleSendMoneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(transferAmount);
    if (!recipientEmail || isNaN(amount) || amount <= 0) {
      toast.warning('Please enter valid transfer credentials');
      return;
    }
    sendMoneyMutation.mutate({
      recipientEmail,
      amount,
      description: transferDesc
    });
  };

  const handleRedeemVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode) {
      toast.warning('Please enter a voucher code');
      return;
    }
    redeemVoucherMutation.mutate(voucherCode);
  };

  if (cardsLoading || walletLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Header Grid */}
      <div className="grid gap-6 md:grid-cols-3 items-center">
        <div className="md:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Financial Hub</p>
          <h1 className="text-5xl font-black text-foreground tracking-tighter">Digital Wallet & Style</h1>
          <p className="mt-2 text-muted-foreground font-medium max-w-md">Send secure transfers instantly, redeem promotional gift cards, and customise your virtual spending card skin.</p>
        </div>
        
        {/* Wallet Balance Hero Card (Dynamic Glassmorphism) */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-primary p-8 text-white shadow-xl shadow-primary/20 group hover:scale-[1.02] transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="h-24 w-24" /></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-250">Wallet Balance</span>
          <h2 className="text-4xl font-black text-white mt-2 tracking-tighter">{formatCurrency(walletDetails.balance)}</h2>
          
          <div className="mt-8 flex gap-3">
            <button 
              onClick={() => setIsTransferring(true)} 
              className="flex-1 py-3 rounded-xl bg-white/20 hover:bg-white text-white hover:text-primary transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" /> Transfer
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-5 items-start">
        {/* Left Column: Virtual Credit Card customizing (3 columns) */}
        <div className="lg:col-span-3 space-y-10">
          <div className="p-10 rounded-[3rem] bg-slate-50/50 border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Customizer</span>
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

             {/* Skin Selector */}
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

          {/* Ledger / Transactions History */}
          <div className="rounded-[3rem] border border-slate-100 bg-white p-10 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Wallet Activity Ledger
            </h3>

            <div className="space-y-4">
              {walletDetails.transactions.length > 0 ? (
                walletDetails.transactions.map((tx: any) => {
                  const isDebit = tx.type === 'debit';
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-all text-xs">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isDebit ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                          {isDebit ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{tx.description}</p>
                          <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{new Date(tx.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`font-black text-sm ${isDebit ? 'text-red-500' : 'text-green-500'}`}>
                        {isDebit ? '-' : '+'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground font-medium">
                  Your digital wallet activity is empty. Redeemed codes or transfer credits will log here.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Voucher Redemption & Payment Cards list (2 columns) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Zenda Coupon Voucher Card */}
          <div className="rounded-[2.5rem] bg-slate-50 border border-slate-100 p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" /> Redeem Zenda Card
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">Enter your custom generated 16-character voucher code to credit your balance immediately.</p>
            </div>

            <form onSubmit={handleRedeemVoucher} className="space-y-4">
              <input 
                type="text"
                required
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="e.g. ZENDA-K8A1-9F2B"
                className="w-full h-12 px-4 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-xs uppercase tracking-widest text-center transition-all"
              />
              <Button 
                type="submit"
                disabled={redeemVoucherMutation.isPending}
                className="w-full h-14 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {redeemVoucherMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Claim Voucher Credit'}
              </Button>
            </form>
          </div>

          {/* Credit Card Methods list */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-foreground tracking-tight">Saved Methods</h2>
                <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-[10px] uppercase">{cards.length} Cards</Badge>
            </div>

            <div className="space-y-4">
                {cards.length > 0 ? (
                  cards.map((card: any) => (
                      <div 
                          key={card.id}
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
                      </div>
                  ))
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-slate-50/50 py-12 text-center">
                        <AlertCircle className="h-8 w-8 text-slate-500 mb-4" />
                        <h3 className="font-black text-foreground uppercase tracking-widest text-[9px]">No Cards Linked</h3>
                        <Button 
                          variant="ghost" 
                          className="mt-3 text-[10px] font-bold uppercase tracking-widest text-primary"
                          onClick={() => setIsAddingCard(true)}
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" /> Add First Card
                        </Button>
                    </div>
                )}

                {cards.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-2xl border-dashed font-bold uppercase tracking-widest text-xs"
                    onClick={() => setIsAddingCard(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Payment Card
                  </Button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: P2P Fund Transfer Overlay */}
      <AnimatePresence>
        {isTransferring && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative"
            >
                <button 
                  onClick={() => setIsTransferring(false)} 
                  className="absolute top-6 right-6 h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="text-center mb-8">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                        <Send className="h-7 w-7" />
                    </div>
                    <h2 className="text-3xl font-black text-foreground tracking-tighter">Send Secure Cash</h2>
                    <p className="text-xs font-medium text-muted-foreground mt-2">Transfer funds directly to any Zenda user using their email address.</p>
                </div>

                <form onSubmit={handleSendMoneySubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Recipient Email Address</label>
                    <input 
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="e.g. friend@zenda.com"
                      className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Amount to Transfer (₦)</label>
                    <input 
                      type="number"
                      required
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Notes / Description (Optional)</label>
                    <input 
                      type="text"
                      value={transferDesc}
                      onChange={(e) => setTransferDesc(e.target.value)}
                      placeholder="e.g. Pizza contribution "
                      className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                    />
                  </div>

                  <div className="pt-2 flex gap-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsTransferring(false)}
                      className="flex-1 h-14 rounded-xl border border-border font-bold text-xs uppercase tracking-widest"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={sendMoneyMutation.isPending}
                      className="flex-1 h-14 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
                    >
                      {sendMoneyMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Send Funds'}
                    </Button>
                  </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Add Card Mock overlay */}
      <AnimatePresence>
        {isAddingCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="w-full max-w-md bg-white rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8">
                    <button onClick={() => setIsAddingCard(false)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all">
                        <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>

                <div className="text-center mb-10">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-black text-foreground tracking-tighter">Link Secure Card</h2>
                    <p className="text-sm font-medium text-muted-foreground mt-2">Connecting to Paystack Secure Gateway...</p>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 italic opacity-50">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">Connecting...</span>
                    </div>
                    
                    <Button 
                        className="w-full h-16 rounded-2xl bg-black text-white font-black uppercase tracking-[0.2em] text-xs"
                        onClick={() => {
                            toast.info("Paystack integration is ready for production credentials.");
                            setIsAddingCard(false);
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
