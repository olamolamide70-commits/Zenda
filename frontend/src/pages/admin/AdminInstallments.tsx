import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { installmentService } from '@/services';
import { Loader2, CreditCard, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '@/services/api';

export default function AdminInstallments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['admin-installments'],
    queryFn: () => api.get('/installments/all').then(r => r.data).catch(() => installmentService.getAll().then(r => r.data)),
  });

  const installments = Array.isArray(rawData) ? rawData : [];

  const filtered = installments.filter((i: any) => {
    const matchSearch = !search ||
      i.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.id?.toLowerCase().includes(search.toLowerCase()) ||
      i.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalBalance = filtered.reduce((sum: number, i: any) => sum + parseFloat(i.remaining_balance || 0), 0);
  const totalCollected = filtered.reduce((sum: number, i: any) => {
    const paid = parseFloat(i.order_total || 0) - parseFloat(i.remaining_balance || 0);
    return sum + paid;
  }, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Financials</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Installment Records</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">{filtered.length} active plans</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Plans', value: filtered.length, icon: CreditCard, color: 'bg-primary/10 text-primary' },
          { label: 'Amount Collected', value: formatCurrency(totalCollected), icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Outstanding Balance', value: formatCurrency(totalBalance), icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
          { label: 'Active', value: installments.filter((i: any) => i.status === 'active').length, icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
        ].map(card => (
          <div key={card.label} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className={`h-10 w-10 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-foreground tracking-tight">{card.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <input
            type="text"
            placeholder="Search by product, user, or plan ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'completed', 'defaulted', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-12 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted-foreground hover:bg-slate-50'
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
      ) : (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-5 pl-8">Plan ID</th>
                  <th className="py-5">Product</th>
                  <th className="py-5">User</th>
                  <th className="py-5">Total</th>
                  <th className="py-5">Paid</th>
                  <th className="py-5">Balance</th>
                  <th className="py-5 pr-8">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted-foreground font-medium">
                      No installment plans found.
                    </td>
                  </tr>
                ) : filtered.map((i: any) => {
                  const paid = parseFloat(i.order_total || 0) - parseFloat(i.remaining_balance || 0);
                  const progress = i.order_total > 0 ? Math.round((paid / parseFloat(i.order_total)) * 100) : 0;
                  return (
                    <tr key={i.id} className="group transition-colors hover:bg-slate-50">
                      <td className="py-6 pl-8 font-mono text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                        {i.id?.split('-')[0]}
                      </td>
                      <td className="py-6 font-bold text-foreground">{i.product_name || 'Product'}</td>
                      <td className="py-6 text-sm text-muted-foreground font-medium">{i.user_name || i.user_email || '—'}</td>
                      <td className="py-6 font-bold text-foreground">{formatCurrency(i.order_total)}</td>
                      <td className="py-6 font-bold text-emerald-600">{formatCurrency(paid)}</td>
                      <td className="py-6 font-bold text-amber-600">{formatCurrency(i.remaining_balance)}</td>
                      <td className="py-6 pr-8">
                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                            <span>{progress}%</span>
                            <Badge className={`rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-widest shadow-none border-none ${getStatusColor(i.status)}`}>
                              {i.status}
                            </Badge>
                          </div>
                          <Progress value={progress} className="h-2 bg-slate-100" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
