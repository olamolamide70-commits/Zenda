import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '@/services/api';
import { Loader2, TrendingUp, AlertCircle, DollarSign, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AdminAnalytics() {
  const { user } = useApp();
  const ismerchant = user?.role === 'merchant' || user?.role === 'merchant';

  const { data: detailed, isLoading: detailedLoading } = useQuery({
    queryKey: ['admin-detailed-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/detailed');
      return data;
    }
  });

  const { data: growth, isLoading: growthLoading } = useQuery({
    queryKey: ['admin-growth-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/growth');
      return data;
    }
  });

  if (detailedLoading || growthLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{ismerchant ? 'Performance' : 'Intelligence'}</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">{ismerchant ? 'Sales Analytics' : 'System Analytics'}</h1>
        </div>
        <div className="rounded-xl bg-slate-50 border border-border px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Live Updates
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-2xl border-border bg-white p-8 shadow-sm group hover:border-primary/20 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary"><TrendingUp className="h-6 w-6" /></div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Portfolio</p>
          </div>
          <h3 className="text-4xl font-black text-foreground tracking-tighter">${detailed?.financials?.totalPortfolio?.toLocaleString()}</h3>
        </Card>
        <Card className="rounded-2xl border-border bg-white p-8 shadow-sm group hover:border-red-500/20 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-xl bg-red-50 p-3 text-red-500"><AlertCircle className="h-6 w-6" /></div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Outstanding Debt</p>
          </div>
          <h3 className="text-4xl font-black text-foreground tracking-tighter">${detailed?.financials?.outstandingDebt?.toLocaleString()}</h3>
        </Card>
        <Card className="rounded-2xl border-border bg-white p-8 shadow-sm group hover:border-emerald-500/20 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-500"><DollarSign className="h-6 w-6" /></div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recovered Revenue</p>
          </div>
          <h3 className="text-4xl font-black text-foreground tracking-tighter">${detailed?.financials?.recoveredRevenue?.toLocaleString()}</h3>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card className="rounded-2xl border-border bg-white p-10 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Sales Performance</h2>
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={growth?.sales}>
              <XAxis dataKey="month" stroke="rgba(0,0,0,0.3)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(0,0,0,0.3)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '1rem' }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
              />
              <Bar dataKey="sales" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Installment Activity */}
        <Card className="rounded-2xl border-border bg-white p-10 shadow-sm">
          <div className="mb-8 items-center justify-between flex">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Plan Adoption</h2>
            <Wallet className="h-6 w-6 text-slate-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growth?.installments}>
              <XAxis dataKey="month" stroke="rgba(0,0,0,0.3)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(0,0,0,0.3)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '1rem' }}
              />
              <Line type="monotone" dataKey="active" stroke="var(--primary)" strokeWidth={4} dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Plan Popularity Pie */}
        <Card className="rounded-2xl border-border bg-white p-10 shadow-sm lg:col-span-2">
          <h2 className="mb-12 text-2xl font-black text-foreground tracking-tight">Market Preference Distribution</h2>
          <div className="flex flex-col items-center md:flex-row md:justify-around gap-12">
            <ResponsiveContainer width={300} height={300}>
              <PieChart>
                <Pie data={detailed?.plans} cx="50%" cy="50%" innerRadius={80} outerRadius={120} dataKey="value" paddingAngle={8}>
                  {detailed?.plans?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-8">
              {detailed?.plans?.map((plan: any, i: number) => (
                <div key={plan.name} className="flex items-center gap-4">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">{plan.name}</span>
                    <span className="text-2xl font-black text-foreground">{plan.value} Clients</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

