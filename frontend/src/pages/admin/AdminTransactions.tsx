import { useQuery } from '@tanstack/react-query';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowDownLeft, ArrowUpRight, Search, Receipt } from 'lucide-react';
import { useState } from 'react';
import api from '@/services/api';

export default function AdminTransactions() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => api.get('/transactions/all').then(r => r.data).catch(() => api.get('/transactions/history').then(r => r.data)),
  });

  const txList = Array.isArray(transactions) ? transactions : [];

  const filtered = txList.filter((t: any) => {
    const matchSearch = !search ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.id?.toLowerCase().includes(search.toLowerCase()) ||
      t.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter || t.transaction_type === typeFilter;
    return matchSearch && matchType;
  });

  const totalVolume = filtered.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Ledger</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Global Transactions</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {filtered.length} transactions · Volume: <span className="text-primary font-bold">{formatCurrency(totalVolume)}</span>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: formatCurrency(totalVolume), icon: Receipt, color: 'bg-primary/10 text-primary' },
          { label: 'Transactions', value: filtered.length, icon: ArrowDownLeft, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending', value: txList.filter((t: any) => t.status === 'pending').length, icon: ArrowUpRight, color: 'bg-amber-50 text-amber-600' },
          { label: 'Completed', value: txList.filter((t: any) => t.status === 'completed' || t.status === 'success').length, icon: ArrowDownLeft, color: 'bg-blue-50 text-blue-600' },
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
            placeholder="Search by description, ID, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'payment', 'installment', 'refund', 'transfer'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`h-12 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                typeFilter === t ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted-foreground hover:bg-slate-50'
              }`}
            >
              {t}
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
                  <th className="py-5 pl-8">Reference</th>
                  <th className="py-5">Description</th>
                  <th className="py-5">User</th>
                  <th className="py-5">Type</th>
                  <th className="py-5">Settlement</th>
                  <th className="py-5">Timestamp</th>
                  <th className="py-5 pr-8 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted-foreground font-medium">
                      No transactions found.
                    </td>
                  </tr>
                ) : filtered.map((t: any) => (
                  <tr key={t.id} className="group transition-colors hover:bg-slate-50">
                    <td className="py-6 pl-8 font-mono text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                      {t.id?.split('-')[0] || t.reference}
                    </td>
                    <td className="py-6 font-bold text-foreground max-w-[200px] truncate">
                      {t.description || t.product_name || 'Transaction'}
                    </td>
                    <td className="py-6 text-sm text-muted-foreground font-medium">{t.user_email || t.user_name || '—'}</td>
                    <td className="py-6">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                        {t.type === 'payment' || t.transaction_type === 'payment' ? (
                          <ArrowDownLeft className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3 text-red-400" />
                        )}
                        {t.type || t.transaction_type || 'Payment'}
                      </span>
                    </td>
                    <td className="py-6 font-bold text-primary">{formatCurrency(t.amount)}</td>
                    <td className="py-6 text-muted-foreground text-sm">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : t.date || '—'}
                    </td>
                    <td className="py-6 pr-8 text-right">
                      <Badge className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-none border-none ${getStatusColor(t.status)}`}>
                        {t.status || 'completed'}
                      </Badge>
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
