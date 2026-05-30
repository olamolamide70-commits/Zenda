import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Users, 
  CreditCard, 
  FileText, 
  ArrowUpRight, 
  UserPlus, 
  Check, 
  X, 
  Loader2, 
  TrendingUp, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function B2BProcurementDashboard() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'company_admin' | 'company_buyer'>('company_buyer');
  const queryClient = useQueryClient();

  // 1. Fetch Company Organization Details
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/auth/profile').then(res => res.data)
  });

  // Mocking Organization for simulation to prevent UI crash if user is not in a corporate account
  const org = profile?.organization || {
    name: 'TechProcure Nigeria Ltd',
    tin: 'TIN-49201948-2',
    cac_number: 'RC-19284902',
    credit_limit: 10000000.00,
    outstanding_balance: 3450000.00,
    kyc_status: 'verified'
  };

  // 2. Fetch Pending Buyer Purchase Orders
  const { data: pendingOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['pendingProcurements'],
    queryFn: () => api.get('/b2b/organization/orders').then(res => res.data),
    fallbackData: [
      {
        id: 'ord_proc_1',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        amount: 850000.00,
        po_number: 'PO-2026-0049',
        products: {
          name: 'MacBook Pro 14" (M3 Pro, 18GB/512GB)',
          brand: 'Apple',
          image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200'
        },
        users: {
          name: 'Segun Arinze',
          email: 'segun.a@example.com'
        }
      },
      {
        id: 'ord_proc_2',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        amount: 320000.00,
        po_number: 'PO-2026-0050',
        products: {
          name: 'iPad Pro 11" (M2, Wi-Fi 256GB)',
          brand: 'Apple',
          image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200'
        },
        users: {
          name: 'Rosemary Obi',
          email: 'rosemary.o@example.com'
        }
      }
    ]
  });

  // 3. Mock Invited Team members list for premium visuals
  const teamMembers = [
    { name: 'Olasubomi Makinde', email: 'makindeolasubomi5@gmail.com', role: 'Company Admin', status: 'Active' },
    { name: 'Segun Arinze', email: 'segun.a@example.com', role: 'Company Buyer', status: 'Active' },
    { name: 'Rosemary Obi', email: 'rosemary.o@example.com', role: 'Company Buyer', status: 'Active' },
    { name: 'Fatima Zubairu', email: 'fatima.z@example.com', role: 'Company Buyer', status: 'Invited' }
  ];

  // 4. Invite Employee Mutation
  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) => api.post('/b2b/organization/invite', data),
    onSuccess: () => {
      setInviteEmail('');
      toast.success('Onboarding invitation sent successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    }
  });

  // 5. Approve/Reject Procurement Mutation
  const approveMutation = useMutation({
    mutationFn: (data: { orderId: string; approve: boolean }) => 
      api.post(`/b2b/organization/orders/${data.orderId}/approve`, { approve: data.approve }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingProcurements'] });
      toast.success(variables.approve ? 'Procurement request successfully approved!' : 'Purchase order declined');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Authorization failed');
    }
  });

  const availableCredit = org.credit_limit - org.outstanding_balance;
  const utilizationPercentage = Math.round((org.outstanding_balance / org.credit_limit) * 100);

  if (isLoadingProfile || isLoadingOrders) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em]">Assembling Corporate Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Corporate Console</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">{org.name}</h1>
          <p className="mt-2 text-slate-500 font-medium text-sm">
            TIN: {org.tin} • CAC Number: {org.cac_number} • Verification: <span className="text-emerald-500 font-black uppercase">{org.kyc_status}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-2.5 rounded-2xl">
          <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wider">Corporate Line Verified</span>
        </div>
      </div>

      {/* Credit line Gauge Section */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Card 1: Outstanding */}
        <div className="bg-slate-900 border border-slate-950 text-white rounded-[2rem] p-8 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/20 blur-[50px] pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Procured Outstanding Balance</span>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">₦{org.outstanding_balance.toLocaleString()}</h2>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${utilizationPercentage}%` }} />
              </div>
              <span className="text-[10px] font-black text-slate-400">{utilizationPercentage}% Used</span>
            </div>
          </div>
        </div>

        {/* Card 2: Available Credit */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Financing Credit</span>
            <CreditCard className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">₦{availableCredit.toLocaleString()}</h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Refreshes as monthly payments are cleared</p>
          </div>
        </div>

        {/* Card 3: Total Line Limit */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Corporate Credit Limit</span>
            <Building2 className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">₦{org.credit_limit.toLocaleString()}</h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Underwritten by Zenda credit bureau</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Pending Approvals & Employee invites */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left Column: Team Onboarding */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Member invite card */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-6">
            <h3 className="text-md font-black flex items-center gap-2 uppercase tracking-wide text-slate-800 border-b border-slate-50 pb-4">
              <UserPlus className="h-5 w-5 text-primary" /> Invite Employee
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 block">Employee Email</label>
                <Input 
                  placeholder="name@company.com" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-14 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-primary focus-visible:bg-white text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 block">Authorized Role</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button 
                    onClick={() => setInviteRole('company_buyer')}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${inviteRole === 'company_buyer' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Buyer (Staff)
                  </button>
                  <button 
                    onClick={() => setInviteRole('company_admin')}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${inviteRole === 'company_admin' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Admin (Exec)
                  </button>
                </div>
              </div>

              <Button 
                onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                disabled={!inviteEmail || inviteMutation.isPending}
                className="w-full h-14 rounded-xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-950/10 hover:bg-slate-800 transition-all text-xs uppercase tracking-widest"
              >
                {inviteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Send Invitation
              </Button>
            </div>
          </div>

          {/* Active Team members card */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-6">
            <h3 className="text-md font-black flex items-center gap-2 uppercase tracking-wide text-slate-800 border-b border-slate-50 pb-4">
              <Users className="h-5 w-5 text-primary" /> Company Roster
            </h3>
            
            <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto pr-1">
              {teamMembers.map((member, i) => (
                <div key={i} className="py-4 flex justify-between items-center gap-4">
                  <div>
                    <p className="font-black text-slate-800 text-xs uppercase">{member.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{member.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[8px] font-black uppercase block tracking-wider mb-1">
                      {member.role}
                    </span>
                    <span className={`text-[8px] font-bold ${member.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      • {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Pending Approvals Audits */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between">
              <h3 className="text-md font-black flex items-center gap-2 uppercase tracking-wide text-slate-800">
                <FileText className="h-5 w-5 text-primary" /> Purchase Authorizations
              </h3>
              <span className="px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-widest animate-pulse">
                {pendingOrders?.length || 0} Awaiting
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingOrders && pendingOrders.length > 0 ? (
                pendingOrders.map((order: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={order.id} 
                    className="p-8 flex flex-col md:flex-row md:items-center gap-6 hover:bg-slate-50/20 transition-colors"
                  >
                    {/* Item Avatar & specs */}
                    <div className="h-16 w-16 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={order.products?.image_url} alt={order.products?.name} className="h-12 w-12 object-contain" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 text-sm uppercase">{order.products?.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">{order.products?.brand}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Buyer: <span className="text-slate-600 font-black uppercase">{order.users?.name}</span> ({order.users?.email})
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        PO Number: <span className="font-bold text-slate-600">{order.po_number}</span> • Date: {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Financial details & Action Buttons */}
                    <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Purchase Cost</p>
                        <p className="text-lg font-black text-slate-900">₦{order.amount.toLocaleString()}</p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (confirm('Approve this procurement request? This splits the purchase into company installments and reserves credit limit.')) {
                              approveMutation.mutate({ orderId: order.id, approve: true });
                            }
                          }}
                          className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-all active:scale-90"
                          title="Authorize Order"
                        >
                          <Check className="h-5 w-5 stroke-[2.5]" />
                        </button>
                        <button 
                          onClick={() => {
                            const reason = prompt('Please enter the cancellation reason for the buyer:');
                            if (reason != null) {
                              approveMutation.mutate({ orderId: order.id, approve: false });
                            }
                          }}
                          className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-all active:scale-90"
                          title="Reject Request"
                        >
                          <X className="h-5 w-5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">No Pending Procurements</p>
                    <p className="text-xs text-slate-400">All submitted employee purchases have been authorized.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
