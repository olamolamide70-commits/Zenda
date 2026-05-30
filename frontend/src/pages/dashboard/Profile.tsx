import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { User, Mail, Phone, MapPin, ShieldCheck, Loader2, Building2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { authService, vendorService } from '@/services';
import { useState } from 'react';


export default function Profile() {
  const { user, login } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpgradingRole, setIsUpgradingRole] = useState(false);

  const handleUpgradeToMerchant = async () => {
    try {
      setIsUpgradingRole(true);
      await vendorService.register();
      toast.success('Successfully upgraded to Merchant Partner! Refreshing account...');
      const updatedUser = await authService.getProfile();
      const token = localStorage.getItem('auth_token') || '';
      login(updatedUser, token);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to upgrade to merchant');
    } finally {
      setIsUpgradingRole(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const name = `${firstName} ${lastName}`.trim();

    try {
      setIsUpdating(true);
      const updatedUser = await authService.updateProfile({ name });
      const token = localStorage.getItem('auth_token') || '';
      login(updatedUser, token);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const nameParts = user?.name?.split(' ') || ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Settings</p>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Account Profile</h1>
        <p className="mt-1 text-muted-foreground font-medium">Manage your personal information and account security.</p>
      </div>

      <div className="max-w-3xl overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="h-32 bg-slate-50 border-b border-border" />
        <div className="px-8 pb-10">
          <div className="relative -mt-16 mb-10 flex items-end gap-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-primary text-4xl font-black text-white shadow-lg ring-4 ring-white">
              {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="pb-2">
              <h2 className="text-2xl font-black text-foreground tracking-tight">{user?.name || 'Incomplete Profile'}</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{user?.role === 'super_admin' ? 'System Administrator' : 'Verified Member'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">First Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input name="firstName" defaultValue={firstName} placeholder="Your first name" className="h-14 pl-12 bg-slate-50 border-border rounded-xl text-foreground focus:ring-primary/20 transition-all font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Last Name</Label>
                <Input name="lastName" defaultValue={lastName} placeholder="Your last name" className="h-14 px-6 bg-slate-50 border-border rounded-xl text-foreground focus:ring-primary/20 transition-all font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" value={user?.email || ''} disabled className="h-14 pl-12 bg-slate-100 border-border rounded-xl text-muted-foreground cursor-not-allowed font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="+234..." className="h-14 pl-12 bg-slate-50 border-border rounded-xl text-foreground focus:ring-primary/20 transition-all font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Delivery Address</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <textarea 
                  placeholder="Set your delivery address..." 
                  className="w-full min-h-[120px] pl-12 pr-6 py-4 bg-slate-50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Button disabled={isUpdating} type="submit" className="h-14 flex-1 rounded-xl bg-primary text-base font-bold text-white transition-all shadow-md">
                {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                {isUpdating ? 'Saving Changes...' : 'Save Profile'}
              </Button>
            </div>

            {user?.role !== 'vendor' && user?.role !== 'admin' && user?.role !== 'super_admin' && (
              <div className="mt-10 p-8 rounded-2xl border border-indigo-100 bg-indigo-50/20 space-y-4 text-left">
                <div className="flex gap-4 items-start">
                  <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider">Merchant Partner Portal</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                      Are you a gadget seller or business procurement agent? Upgrade to a Merchant Partner account to upload products, access checkout API keys, and monitor real-time webhook delivery logs.
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button 
                    type="button" 
                    onClick={handleUpgradeToMerchant}
                    disabled={isUpgradingRole}
                    className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest flex items-center shadow-lg shadow-indigo-600/10"
                  >
                    {isUpgradingRole ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Building2 className="h-4 w-4 mr-2" />}
                    Upgrade to Merchant
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
