import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Zap, ShieldCheck, Wifi, Info, Lock, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import { useState } from 'react';
import { Button } from './ui/button';

export type CardSkin = 'default' | 'obsidian' | 'gold' | 'midnight' | 'glass';

interface VirtualCardProps {
  userName: string;
  creditLimit: number;
  availableLimit: number;
  skin?: CardSkin;
  isActive?: boolean;
}

const SKIN_CONFIGS = {
  default: {
    bg: 'bg-slate-900',
    primary: 'text-primary',
    blur: 'bg-primary/20',
    accent: 'bg-blue-500/10'
  },
  obsidian: {
    bg: 'bg-black',
    primary: 'text-zinc-400',
    blur: 'bg-zinc-800/50',
    accent: 'bg-zinc-900/20'
  },
  gold: {
    bg: 'bg-[#1a140a]',
    primary: 'text-amber-500',
    blur: 'bg-amber-500/20',
    accent: 'bg-yellow-600/10'
  },
  midnight: {
    bg: 'bg-[#0d1117]',
    primary: 'text-indigo-400',
    blur: 'bg-indigo-500/20',
    accent: 'bg-purple-600/10'
  },
  glass: {
    bg: 'bg-white/10 backdrop-blur-md',
    primary: 'text-white',
    blur: 'bg-white/20',
    accent: 'bg-white/5',
    border: 'border-white/20 text-white'
  }
};

export default function VirtualCard({ userName, creditLimit, availableLimit, skin = 'default', isActive = false }: VirtualCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const config = SKIN_CONFIGS[skin] || SKIN_CONFIGS.default;

  const toggleFlip = (e: React.MouseEvent) => {
    if (!isActive) return;
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const toggleNumbers = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNumbers(!showNumbers);
  };

  return (
    <div className="relative group perspective-2000 w-full max-w-[420px]">
      {/* 3D Flip Container */}
      <motion.div 
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 260, damping: 20 }}
        className={`relative w-full aspect-[1.58/1] preserve-3d ${isActive ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={toggleFlip}
      >
        {/* FRONT SIDE */}
        <div className={`absolute inset-0 backface-hidden rounded-[2.5rem] ${config.bg} border border-white/10 p-10 text-white shadow-2xl overflow-hidden`}>
            {/* Dynamic Background Gradients */}
            <div className={`absolute top-0 right-0 w-80 h-80 ${config.blur} blur-[100px] rounded-full -mr-40 -mt-40 animate-pulse`} />
            <div className={`absolute bottom-0 left-0 w-64 h-64 ${config.accent} blur-[80px] rounded-full -ml-32 -mb-32`} />
            
            <div className={`relative z-10 h-full flex flex-col justify-between transition-all duration-500 ${!isActive ? 'blur-md opacity-40 grayscale' : ''}`}>
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className={`h-5 w-5 ${config.primary}`} />
                            <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${skin === 'glass' ? 'text-white' : 'text-white/50'}`}>Zenda {skin !== 'default' ? skin.toUpperCase() : 'PREMIUM'}</span>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 mt-1 uppercase tracking-widest">Exclusive Installment Line</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Wifi className="h-4 w-4 text-white/20 rotate-90" />
                        <div className="h-10 w-14 bg-gradient-to-br from-zinc-300 to-zinc-500 rounded-lg shadow-inner flex items-center justify-center border border-white/10 overflow-hidden">
                            <div className="w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,black_2px,black_4px)]" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="text-2xl font-mono tracking-[0.25em] text-white opacity-90 drop-shadow-md">
                            {isActive ? (
                                <>4532 <span className="text-white/20 text-lg">••••</span> <span className="text-white/20 text-lg">••••</span> 8821</>
                            ) : (
                                <><span className="text-white/20">•••• •••• •••• ••••</span></>
                            )}
                        </p>
                        {isActive && (
                            <button 
                                onClick={toggleNumbers}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                {showNumbers ? <EyeOff className="h-4 w-4 text-white/40" /> : <Eye className="h-4 w-4 text-white/40" />}
                            </button>
                        )}
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Card Holder</p>
                            <p className="text-sm font-black uppercase tracking-widest text-white">{userName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Credit Limit</p>
                            <p className={`text-xl font-black ${skin === 'glass' ? 'text-white' : 'text-primary'}`}>
                                {isActive ? formatCurrency(creditLimit) : '₦0'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inactive Overlay */}
            {!isActive && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 animate-bounce">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white drop-shadow-lg">Card Not Activated</p>
                </div>
            )}

            {/* Premium Shine Effect */}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 pointer-events-none" />
            )}
            
            {/* Flip Indicator */}
            {isActive && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-40 transition-opacity">
                    <div className="w-1 h-1 rounded-full bg-white" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Click to view back</span>
                </div>
            )}
        </div>

        {/* BACK SIDE */}
        <div 
          className={`absolute inset-0 backface-hidden rounded-[2.5rem] ${config.bg} border border-white/10 p-0 text-white shadow-2xl overflow-hidden`}
          style={{ transform: 'rotateY(180deg)' }}
        >
            <div className="h-full flex flex-col pt-8">
                {/* Magnetic Stripe */}
                <div className="w-full h-14 bg-black/80 mb-8" />
                
                <div className="px-10 flex-1 flex flex-col justify-between pb-10">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 mr-8">
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-2">Authorized Signature</p>
                            <div className="w-full h-10 bg-white/10 rounded flex items-center px-4 overflow-hidden italic font-serif text-white/60">
                                {userName}
                            </div>
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-2 text-right">CVV</p>
                            <div className="h-10 w-16 bg-white/20 rounded flex items-center justify-center font-mono font-bold text-lg tracking-widest">
                                482
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/5 pt-8">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Customer Service</p>
                            <p className="text-[10px] font-bold">+234 800 GADGET</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Expiry Date</p>
                            <p className="text-[10px] font-bold">12 / 28</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="h-2 w-full bg-primary/20" />
            </div>
        </div>
      </motion.div>

      {/* Available Balance Box */}
      <div className="mt-8 flex items-center justify-between p-8 rounded-[2rem] bg-white border border-border shadow-sm group-hover:shadow-md transition-all">
        <div className="flex items-center gap-5">
          <div className={`h-14 w-14 rounded-2xl ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'} flex items-center justify-center`}>
            <Zap className={`h-7 w-7 ${isActive ? 'fill-primary' : ''}`} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Available Spending Power</p>
            <p className={`text-2xl font-black tracking-tight ${isActive ? 'text-foreground' : 'text-slate-300'}`}>
                {isActive ? formatCurrency(availableLimit) : '₦0'}
            </p>
          </div>
        </div>
        <div className="h-3 w-40 bg-slate-100 rounded-full overflow-hidden border border-border p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: isActive ? `${(availableLimit / creditLimit) * 100}%` : 0 }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className={`h-full ${isActive ? 'bg-primary' : 'bg-slate-200'} rounded-full`}
          />
        </div>
      </div>
    </div>
  );
}
