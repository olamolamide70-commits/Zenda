import { paymentService } from '@/services';
import { formatCurrency } from '@/utils/helpers';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, FileText, Receipt } from 'lucide-react';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export default function Receipts() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentService.getHistory()
  });

  const successPayments = payments?.filter((p: any) => p.status === 'success' || p.status === 'Success') || [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Documents</p>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Receipts</h1>
        <p className="mt-1 text-muted-foreground font-medium">Download and manage your payment documents.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl border border-border bg-white p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          ))}
        </div>
      ) : successPayments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {successPayments.map((p: any, i: number) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex items-center justify-between rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-border transition-colors group-hover:bg-primary/5">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground tracking-tight leading-tight">{p.installments?.order?.product_name || 'Installment Payment'}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>{p.id.split('-')[0]}</span>
                    <span>•</span>
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-primary">{formatCurrency(p.amount)}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
                onClick={() => toast.success('Receipt download started')}
              >
                <Download className="h-5 w-5" />
              </Button>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50/50 py-24 text-center"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white border border-border shadow-sm">
            <Receipt className="h-10 w-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">No Receipts</h2>
          <p className="mt-2 text-muted-foreground max-w-xs mx-auto">Your digital receipts will be available here once payments are completed.</p>
        </motion.div>
      )}
    </div>
  );
}
