import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import api from '@/services/api';
import { DollarSign, Users, ShoppingBag, Send, Bell, CreditCard, Loader2 } from 'lucide-react';
import DashboardStatCard from '@/components/DashboardStatCard';

export default function AdminDashboard() {
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => adminService.getDashboard(),
  });

  const handleBroadcast = async () => {
    if (!pushTitle || !pushBody) return toast.error('Please fill all fields');
    setIsSending(true);
    try {
      await api.post('/push/broadcast', { title: pushTitle, body: pushBody });
      toast.success('Broadcast sent successfully');
      setPushTitle('');
      setPushBody('');
    } catch (error) {
      toast.error('Failed to send broadcast');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium italic">Accessing Master Controls...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Administration</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Admin Dashboard</h1>
        </div>
        <Badge variant="outline" className="px-3 py-1 font-bold text-[10px] uppercase tracking-widest text-primary border-primary/20 bg-primary/5">Console Active</Badge>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard title="Total Money" value={formatCurrency(dashboard?.revenue || 0)} icon={DollarSign} trend="Live" trendUp />
        <DashboardStatCard title="Total Members" value={dashboard?.userCount || 0} icon={Users} trend="Active" trendUp />
        <DashboardStatCard title="Active Orders" value={dashboard?.orderCount || 0} icon={ShoppingBag} trend="Total" trendUp />
        <DashboardStatCard title="Due Payments" value={dashboard?.installmentCount || 0} icon={CreditCard} subtitle={`${formatCurrency(dashboard?.outstandingDebt || 0)} Owed`} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-8 text-2xl font-black text-foreground tracking-tight">System Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-4">Identifier</th>
                  <th className="py-4">Product</th>
                  <th className="py-4">Value</th>
                  <th className="py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.isArray(dashboard?.recentOrders) && dashboard.recentOrders.map((o: any) => (
                  <tr key={o.id} className="group transition-colors hover:bg-slate-50">
                    <td className="py-5 font-mono text-xs text-muted-foreground font-medium uppercase tracking-tighter">{o.id.slice(0, 8)}...</td>
                    <td className="py-5 font-bold text-foreground">{o.product_name || o.product}</td>
                    <td className="py-5 font-bold text-primary">{formatCurrency(o.total_amount || o.amount)}</td>
                    <td className="py-5 text-right">
                      <Badge className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-none border-none ${getStatusColor(o.status)}`}>
                        {o.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Broadcast Push */}
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Broadcast</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed font-medium">Send an instant push notification to all platform members.</p>
          
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Title</label>
              <Input 
                placeholder="Important Platform Update" 
                value={pushTitle}
                onChange={(e) => setPushTitle(e.target.value)}
                className="rounded-xl border-border bg-slate-50/50 h-12 font-bold focus:bg-white transition-all shadow-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Announcement Details</label>
              <Textarea 
                placeholder="Compose your broadcast message here..." 
                value={pushBody}
                onChange={(e) => setPushBody(e.target.value)}
                className="rounded-xl border-border bg-slate-50/50 min-h-[140px] font-bold focus:bg-white transition-all shadow-none resize-none"
              />
            </div>
          </div>

          <Button 
            onClick={handleBroadcast} 
            disabled={isSending}
            className="w-full mt-10 rounded-xl h-14 bg-primary text-white font-bold uppercase tracking-widest text-[10px] gap-3 shadow-md hover:shadow-lg transition-all"
          >
            {isSending ? 'Transmitting...' : 'Send Broadcast'}
            {!isSending && <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
