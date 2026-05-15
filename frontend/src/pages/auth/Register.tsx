import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Laptop } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { authService } from '@/services';
import { toast } from "react-toastify";

import { motion } from 'framer-motion';

export default function Register() {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = `${firstName} ${lastName}`;

    try {
      await authService.register({ name, email, password });
      toast.success('Account created! Please login with your credentials.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div className="flex min-h-screen bg-background overflow-hidden font-sans">
      {/* Left Side: Cinematic Branding (Consistent with Login) */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center lg:flex border-r border-border bg-slate-50">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-gadgets.png" 
            alt="Zenda Gadgets" 
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/20" />
        </div>

        <div className="relative z-10 max-w-lg text-center p-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white border border-border shadow-xl"
          >
            <Laptop className="h-12 w-12 text-primary" />
          </motion.div>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl font-black mb-6 text-foreground tracking-tight leading-[1.1]"
          >
            Get <br />
            <span className="text-primary italic">Started</span>
          </motion.h2>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-muted-foreground font-medium leading-relaxed"
          >
            Join thousands of Nigerians getting gadgets they love with easy monthly payments.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-12 flex gap-12"
        >
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">Fast</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Approval</p>
          </div>
          <div className="h-10 w-px bg-border self-center" />
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">Easy</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Payments</p>
          </div>
          <div className="h-10 w-px bg-border self-center" />
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">Real</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Gadgets</p>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Register Form */}
      <div className="relative flex flex-1 items-center justify-center p-8 bg-background overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[520px] bg-white border border-border p-10 lg:p-12 rounded-2xl shadow-sm my-8"
        >
          {/* Mobile Logo */}
          <Link to="/" className="mb-12 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <Laptop className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black text-foreground">Zenda</span>
          </Link>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">Sign up</h1>
            <p className="text-muted-foreground font-medium">Create your account and verify your email via secure code.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
                <Input name="firstName" placeholder="First Name" className="h-12 px-4 bg-secondary/20 border-border rounded-xl focus:ring-primary/20 transition-all font-medium" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
                <Input name="lastName" placeholder="Last Name" className="h-12 px-4 bg-secondary/20 border-border rounded-xl focus:ring-primary/20 transition-all font-medium" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <Input name="email" type="email" placeholder="email@example.com" className="h-12 px-4 bg-secondary/20 border-border rounded-xl focus:ring-primary/20 transition-all font-medium" required />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
              <Input name="password" type="password" placeholder="••••••••" className="h-12 px-4 bg-secondary/20 border-border rounded-xl focus:ring-primary/20 transition-all font-medium" required />
            </div>
            
            <div className="flex items-center px-1">
              <label className="flex items-start gap-3 group cursor-pointer">
                <div className="relative flex h-5 w-5 mt-0.5 items-center justify-center rounded-md border-2 border-border bg-secondary/20 transition-all group-hover:border-primary/50">
                  <input type="checkbox" className="peer absolute opacity-0" required />
                  <div className="h-2 w-2 rounded-[2px] bg-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">I agree to the <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></span>
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit" className="h-14 w-full rounded-xl bg-primary text-lg font-bold text-white transition-all hover:bg-primary/90 shadow-md">
                Sign up
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Already have an account? <Link to="/login" className="ml-1 text-primary hover:text-primary/80 transition-colors font-bold underline underline-offset-4">Login</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
