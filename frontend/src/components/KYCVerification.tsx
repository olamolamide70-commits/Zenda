import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Upload, CheckCircle, AlertCircle, Fingerprint, Building2, ArrowRight, ArrowLeft, Camera, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/services/api';
import { AppContext } from '@/context/AppContext';

export default function KYCVerification() {
  const { user, refreshUser } = useContext(AppContext);
  const [step, setStep] = useState(0); // 0: Intro, 1: ID Type, 2: NIN/BVN, 3: Upload, 4: Processing
  const [docType, setDocType] = useState('NIN');
  const [isUploading, setIsUploading] = useState(false);
  const [kycStatus, setKycStatus] = useState(user?.kyc_status || 'unverified');

  const [nin, setNin] = useState('');
  const [bvn, setBvn] = useState('');
  const [cacNumber, setCacNumber] = useState('');

  // Polling for status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (kycStatus === 'pending') {
      setStep(4); // Ensure we are on processing step
      interval = setInterval(async () => {
        try {
          const { data } = await api.get('/kyc/status');
          if (data.status !== 'pending') {
            setKycStatus(data.status);
            refreshUser();
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Polling failed:', error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [kycStatus]);

  const steps = [
    { title: "Let's Verify Your Identity", desc: "Unlock higher limits & better rates." },
    { title: "Choose ID Type", desc: "Select the document you have ready." },
    { title: "The Essentials", desc: "We need your NIN and BVN for verification." },
    { title: "Snapshot Time", desc: "Upload a clear photo of your ID." },
    { title: "Checking Details", desc: "Our AI is verifying your data..." }
  ];

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!nin || nin.length !== 11) return toast.error('Valid 11-digit NIN required');
    if (!bvn || bvn.length !== 11) return toast.error('Valid 11-digit BVN required');

    setIsUploading(true);
    try {
      await api.post('/kyc/submit', {
        documentType: docType,
        documentUrl: 'https://placeholder.com/id.jpg',
        nin,
        bvn,
        cacNumber: (user?.role === 'merchant' || user?.role === 'merchant') ? cacNumber : undefined
      });
      setKycStatus('pending');
      toast.success('Verification started!');
    } catch (error) {
      toast.error('Submission failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto min-h-[600px] flex flex-col justify-between p-12 bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden glass-grain glow-border">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 flex gap-1 px-1 pt-1">
        {steps.map((_, i) => (
          <div key={i} className="flex-1 h-full rounded-full bg-slate-100 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: step >= i ? '100%' : '0%' }}
              className="h-full bg-primary"
            />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="flex-1 flex flex-col justify-center"
        >
          {/* Step Icon */}
          <div className="mb-8 flex justify-center">
             <div className="h-24 w-24 rounded-[2.5rem] bg-primary/5 flex items-center justify-center text-primary glow-border">
                {step === 0 && <Shield className="h-10 w-10" />}
                {step === 1 && <FileText className="h-10 w-10" />}
                {step === 2 && <Fingerprint className="h-10 w-10" />}
                {step === 3 && <Camera className="h-10 w-10" />}
                {step === 4 && <Smartphone className="h-10 w-10 animate-bounce-slow" />}
             </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-foreground tracking-tighter mb-4">{steps[step].title}</h2>
            <p className="text-muted-foreground font-medium text-lg">{steps[step].desc}</p>
          </div>

          {/* Step Specific Content */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-3 gap-4">
                {['NIN', 'Passport', 'Voter Card'].map(t => (
                  <button 
                    key={t}
                    onClick={() => { setDocType(t); nextStep(); }}
                    className={`h-24 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${docType === t ? 'border-primary bg-primary/5 text-primary scale-105 shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                  >
                    <div className="text-xs font-black uppercase tracking-widest">{t}</div>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4">
                <div className="space-y-2">
                   <Label className="ml-4 text-[10px] font-black uppercase tracking-widest text-primary/40">National ID Number</Label>
                   <Input 
                    value={nin} 
                    onChange={e => setNin(e.target.value)} 
                    placeholder="11-digit NIN"
                    className="h-16 px-8 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl"
                   />
                </div>
                <div className="space-y-2">
                   <Label className="ml-4 text-[10px] font-black uppercase tracking-widest text-primary/40">Bank Verification Number</Label>
                   <Input 
                    value={bvn} 
                    onChange={e => setBvn(e.target.value)} 
                    placeholder="11-digit BVN"
                    className="h-16 px-8 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-xl"
                   />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4">
                <div className="h-48 rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center group hover:bg-slate-50 hover:border-primary/20 transition-all cursor-pointer">
                   <Upload className="h-10 w-10 text-slate-200 mb-2 group-hover:text-primary transition-colors" />
                   <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Select ID Photo</p>
                </div>
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-blue-50 text-blue-600">
                  <Shield className="h-4 w-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Your data is encrypted & secure</p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8">
                {kycStatus === 'pending' && (
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-full max-w-[200px] bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="h-full w-full bg-primary"
                      />
                    </div>
                    <p className="mt-4 text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Checking Government Database...</p>
                  </div>
                )}

                {kycStatus === 'verified' && (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center space-y-6">
                    <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20">
                      <CheckCircle className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground">You're All Set!</h3>
                    <Button onClick={() => window.location.href = '/dashboard'} className="btn-elite w-full h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600">Go to Dashboard</Button>
                  </motion.div>
                )}

                {kycStatus === 'rejected' && (
                   <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center space-y-6">
                    <div className="mx-auto h-20 w-20 rounded-full bg-destructive text-white flex items-center justify-center shadow-xl shadow-destructive/20">
                      <AlertCircle className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground">Verification Failed</h3>
                    <p className="text-muted-foreground font-medium">We couldn't verify your details. Please check your NIN/BVN and try again.</p>
                    <Button onClick={() => setStep(2)} className="btn-elite w-full h-16 rounded-2xl">Try Again</Button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Footer Navigation */}
      {step < 4 && (
        <div className="mt-12 flex gap-4">
          {step > 0 && (
            <Button 
              variant="ghost" 
              onClick={prevStep}
              className="h-16 px-8 rounded-2xl text-slate-400 font-black uppercase tracking-widest gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          <Button 
            onClick={step === 3 ? handleSubmit : nextStep}
            disabled={isUploading}
            className="flex-1 h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 group"
          >
            {step === 0 ? 'Start Now' : step === 3 ? (isUploading ? 'Verifying...' : 'Finish') : 'Continue'}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      )}
    </div>
  );
}

