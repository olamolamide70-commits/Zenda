import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Laptop, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services';
import { useApp } from '@/context/AppContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();
  const { login } = useApp();

  useEffect(() => {
    if (!email) navigate('/login');
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return toast.error('Please enter the full 6-digit code');

    setIsLoading(true);
    try {
      const res = await authService.verifyOTP(email, otpString, name);
      login(res, res.token);
      toast.success('Account verified! Welcome to Zenda.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      const res = await authService.resendOTP(email);
      console.log('--- [DEV MODE] RESENT OTP INSPECTION ---');
      console.log('Resend Response:', res);
      console.log('----------------------------------------');
      toast.success('A new code has been sent to your email');
      setTimer(60);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-border p-10 rounded-2xl shadow-sm"
      >
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-success/10 border border-success/20">
            <ShieldCheck className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">Verify Your Email</h1>
          <p className="text-muted-foreground font-medium">We sent a 6-digit code to <br /><span className="text-foreground font-bold">{email}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="flex justify-between gap-1">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-secondary/20 border-2 border-border rounded-xl text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                required
              />
            ))}
          </div>

          <Button 
            disabled={isLoading}
            className="w-full h-14 rounded-xl bg-primary text-lg font-bold text-white hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-md"
          >
            {isLoading ? <RefreshCw className="h-6 w-6 animate-spin" /> : (
              <>
                Confirm Verification
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Didn't receive the code?
          </p>
          <button 
            onClick={handleResend}
            disabled={timer > 0 || resending}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${timer > 0 || resending ? 'text-slate-500 cursor-not-allowed' : 'text-primary hover:text-primary/80 underline decoration-2 underline-offset-8'}`}
          >
            {resending ? 'Sending...' : timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code Now'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
