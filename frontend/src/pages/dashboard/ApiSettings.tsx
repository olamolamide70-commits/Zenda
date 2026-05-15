import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Terminal, 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  ShieldAlert, 
  Clock, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ApiSettings() {
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: keys, isLoading } = useQuery({
    queryKey: ['merchantApiKeys'],
    queryFn: () => api.get('/admin/api-keys').then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => api.post('/admin/api-keys', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantApiKeys'] });
      setNewKeyName('');
      toast.success('New API key generated!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to generate key');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/api-keys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantApiKeys'] });
      toast.success('API key revoked');
    }
  });

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Securing your keys...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Developer Settings</p>
        <h1 className="text-4xl font-black text-foreground tracking-tight">API Management</h1>
        <p className="mt-1 text-muted-foreground font-medium">Manage your merchant keys to integrate Zenda into your storefront.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Key Generator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[2.5rem] border border-border bg-white p-8 shadow-sm">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Generate New Key
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Key Description</label>
                <Input 
                  placeholder="e.g. Production Website" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="h-14 rounded-xl border-slate-100 bg-slate-50 focus:ring-primary"
                />
              </div>
              <Button 
                onClick={() => createMutation.mutate(newKeyName)}
                disabled={!newKeyName || createMutation.isPending}
                className="w-full h-14 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                Generate Secret Key
              </Button>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-orange-50 border border-orange-100">
              <div className="flex gap-3">
                <ShieldAlert className="h-5 w-5 text-orange-500 shrink-0" />
                <p className="text-[10px] font-medium leading-relaxed text-orange-800">
                  <span className="font-black uppercase tracking-widest block mb-1">Security Warning</span>
                  Your API keys provide full access to your merchant account. Never share them or expose them in client-side code.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Keys List */}
        <div className="lg:col-span-2">
          <div className="rounded-[2.5rem] border border-border bg-white overflow-hidden shadow-sm">
            <div className="p-8 border-b border-border flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" /> Active API Keys
              </h3>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                {keys?.length || 0} Total
              </span>
            </div>

            <div className="divide-y divide-border">
              {keys && keys.length > 0 ? (
                keys.map((k: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={k.id} 
                    className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-foreground uppercase text-[12px] tracking-tight">{k.name || 'Default Key'}</p>
                        {k.is_active ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <Clock className="h-3 w-3" /> Last used: {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <ShieldCheck className="h-3 w-3" /> Created: {new Date(k.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <div className="h-12 w-48 md:w-64 rounded-xl bg-slate-100 border border-slate-200 px-4 flex items-center font-mono text-xs text-slate-400 select-all overflow-hidden whitespace-nowrap">
                          {k.api_key}
                        </div>
                        <button 
                          onClick={() => handleCopy(k.api_key)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90"
                        >
                          {copiedKey === k.api_key ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
                            deleteMutation.mutate(k.id);
                          }
                        }}
                        className="h-12 w-12 rounded-xl border border-red-100 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all active:scale-90"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                    <Terminal className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">No API keys found</p>
                    <p className="text-xs text-muted-foreground">Generate your first key to start using our B2B API.</p>
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
