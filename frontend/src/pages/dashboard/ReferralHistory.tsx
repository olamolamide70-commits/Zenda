import { useQuery } from '@tanstack/react-query';
import { Gift, Users, ArrowLeft, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { referralService } from '@/services/referralService';
import { formatCurrency } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';

export default function ReferralHistory() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['referralStats'],
    queryFn: referralService.getStats
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium">Loading network data...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border bg-white text-muted-foreground hover:bg-slate-50 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Growth</p>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Referral Network</h1>
          <p className="text-muted-foreground font-medium">Tracking your impact on the ecosystem.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <p className="text-4xl font-black text-foreground">{stats?.referrals?.length || 0}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Total Invitations</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
            <Gift className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-4xl font-black text-foreground">{formatCurrency(stats?.rewardsEarned || 0)}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Credits Earned</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl" />
          <p className="text-[10px] font-bold text-primary mb-3 uppercase tracking-widest">Your Code</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-lg font-mono text-primary font-bold bg-white p-3 rounded-xl border border-primary/10 select-all shadow-sm">
              {stats?.referralCode}
            </code>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-8 border-b border-border">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Invitation Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <th className="py-5 pl-8">Invitee</th>
                <th className="py-5">Status</th>
                <th className="py-5">Reward</th>
                <th className="py-5 pr-8 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
               {stats?.referrals?.map((r: any) => (
                <tr key={r.id} className="group transition-colors hover:bg-slate-50">
                  <td className="py-6 pl-8">
                    <p className="font-bold text-foreground tracking-tight">{r.invitee_name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{r.invitee_email}</p>
                  </td>
                  <td className="py-6">
                    <Badge className={`rounded-lg gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-none border-none ${
                        r.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {r.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-6 font-bold text-sm">
                    {r.reward_claimed ? <span className="text-primary">+₦5,000</span> : <span className="text-slate-500">Pending</span>}
                  </td>
                  <td className="py-6 pr-8 text-right font-medium text-slate-500 text-sm">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!stats?.referrals || stats.referrals.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-500 font-bold italic">No invitations yet. Start sharing to earn rewards!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
