import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { LayoutDashboard, MessageSquare, UserCheck, Search, Clock, CheckCircle2, AlertCircle, Loader2, SearchCheck, Check, X, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import api from '@/services/api';
import { formatCurrency } from '@/utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function SupportDashboard() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom limits for KYC approvals
  const [customLimits, setCustomLimits] = useState<Record<string, string>>({});

  // 1. Fetch Users Roster
  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getUsers()
  });

  // Fetch KYC Analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-user-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/users');
      return data;
    }
  });

  // 2. KYC review mutation
  const kycReviewMutation = useMutation({
    mutationFn: ({ userId, status, limit }: { userId: string; status: string; limit: number }) => 
      api.post('/kyc/review', { userId, status, creditLimit: limit, adminNotes: 'Approved by Support Agent' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('KYC state updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update KYC check');
    }
  });

  if (isLoading || analyticsLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium italic">Connecting to Support Desk...</p>
      </div>
    );
  }

  // Filter users with pending KYC reviews
  const pendingKycUsers = users.filter(u => u.kyc_status?.toLowerCase() === 'pending');
  
  // Filter for search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKycAction = (userId: string, status: 'verified' | 'rejected') => {
    const limit = Number(customLimits[userId] || '250000');
    kycReviewMutation.mutate({ userId, status, limit });
  };

  const handleLimitChange = (userId: string, val: string) => {
    setCustomLimits(prev => ({ ...prev, [userId]: val }));
  };

  const totalVerified = users.filter(u => u.kyc_status?.toLowerCase() === 'verified' || u.kyc_status === 'Approved').length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Customer Support Portal</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Customer Care Console</h1>
          <p className="mt-1 text-muted-foreground font-medium">Verify documents, approve credit limits, and resolve active inquiries.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-white border-border rounded-xl text-foreground font-bold shadow-sm focus:ring-primary/20" 
          />
        </div>
      </div>

      {/* KYC Performance Metrics Top Board */}
      {analytics?.kycBreakdown && (
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h3 className="text-xl font-black text-foreground mb-6">KYC Performance Metrics</h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Verified</p>
                <p className="text-3xl font-black text-emerald-700">{analytics.kycBreakdown.verified || 0}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4 border border-amber-100 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">In Review</p>
                <p className="text-3xl font-black text-amber-700">{analytics.kycBreakdown.pending || 0}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4 border border-red-100 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-1">Rejected</p>
                <p className="text-3xl font-black text-red-700">{analytics.kycBreakdown.rejected || 0}</p>
              </div>
            </div>
            
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={Object.entries(analytics.kycBreakdown).map(([name, value]) => ({ name, value }))} 
                    cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value" paddingAngle={5}
                  >
                    {Object.entries(analytics.kycBreakdown).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Active KYC/Support Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <h3 className="text-xl font-black text-foreground mb-8 flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" /> Active KYC Review Queue
            </h3>
            
            <div className="space-y-4">
              {pendingKycUsers.map((u, i) => (
                <motion.div 
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-xl bg-slate-50 border border-border hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-foreground">{u.name}</span>
                      <span className="text-[9px] font-black tracking-widest uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 animate-pulse">Pending Review</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{u.email}</p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-2">
                      <span>NIN: {u.nin || 'Not Provided'}</span>
                      <span>BVN: {u.bvn || 'Not Provided'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-end md:items-center gap-3 shrink-0">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block text-right">Assign Credit Line</label>
                      <Input 
                        type="number"
                        placeholder="₦250,000"
                        value={customLimits[u.id] || ''}
                        onChange={(e) => handleLimitChange(u.id, e.target.value)}
                        className="h-10 w-36 text-sm font-bold bg-white text-right border-border rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2 self-end md:self-center">
                      <Button 
                        onClick={() => handleKycAction(u.id, 'verified')}
                        disabled={kycReviewMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 w-10 p-0 flex items-center justify-center rounded-lg"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleKycAction(u.id, 'rejected')}
                        disabled={kycReviewMutation.isPending}
                        className="border-red-200 text-red-600 hover:bg-red-50 h-10 w-10 p-0 flex items-center justify-center rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {pendingKycUsers.length === 0 && (
                <div className="py-12 text-center text-muted-foreground font-medium italic">
                  No accounts are currently awaiting KYC verification.
                </div>
              )}
            </div>
          </div>

          {/* User Search results */}
          {searchQuery && (
            <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
              <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
                <SearchCheck className="h-5 w-5 text-primary" /> Directory Search Results
              </h3>
              <div className="divide-y divide-border">
                {filteredUsers.slice(0, 5).map(u => (
                  <div key={u.id} className="py-4 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-foreground block">{u.name}</span>
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      u.kyc_status?.toLowerCase() === 'verified' || u.kyc_status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      u.kyc_status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {u.kyc_status || 'Unverified'}
                    </span>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="py-4 text-center text-muted-foreground font-medium italic">No matches found.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats Column */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-6">Verification Statistics</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-bold text-muted-foreground">Verified Customers</span>
                </div>
                <span className="text-lg font-black text-foreground">{totalVerified}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-muted-foreground">In Review Queue</span>
                </div>
                <span className="text-lg font-black text-foreground">{pendingKycUsers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-bold text-muted-foreground">Total Directory Accounts</span>
                </div>
                <span className="text-lg font-black text-foreground">{users.length}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-primary p-8 text-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
            <MessageSquare className="h-10 w-10 mb-6 text-white/90" />
            <h3 className="text-2xl font-black mb-1">Coordinating Channel</h3>
            <p className="text-sm font-medium text-white/80 mb-6 italic">Exchange alerts and verify critical data updates with supervisors.</p>
            <button className="w-full h-14 rounded-xl bg-white text-primary font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">
              Launch Team Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
