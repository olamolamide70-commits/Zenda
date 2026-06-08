import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { Shield, TrendingUp, Users, DollarSign, Loader2, Check, X, FileText, Settings, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/utils/helpers';
import api from '@/services/api';
import DashboardStatCard from '@/components/DashboardStatCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
export default function ManagerDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'approvals' | 'commission' | 'transactions' | 'portfolio'>('portfolio');
  
  // Custom commission edit states
  const [commissionRate, setCommissionRate] = useState('5');
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);

  // Fetch Users for credit approval list
  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getUsers()
  });

  // Fetch general admin dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => adminService.getDashboard()
  });

  // Fetch detailed analytics for the portfolio
  const { data: detailed, isLoading: detailedLoading } = useQuery({
    queryKey: ['admin-detailed-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/detailed');
      return data;
    }
  });

  // Credit Limit approval mutation
  const approveCreditMutation = useMutation({
    mutationFn: ({ userId, limit }: { userId: string; limit: number }) => 
      api.post('/kyc/review', { userId, status: 'verified', creditLimit: limit, adminNotes: 'Approved by Manager' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Credit limit approved successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to approve credit line');
    }
  });

  // Credit Limit rejection mutation
  const rejectCreditMutation = useMutation({
    mutationFn: (userId: string) => 
      api.post('/kyc/review', { userId, status: 'rejected', creditLimit: 0, adminNotes: 'Rejected by Manager' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.info('Credit line application rejected.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to reject credit line');
    }
  });

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = Number(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.warning('Please enter a valid percentage between 0 and 100');
      return;
    }
    setIsUpdatingCommission(true);
    try {
      // Direct update in all merchants
      const merchants = users.filter(u => u.role === 'merchant' || u.role === 'merchant');
      await Promise.all(merchants.map(m => 
        adminService.updateUser(m.id, { merchant_commission_rate: rate })
      ));
      toast.success(`Default merchant commission rate updated to ${rate}%!`);
    } catch (err) {
      toast.error('Failed to update commission rates');
    } finally {
      setIsUpdatingCommission(false);
    }
  };

  const pendingApprovals = users.filter(u => u.kyc_status === 'pending');

  if (usersLoading || statsLoading || detailedLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-muted-foreground font-medium italic">Loading Manager Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Risk & Control Workspace</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Manager Dashboard</h1>
          <p className="mt-1 text-muted-foreground font-medium text-sm">Review credit limit applications, override parameters, and monitor ledger accounts.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2 border border-border shrink-0 self-start md:self-center">
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'portfolio' ? 'bg-white text-emerald-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Portfolio
          </button>
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'approvals' ? 'bg-white text-emerald-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Credit Approvals ({pendingApprovals.length})
          </button>
          <button 
            onClick={() => setActiveTab('commission')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'commission' ? 'bg-white text-emerald-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Commission Policy
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'transactions' ? 'bg-white text-emerald-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Ledger & Risks
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard title="Outstanding Balances" value={formatCurrency(stats?.outstandingDebt || 0)} icon={DollarSign} subtitle={`${stats?.installmentCount || 0} active plans`} trend="Owed" trendUp />
        <DashboardStatCard title="Total Platform Volume" value={formatCurrency(stats?.revenue || 0)} icon={TrendingUp} trend="Live" trendUp />
        <DashboardStatCard title="System Members" value={users.length} icon={Users} trend="Total Users" trendUp />
        <DashboardStatCard title="Risk Tier Alerts" value={users.filter(u => u.risk_score > 70).length} icon={Shield} subtitle="Users above 70 Risk Score" />
      </div>

      {/* Tab Contents */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white shadow-sm p-6 group hover:border-emerald-500/30 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Portfolio</p>
              <h3 className="text-3xl font-black text-foreground">{formatCurrency(detailed?.financials?.totalPortfolio || 0)}</h3>
            </div>
            <div className="rounded-2xl border border-border bg-white shadow-sm p-6 group hover:border-red-500/30 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Outstanding Debt</p>
              <h3 className="text-3xl font-black text-foreground">{formatCurrency(detailed?.financials?.outstandingDebt || 0)}</h3>
            </div>
            <div className="rounded-2xl border border-border bg-white shadow-sm p-6 group hover:border-emerald-500/30 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Recovered Revenue</p>
              <h3 className="text-3xl font-black text-foreground">{formatCurrency(detailed?.financials?.recoveredRevenue || 0)}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white shadow-sm p-8">
            <h3 className="text-lg font-black text-foreground mb-6">Plan Popularity & Market Preference</h3>
            <div className="flex flex-col md:flex-row md:items-center justify-around gap-8">
              <div className="h-[250px] w-full max-w-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={detailed?.plans} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={5}>
                      {detailed?.plans?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                {detailed?.plans?.map((plan: any, i: number) => (
                  <div key={plan.name} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{plan.name}</span>
                      <span className="text-lg font-black text-foreground">{plan.value} Plans</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-black text-foreground">Pending Credit Line Applications</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">Review KYC submissions and approve requested credit lines based on risk assessments.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    <th className="py-4 pl-8">Applicant Name</th>
                    <th className="py-4">Email Address</th>
                    <th className="py-4">Current Risk Score</th>
                    <th className="py-4">Requested Limit</th>
                    <th className="py-4 pr-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingApprovals.map(u => (
                    <tr key={u.id} className="group transition-colors hover:bg-slate-50">
                      <td className="py-5 pl-8">
                        <span className="font-bold text-foreground block text-sm">{u.name}</span>
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase border border-amber-100">Pending KYC Review</span>
                      </td>
                      <td className="py-5 text-muted-foreground font-medium text-sm">{u.email}</td>
                      <td className="py-5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.risk_score > 60 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {u.risk_score || 0} / 100
                        </span>
                      </td>
                      <td className="py-5 font-bold text-foreground">{formatCurrency(u.credit_limit || 250000)}</td>
                      <td className="py-5 pr-8 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            onClick={() => approveCreditMutation.mutate({ userId: u.id, limit: u.credit_limit || 250000 })}
                            disabled={approveCreditMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 rounded-lg text-xs uppercase px-3 flex items-center gap-1"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => rejectCreditMutation.mutate(u.id)}
                            disabled={rejectCreditMutation.isPending}
                            className="border-red-200 text-red-600 hover:bg-red-50 font-bold h-9 rounded-lg text-xs uppercase px-3 flex items-center gap-1"
                          >
                            <X className="h-3.5 w-3.5" /> Decline
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingApprovals.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-muted-foreground font-medium italic">
                        No pending credit line reviews found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'commission' && (
        <div className="max-w-xl rounded-3xl border border-border bg-white p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Settings className="h-5 w-5 text-emerald-600" /> Default Merchant Commission Rate
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">Override the global base commission percentage collected from gadget merchants upon successful installments.</p>
          </div>

          <form onSubmit={handleUpdateCommission} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Commission Rate Percentage (%)</label>
              <input 
                type="number"
                required
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="e.g. 5"
                min="0"
                max="100"
                className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-sm transition-all"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isUpdatingCommission}
              className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-xs shadow-md transition-all"
            >
              {isUpdatingCommission ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Apply Policy Rate'}
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-foreground">Risk Audit Log & Ledger</h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">Cross-referencing high-risk transactions across the platform.</p>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    <th className="py-4 pl-8">Name</th>
                    <th className="py-4">Credit line</th>
                    <th className="py-4">Risk Level</th>
                    <th className="py-4 pr-8 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.slice(0, 10).map(u => (
                    <tr key={u.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 pl-8">
                        <span className="font-bold text-foreground block">{u.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{u.email}</span>
                      </td>
                      <td className="py-4 font-bold text-foreground">{formatCurrency(u.credit_limit || 0)}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold rounded-lg ${
                          (u.risk_score || 0) > 60 ? 'bg-red-50 text-red-700 border border-red-150' : 
                          (u.risk_score || 0) > 30 ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-150'
                        }`}>
                          {u.risk_score || 0}%
                        </span>
                      </td>
                      <td className="py-4 pr-8 text-right">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {(u.risk_score || 0) > 60 ? 'Inspection Required' : 'Cleared'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

