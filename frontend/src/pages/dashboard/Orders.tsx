import { orderService } from '@/services';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, ChevronDown, ChevronUp, ShieldCheck, Key, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import OrderTracking from '@/components/OrderTracking';
import TableSkeleton from '@/components/skeletons/TableSkeleton';
import { toast } from 'sonner';

export default function Orders() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getAll()
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');

  const requestCodeMutation = useMutation({
    mutationFn: (orderId: string) => orderService.requestDeliveryCode(orderId),
    onSuccess: () => {
      toast.success('Delivery code sent to your email!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send code');
    }
  });

  const confirmDeliveryMutation = useMutation({
    mutationFn: ({ orderId, otp }: { orderId: string; otp: string }) => 
      orderService.confirmDelivery(orderId, otp),
    onSuccess: () => {
      toast.success('Delivery confirmed successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setOtp('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Invalid delivery code');
    }
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Purchases</p>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Order History</h1>
        <p className="mt-1 text-muted-foreground font-medium">View and track all your gadgets here.</p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-white shadow-sm p-8">
          <TableSkeleton cols={7} rows={5} />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-5 pl-6">Order ID</th>
                  <th className="py-5">Product</th>
                  <th className="py-5 text-right">Price</th>
                  <th className="py-5 pl-8">Plan</th>
                  <th className="py-5">Date</th>
                  <th className="py-5 pr-6 text-right">Status</th>
                  <th className="py-5 pr-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o: any) => (
                  <React.Fragment key={o.id}>
                    <tr 
                      className={`group cursor-pointer transition-colors ${expandedId === o.id ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                      onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                    >
                      <td className="py-6 pl-6 font-mono text-xs font-bold text-muted-foreground uppercase tracking-widest">{o.id.split('-')[0]}</td>
                      <td className="py-6">
                        <div className="flex items-center gap-3">
                            <p className="font-bold text-foreground tracking-tight">{o.product_name || 'Gadget Order'}</p>
                            {o.status !== 'cancelled' && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 italic">
                                    <ShieldCheck className="h-3 w-3" />
                                    <span className="text-[8px] font-black uppercase">Protected</span>
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="py-6 text-right font-bold text-foreground">{formatCurrency(o.total_amount)}</td>
                      <td className="py-6 pl-8">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border">{o.installment_plan || 'Direct'}</span>
                      </td>
                      <td className="py-6 font-medium text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="py-6 pr-6 text-right">
                        <Badge className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-none border-none ${getStatusColor(o.status)}`}>
                          {o.status}
                        </Badge>
                      </td>
                      <td className="py-6 pr-6 text-right">
                        {expandedId === o.id ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedId === o.id && (
                        <tr>
                          <td colSpan={7} className="p-0 bg-slate-50/50">
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-12 py-12 space-y-12">
                                <div>
                                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-8 border-b border-border pb-4">Track Your Gadget</h3>
                                  <OrderTracking currentStatus={o.status} />
                                </div>

                                {o.status === 'shipped' && (
                                  <div className="rounded-[2.5rem] bg-white border-2 border-primary/10 p-10 shadow-xl shadow-primary/5">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                      <div className="max-w-md">
                                        <div className="flex items-center gap-3 mb-4">
                                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Key className="h-5 w-5" />
                                          </div>
                                          <h4 className="text-xl font-black text-foreground uppercase tracking-tight">Confirm Your Receipt</h4>
                                        </div>
                                        <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                                          Inspect your gadget carefully. If everything is perfect, request a delivery code and share it with the agent to finalize the order.
                                        </p>
                                      </div>

                                      <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                                        <button 
                                          onClick={() => requestCodeMutation.mutate(o.id)}
                                          disabled={requestCodeMutation.isPending}
                                          className="w-full md:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                                        >
                                          {requestCodeMutation.isPending ? 'Sending...' : 'Request Delivery Code'}
                                        </button>
                                        
                                        <div className="flex items-center gap-2 w-full">
                                          <input 
                                            type="text" 
                                            placeholder="ENTER 6-DIGIT CODE" 
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full md:w-48 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-center font-black tracking-[0.3em] text-primary focus:border-primary outline-none transition-all placeholder:tracking-normal placeholder:font-bold placeholder:text-[10px]"
                                          />
                                          <button 
                                            onClick={() => confirmDeliveryMutation.mutate({ orderId: o.id, otp })}
                                            disabled={confirmDeliveryMutation.isPending || otp.length < 6}
                                            className="px-8 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                                          >
                                            {confirmDeliveryMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm'}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {o.status === 'delivered' && (
                                  <div className="rounded-[2.5rem] bg-emerald-50 border-2 border-emerald-100 p-10 flex flex-col items-center text-center">
                                    <div className="h-16 w-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 mb-4">
                                      <CheckCircle2 className="h-8 w-8" />
                                    </div>
                                    <h4 className="text-xl font-black text-emerald-900 uppercase tracking-tight">Gadget Delivered</h4>
                                    <p className="text-sm font-bold text-emerald-600 mt-2">Verified and confirmed on {new Date(o.delivered_at || o.updated_at).toLocaleDateString()}</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50/50 py-24 text-center"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white border border-border shadow-sm">
            <ShoppingBag className="h-10 w-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">No Purchases Found</h2>
          <p className="mt-2 text-muted-foreground max-w-xs mx-auto">Your gadget orders will appear here once you make a purchase.</p>
        </motion.div>
      )}
    </div>
  );
}
