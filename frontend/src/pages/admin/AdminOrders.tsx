import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { orderService } from '@/services';
import { Loader2, Package, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '@/services/api';

const STATUS_OPTIONS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders/all').then(r => r.data).catch(() => orderService.getAll()),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/orders/${id}/status`, { status }).then(r => r.data),
    onSuccess: () => {
      toast.success('Order status updated!');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const filtered = (Array.isArray(orders) ? orders : []).filter((o: any) => {
    const matchSearch = !search || o.product_name?.toLowerCase().includes(search.toLowerCase()) || o.id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Commerce</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Order Management</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">{filtered.length} orders found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search orders or products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-12 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                statusFilter === s
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white border-border text-muted-foreground hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50/50 py-24 text-center">
          <Package className="h-12 w-12 text-slate-500 mb-4" />
          <h3 className="font-black text-foreground uppercase tracking-widest text-xs">No Orders Found</h3>
          <p className="text-sm font-medium text-muted-foreground mt-2">No orders match your current filters.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-5 pl-8">Order ID</th>
                  <th className="py-5">Product</th>
                  <th className="py-5">Customer</th>
                  <th className="py-5">Amount</th>
                  <th className="py-5">Plan</th>
                  <th className="py-5">Date</th>
                  <th className="py-5 pr-8 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((o: any) => (
                  <tr key={o.id} className="group transition-colors hover:bg-slate-50">
                    <td className="py-6 pl-8 font-mono text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                      {o.id?.split('-')[0]}
                    </td>
                    <td className="py-6 font-bold text-foreground">{o.product_name || 'Gadget Order'}</td>
                    <td className="py-6 text-sm text-muted-foreground font-medium">{o.user_name || o.user_email || '—'}</td>
                    <td className="py-6 font-bold text-primary">{formatCurrency(o.total_amount)}</td>
                    <td className="py-6 text-muted-foreground font-medium italic text-sm">{o.installment_plan || 'Direct'}</td>
                    <td className="py-6 text-muted-foreground text-sm">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-6 pr-8 text-right">
                      <select
                        value={o.status}
                        onChange={e => updateStatusMutation.mutate({ id: o.id, status: e.target.value })}
                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border-none cursor-pointer focus:outline-none ${getStatusColor(o.status)}`}
                      >
                        {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
