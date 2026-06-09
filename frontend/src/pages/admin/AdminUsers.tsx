import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { Loader2, Users } from 'lucide-react';

export default function AdminUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminService.getUsers()
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium">Loading user directory...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Directory</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">User Management</h1>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="h-6 w-6" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <th className="py-5 pl-8">Full Name</th>
                <th className="py-5">Email Address</th>
                <th className="py-5 text-center">Active Plans</th>
                <th className="py-5 pr-8 text-right">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users?.map((u: any) => (
                <tr key={u.id} className="group transition-colors hover:bg-slate-50">
                  <td className="py-6 pl-8 font-bold text-foreground">{u.name}</td>
                  <td className="py-6 text-muted-foreground font-medium">{u.email}</td>
                  <td className="py-6 text-center font-bold text-primary">{u.plans || 0}</td>
                  <td className="py-6 pr-8 text-right">
                    <Badge className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-none border-none ${
                        u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {u.status || 'Active'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-500 font-bold italic">No users found in the directory.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
