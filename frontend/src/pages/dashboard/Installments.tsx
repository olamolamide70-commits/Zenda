import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/helpers';
import { CalendarDays, ShieldCheck, Zap, AlertCircle, Banknote, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { installmentService } from '@/services';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import api from '@/services/api';

export default function Installments() {
  const { data: installments, isLoading, refetch } = useQuery({
    queryKey: ['userInstallments'],
    queryFn: () => installmentService.getAll().then(res => res.data || [])
  });
  const { user } = useApp();

  const [payingId, setPayingId] = useState<string | null>(null);

  const handleEnableAutoDebit = async (inst: any) => {
    try {
      const { data } = await installmentService.autoDebit({
        installmentId: inst.id,
        email: user?.email || 'user@example.com',
        amount: inst.monthly_amount || (inst.remaining_balance / inst.total_installments)
      });
      window.location.href = data.authorization_url;
    } catch (error) {
      toast.error("Couldn't set up auto-pay");
    }
  };

  const handleMakePayment = async (inst: any) => {
    try {
      setPayingId(inst.id);
      const amount = inst.monthly_amount || Math.ceil(inst.remaining_balance / (inst.total_installments || 1));
      const { data } = await api.post('/installments/pay-now', {
        installmentId: inst.id,
        amount,
        email: user?.email,
      });
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        toast.success('Payment initiated successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">My Payments</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Payment Plans</h1>
          <p className="mt-1 text-muted-foreground font-medium">View and manage all your gadget payments here.</p>
        </div>
        {!isLoading && (
          <div className="inline-flex h-10 items-center justify-center rounded-full bg-primary/10 px-4 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 shadow-sm">
            {installments?.length || 0} Plans
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-white p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="grid grid-cols-4 gap-0 rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-r border-border"><Skeleton className="h-8 w-full" /></div>
                <div className="p-4 border-r border-border"><Skeleton className="h-8 w-full" /></div>
                <div className="p-4 border-r border-border"><Skeleton className="h-8 w-full" /></div>
                <div className="p-4"><Skeleton className="h-8 w-full" /></div>
              </div>
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2">
            {installments?.map((inst: any, i: number) => {
              const monthlyAmount = inst.monthly_amount || Math.ceil(inst.remaining_balance / (inst.total_installments || 1));
              const amountPaid = parseFloat(inst.order_total) - parseFloat(inst.remaining_balance);
              const progress = Math.round((amountPaid / parseFloat(inst.order_total)) * 100);

              return (
                <motion.div 
                  key={inst.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-white p-8 shadow-sm transition-all hover:shadow-md group relative overflow-hidden"
                >
                  {inst.auto_debit_active && (
                    <div className="absolute top-0 right-0 bg-blue-50 text-primary px-6 py-2 rounded-bl-3xl border-b border-l border-blue-100 flex items-center gap-2">
                      <Zap className="h-4 w-4 fill-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Auto-pay is on</span>
                    </div>
                  )}

                  {new Date(inst.next_payment_date) < new Date() && inst.status !== 'completed' && (
                    <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Account Overdue</span>
                    </div>
                  )}

                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <p className="text-2xl font-black text-foreground tracking-tight">{inst.product_name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">ID: {inst.id.split('-')[0]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary tracking-tighter">
                        {formatCurrency(monthlyAmount)}
                        <span className="text-xs font-bold text-muted-foreground tracking-normal"> /mo</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      <span>Progress</span>
                      <span className="text-foreground">{progress}%</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-border shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 + i * 0.1 }}
                        className="absolute inset-y-0 left-0 bg-primary shadow-sm" 
                      />
                    </div>
                  </div>
      
                  <div className="mb-8 grid grid-cols-4 gap-0 overflow-hidden rounded-xl border border-border bg-slate-50/50">
                    <div className="p-4 text-center border-r border-border">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(inst.order_total)}</p>
                    </div>
                    <div className="p-4 text-center border-r border-border bg-green-50/20">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1">Paid</p>
                      <p className="text-sm font-bold text-green-600">{formatCurrency(amountPaid)}</p>
                    </div>
                    <div className="p-4 text-center border-r border-border bg-red-50/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">Late Fees</p>
                      <p className="text-sm font-bold text-red-500">{formatCurrency(inst.late_fees_accrued || 0)}</p>
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Balance</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(inst.remaining_balance)}</p>
                    </div>
                  </div>
      
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-border px-4 py-3 text-sm font-bold text-muted-foreground">
                      <CalendarDays className="h-5 w-5 text-primary" /> 
                      <span>Next due date: <span className="text-foreground">{new Date(inst.next_payment_date).toLocaleDateString()}</span></span>
                    </div>

                    {!inst.auto_debit_active ? (
                      <Button 
                        onClick={() => handleEnableAutoDebit(inst)}
                        variant="outline" 
                        className="w-full h-12 rounded-xl border-primary text-primary hover:bg-primary hover:text-white transition-all font-bold text-sm gap-2"
                      >
                        <ShieldCheck className="h-5 w-5" />
                        Turn on auto-pay
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        disabled 
                        className="w-full h-12 rounded-xl border border-border text-slate-500 font-bold text-sm gap-2 cursor-not-allowed"
                      >
                        <Zap className="h-5 w-5 fill-primary" />
                        Auto-pay is on
                      </Button>
                    )}

                    {/* Make Payment Now — always show */}
                    {inst.status !== 'completed' && (
                      <Button
                        onClick={() => handleMakePayment(inst)}
                        disabled={payingId === inst.id}
                        className="w-full h-14 rounded-xl bg-primary text-white font-bold text-sm gap-2 shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
                      >
                        {payingId === inst.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Banknote className="h-5 w-5" />
                            Pay {formatCurrency(inst.monthly_amount || Math.ceil(inst.remaining_balance / (inst.total_installments || 1)))} Now
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {(!installments || installments.length === 0) && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50/50 py-24 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white border border-border shadow-sm">
                <AlertCircle className="h-10 w-10 text-slate-500" />
              </div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">No Active Plans</h2>
              <p className="mt-2 text-muted-foreground max-w-xs mx-auto">You don't have any active gadget payments yet.</p>
              <Link to="/marketplace" className="mt-8">
                <Button className="h-14 px-10 rounded-xl bg-primary text-white font-bold shadow-md">Go to shop</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`inline-flex items-center justify-center ${className}`}>{children}</div>;
}
