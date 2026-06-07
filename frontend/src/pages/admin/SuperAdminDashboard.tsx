import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, giftCardService } from '@/services';
import { Users, Gift, ShieldAlert, Zap, Loader2, Edit2, CheckCircle2, AlertTriangle, Plus, Badge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/utils/helpers';
import { formatCurrency } from '@/utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';

export default function SuperAdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'users' | 'giftcards'>('users');
  
  // States for role/limit editing
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newRole, setNewRole] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newWalletBal, setNewWalletBal] = useState('');
  const [newKyc, setNewKyc] = useState('');

  // States for gift card generation
  const [mintAmount, setMintAmount] = useState('');

  // 1. Fetch Users List
  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getUsers()
  });

  // 2. Fetch Gift Cards List
  const { data: giftCards = [], isLoading: cardsLoading } = useQuery<any[]>({
    queryKey: ['admin-giftcards'],
    queryFn: () => giftCardService.list()
  });

  // 3. Fetch User Analytics (Demographics)
  const { data: userAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-user-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/users');
      return data;
    }
  });

  // 4. Fetch Staff Analytics
  const { data: staffAnalytics, isLoading: staffLoading } = useQuery({
    queryKey: ['admin-staff-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/staff');
      return data;
    }
  });

  // 3. User Update Mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User profile updated successfully!');
      setEditingUser(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update user profile');
    }
  });

  // 4. Gift Card Mint Mutation
  const mintCardMutation = useMutation({
    mutationFn: (amount: number) => giftCardService.generate({ amount }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-giftcards'] });
      toast.success(`Minted: ${res.giftCard.code} (₦${res.giftCard.initial_amount.toLocaleString()})`);
      setMintAmount('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to generate gift card');
    }
  });

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setNewRole(user.role);
    setNewLimit(user.credit_limit ? user.credit_limit.toString() : '0');
    setNewWalletBal(user.wallet_balance ? user.wallet_balance.toString() : '0');
    setNewKyc(user.kyc_status || 'Pending');
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUserMutation.mutate({
      id: editingUser.id,
      data: {
        role: newRole,
        credit_limit: Number(newLimit),
        wallet_balance: Number(newWalletBal),
        kyc_status: newKyc
      }
    });
  };

  const handleMintCard = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(mintAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.warning('Please enter a valid gift card amount');
      return;
    }
    mintCardMutation.mutate(amount);
  };

  if (usersLoading || cardsLoading || analyticsLoading || staffLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Owner Console</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Zenda Master Hub</h1>
          <p className="mt-1 text-muted-foreground font-medium text-sm">Elevate roles, mint capital cards, and manage the system limits.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2 border border-border">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'users' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            User Roster & RBAC
          </button>
          <button 
            onClick={() => setActiveTab('giftcards')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'giftcards' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Gift Card Minter
          </button>
        </div>
      </div>

      {/* System Status Banner */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-32 w-32 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <Zap className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              System Operational <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-sm font-medium text-slate-400">All services, payment gateways, and databases are running smoothly.</p>
          </div>
        </div>
        <div className="relative z-10 shrink-0">
          <Button variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-widest">
            Enter Maintenance Mode
          </Button>
        </div>
      </div>

      {/* System-Wide Demographics Board */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white shadow-sm p-6 group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center gap-4 mb-2">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-500"><Users className="h-5 w-5" /></div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Platform Customers</p>
          </div>
          <h3 className="text-3xl font-black text-foreground">{(userAnalytics?.roleBreakdown?.user || 0).toLocaleString()}</h3>
          <p className="text-xs text-emerald-600 font-bold mt-2">+{userAnalytics?.velocity?.trend}% from last week</p>
        </div>

        <div className="rounded-2xl border border-border bg-white shadow-sm p-6 group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center gap-4 mb-2">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-500"><Badge className="h-5 w-5" /></div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Merchants</p>
          </div>
          <h3 className="text-3xl font-black text-foreground">{(userAnalytics?.roleBreakdown?.merchant || 0).toLocaleString()}</h3>
          <p className="text-xs text-muted-foreground font-semibold mt-2">B2B Partners integrated</p>
        </div>

        <div className="rounded-2xl border border-border bg-white shadow-sm p-6 group hover:border-amber-500/30 transition-all">
          <div className="flex items-center gap-4 mb-2">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-500"><ShieldAlert className="h-5 w-5" /></div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Internal Workforce</p>
          </div>
          <h3 className="text-3xl font-black text-foreground">{staffAnalytics?.total?.toLocaleString()}</h3>
          <p className="text-xs text-muted-foreground font-semibold mt-2">Admins, Managers & Support staff</p>
        </div>
      </div>

      {/* Tab 1: User Management Roster */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    <th className="py-5 pl-8">Name & Email</th>
                    <th className="py-5">Role Access</th>
                    <th className="py-5">Credit Line</th>
                    <th className="py-5">Wallet Balance</th>
                    <th className="py-5">KYC Check</th>
                    <th className="py-5 pr-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map(u => (
                    <tr key={u.id} className="group transition-colors hover:bg-slate-50">
                      <td className="py-6 pl-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm">{u.name}</span>
                          <span className="text-xs text-muted-foreground font-medium">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-6">
                        <span className={`inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          u.role === 'super_admin' ? 'bg-red-50 text-red-600 border border-red-100' :
                          u.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                          u.role === 'manager' ? 'bg-teal-50 text-teal-600 border border-teal-100' :
                          u.role === 'merchant' || u.role === 'vendor' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          u.role === 'customer_care' || u.role === 'customer_service' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          u.role === 'staff' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                          'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-6 font-bold text-foreground">{formatCurrency(u.credit_limit || 0)}</td>
                      <td className="py-6 font-bold text-primary">{formatCurrency(u.wallet_balance || 0)}</td>
                      <td className="py-6">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                          u.kyc_status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          u.kyc_status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            u.kyc_status === 'Approved' ? 'bg-green-600' :
                            u.kyc_status === 'Rejected' ? 'bg-red-600' :
                            'bg-amber-500 animate-pulse'
                          }`} />
                          {u.kyc_status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-6 pr-8 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => handleOpenEdit(u)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Gift Card Minter */}
      {activeTab === 'giftcards' && (
        <div className="grid gap-8 lg:grid-cols-5 items-start">
          {/* Minter Form */}
          <div className="lg:col-span-2 rounded-[2rem] border border-border bg-white p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" /> Mint Zenda Voucher
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">Generate dynamic cryptographic gift card vouchers for system cash loads.</p>
            </div>

            <form onSubmit={handleMintCard} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Voucher Balance Value (₦)</label>
                <input 
                  type="number"
                  required
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[5000, 10000, 50000].map(val => (
                  <button 
                    key={val} 
                    type="button" 
                    onClick={() => setMintAmount(val.toString())}
                    className="py-2.5 rounded-lg border border-border text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/20 transition-all uppercase tracking-widest hover:bg-primary/5"
                  >
                    ₦{val.toLocaleString()}
                  </button>
                ))}
              </div>

              <Button 
                type="submit" 
                disabled={mintCardMutation.isPending}
                className="w-full h-14 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {mintCardMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Mint Secure Code'}
              </Button>
            </form>
          </div>

          {/* Minter Ledger */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-lg font-black text-foreground tracking-tight">Active Voucher Ledger</h3>
            
            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="py-4 pl-8">Coupon Code</th>
                      <th className="py-4">Voucher Capital</th>
                      <th className="py-4">Voucher Status</th>
                      <th className="py-4 pr-8">Redeemed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {giftCards.length > 0 ? (
                      giftCards.map(c => (
                        <tr key={c.id} className="group transition-colors hover:bg-slate-50 text-xs">
                          <td className="py-4 pl-8 font-black text-foreground tracking-widest uppercase">{c.code}</td>
                          <td className="py-4 font-bold text-primary">{formatCurrency(c.initial_amount)}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                              c.is_active 
                                ? 'bg-green-50 text-green-700 border-green-150' 
                                : 'bg-slate-50 text-slate-400 border-slate-150'
                            }`}>
                              {c.is_active ? 'Active' : 'Claimed'}
                            </span>
                          </td>
                          <td className="py-4 pr-8 text-muted-foreground font-semibold">
                            {c.redeemed_users ? (
                              <div className="flex flex-col">
                                <span className="text-foreground">{c.redeemed_users.name}</span>
                                <span className="text-[10px] text-muted-foreground">{c.redeemed_users.email}</span>
                              </div>
                            ) : (
                              <span className="italic text-slate-350">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-muted-foreground font-medium">
                          No voucher gift cards minted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rl-Management Edit Modal (Super Admin Only) */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingUser(null)} 
                className="absolute top-6 right-6 h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all text-muted-foreground"
              >
                <XButton />
              </button>

              <div className="mb-6">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Profile Override</p>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Audit: {editingUser.name}</h2>
                <p className="text-xs text-muted-foreground font-medium mt-1">{editingUser.email}</p>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Access Role Level</label>
                  <select 
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    <option value="user">User (Customer)</option>
                    <option value="merchant">Merchant</option>
                    <option value="customer_service">Customer Service</option>
                    <option value="customer_care">Customer Care</option>
                    <option value="staff">Staff (Ops)</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Credit Limit (₦)</label>
                  <input 
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Direct Wallet Balance (₦)</label>
                  <input 
                    type="number"
                    value={newWalletBal}
                    onChange={(e) => setNewWalletBal(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">KYC Verification State</label>
                  <select 
                    value={newKyc}
                    onChange={(e) => setNewKyc(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="pt-3 flex gap-3">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setEditingUser(null)} 
                    className="flex-1 h-12 rounded-xl border border-border font-bold text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateUserMutation.isPending}
                    className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition-all"
                  >
                    {updateUserMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Save Profiles'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function XButton() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
