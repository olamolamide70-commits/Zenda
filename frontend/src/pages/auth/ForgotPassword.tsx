import { Link } from 'react-router-dom';
import { Laptop, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Check your email! A password reset link has been dispatched.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-[#0A0F1E] overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -left-1/4 -top-1/4 h-[80%] w-[80%] rounded-full bg-primary/20 blur-[120px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <Link to="/" className="mb-12 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-glow backdrop-blur-md">
            <Laptop className="h-6 w-6 text-primary shadow-glow-sm" />
          </div>
          <span className="font-display text-2xl font-black text-white tracking-tighter">Zenda</span>
        </Link>

        <div className="rounded-[40px] border border-white/5 bg-white/[0.03] p-10 shadow-2xl backdrop-blur-xl">
          <h1 className="text-3xl font-black text-white tracking-tight mb-3">Forgot Password?</h1>
          <p className="text-gray-400 font-medium mb-8 leading-relaxed">Tell us your email and we will send you a link to change your password.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Email Address</Label>
              <Input type="email" placeholder="yourname@gmail.com" className="h-16 px-6 bg-white/5 border-white/10 rounded-2xl text-white focus:ring-accent/50 transition-all font-bold placeholder:text-gray-600" required />
            </div>
            
            <Button type="submit" className="h-18 w-full rounded-2xl bg-white text-xl font-black text-primary transition-all hover:scale-[1.02] hover:bg-gray-100 shadow-2xl">
              Send Reset Link
            </Button>
          </form>

          <Link to="/login" className="mt-8 flex items-center justify-center gap-2 group">
            <ArrowLeft className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Back to Sign In</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
