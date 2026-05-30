import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  BarChart3,
  Plus,
  Loader2,
  Terminal
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from '@/utils/helpers';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function VendorDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['vendorStats'],
    queryFn: () => api.get('/vendor/stats').then(res => res.data)
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['vendorSalesHistory'],
    queryFn: () => api.get('/vendor/sales-history').then(res => res.data)
  });

  const handleRequestPayout = async () => {
    const amount = stats?.escrowBalance || 0;
    if (amount <= 0) return toast.error('No settled funds available for withdrawal.');

    try {
      const { data } = await api.post('/vendor/withdraw', { amount });
      toast.success(data.message || 'Payout initiated!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Payout failed');
    }
  };

  if (statsLoading || historyLoading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium">Loading store insights...</p>
    </div>
  );

  const cards = [
    { 
      label: 'Total Revenue', 
      value: formatCurrency(stats?.totalRevenue || 0), 
      icon: TrendingUp, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      trend: '+12.5%'
    },
    { 
      label: 'Settled Balance', 
      value: formatCurrency(stats?.escrowBalance || 0), 
      icon: Wallet, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      sub: 'Available now'
    },
    { 
      label: 'Active Products', 
      value: stats?.productCount || 0, 
      icon: Package, 
      color: 'text-primary', 
      bg: 'bg-primary/10'
    },
    { 
      label: 'In Escrow', 
      value: formatCurrency(stats?.pendingPayout || 0), 
      icon: Clock, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10',
      sub: '48h Hold'
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Vendor Portal</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Business Insights</h1>
          <p className="mt-1 text-muted-foreground font-medium">Track your performance and manage your payouts.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard/api">
            <Button variant="outline" className="h-14 px-8 rounded-xl border-slate-200 bg-white font-bold transition-all gap-2">
              <Terminal className="h-5 w-5 text-primary" /> API Settings
            </Button>
          </Link>
          <Button className="h-14 px-10 rounded-xl bg-primary text-white font-bold shadow-md hover:shadow-lg transition-all gap-2">
            <Plus className="h-5 w-5" /> Add New Gadget
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-3xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              {card.trend && (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">
                  <ArrowUpRight className="h-3 w-3" /> {card.trend}
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{card.label}</p>
            <p className="text-2xl font-black text-foreground">{card.value}</p>
            {card.sub && <p className="text-[10px] font-bold text-orange-500 uppercase mt-2">{card.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Sales Performance */}
        <div className="rounded-[2.5rem] border border-border bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Sales Performance
            </h3>
            <select className="bg-slate-50 border-none rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 py-2">
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history || []}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  tickFormatter={(val) => `₦${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="var(--primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payout Information */}
        <div className="rounded-[2.5rem] border border-border bg-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black flex items-center gap-2 text-white">
                <Wallet className="h-5 w-5 text-primary" /> Flutterwave Payout
              </h3>
              <div className="mt-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Available for Withdrawal</p>
                <p className="text-5xl font-black tracking-tighter text-white">{formatCurrency(stats?.escrowBalance || 0)}</p>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-black uppercase text-white/40 mb-1">In Escrow</p>
                  <p className="font-bold">{formatCurrency(stats?.pendingPayout || 0)}</p>
                </div>
                <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-black uppercase text-white/40 mb-1">Status</p>
                  <p className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Auto-Pay
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleRequestPayout}
              className="mt-8 w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/25 active:scale-95"
            >
              Request Payout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
