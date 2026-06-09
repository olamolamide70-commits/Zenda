import { paymentService } from '@/services';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { ReceiptText } from 'lucide-react';
import { motion } from 'framer-motion';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

export default function Payments() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentService.getHistory()
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Records</p>
        <h1 className="text-4xl font-black text-foreground tracking-tight">History</h1>
        <p className="mt-1 text-muted-foreground font-medium">View all your past payments here.</p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-white shadow-sm p-8">
          <TableSkeleton cols={5} rows={5} />
        </div>
      ) : payments && payments.length > 0 ? (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-5 pl-6">ID</th>
                  <th className="py-5">Product</th>
                  <th className="py-5 text-right">Amount</th>
                  <th className="py-5 pl-12 text-center">Date</th>
                  <th className="py-5 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p: any) => (
                  <tr key={p.id} className="group transition-colors hover:bg-slate-50">
                    <td className="py-6 pl-6 font-mono text-xs font-bold text-muted-foreground uppercase tracking-widest">{p.id.split('-')[0]}</td>
                    <td className="py-6">
                      <p className="font-bold text-foreground tracking-tight">{p.installments?.order?.product_name || 'Installment Payment'}</p>
                    </td>
                    <td className="py-6 text-right font-bold text-primary">{formatCurrency(p.amount)}</td>
                    <td className="py-6 pl-12 text-center font-medium text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="py-6 pr-6 text-right">
                      <Badge className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-none border-none ${getStatusColor(p.status)}`}>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50/50 py-24 text-center"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white border border-border shadow-sm">
            <ReceiptText className="h-10 w-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">No history</h2>
          <p className="mt-2 text-muted-foreground max-w-xs mx-auto">Your payment history will show up here once you start paying.</p>
        </motion.div>
      )}
    </div>
  );
}
