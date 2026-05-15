import { Link } from "react-router-dom";
import { Laptop } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services";
import { toast } from "react-toastify";
import { useState } from "react";

import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();

  const { login: contextLogin } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await authService.login({ email, password });
      contextLogin(response.user, response.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed.");
    }
  };

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Left Side: Cinematic Branding */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center lg:flex border-r border-border bg-slate-50">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-gadgets.png" 
            alt="Zenda Tech" 
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/20" />
        </div>

        <div className="relative z-10 max-w-lg text-center p-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
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
            Get your gadgets. <br />
            <span className="text-primary italic">Pay in bits.</span>
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-muted-foreground font-medium leading-relaxed"
          >
            Smarter gadgets for every Nigerian. <br />
            Pay monthly with zero hidden fees.
          </motion.p>
        </div>

        {/* Floating Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-16 flex gap-12"
        >
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">10K+</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Active Users
            </p>
          </div>
          <div className="h-10 w-px bg-border self-center" />
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">100%</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Secure
            </p>
          </div>
          <div className="h-10 w-px bg-border self-center" />
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">₦0</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Hidden Fees
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Login Form */}
      <div className="relative flex flex-1 items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px] bg-white border border-border p-10 lg:p-12 rounded-2xl shadow-sm"
        >
          {/* Mobile Logo */}
          <Link
            to="/"
            className="mb-10 flex items-center justify-center gap-3 lg:hidden"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <Laptop className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black text-foreground">
              Zenda
            </span>
          </Link>

            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">
                Welcome back
              </h1>
              <p className="text-muted-foreground font-medium">
                Enter your credentials to access your Zenda dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Email Address
                </Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="yourname@gmail.com"
                  className="h-12 px-4 bg-secondary/20 border-border rounded-xl focus:ring-primary/20 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Password
                  </Label>
                  <Link to="/forgot-password" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                    Forgot?
                  </Link>
                </div>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 px-4 bg-secondary/20 border-border rounded-xl focus:ring-primary/20 transition-all font-medium"
                  required
                />
              </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="h-14 w-full rounded-xl bg-primary text-lg font-bold text-white transition-all hover:bg-primary/90 shadow-md"
              >
                Login
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="ml-1 text-primary hover:text-primary/80 transition-colors font-bold underline underline-offset-4 decoration-primary/30"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
