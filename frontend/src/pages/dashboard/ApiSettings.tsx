import { useState, useEffect } from 'react';
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
  Loader2,
  Globe,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ApiSettings() {
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const queryClient = useQueryClient();

  // 1. Fetch Merchant API Keys
  const { data: keys, isLoading: isLoadingKeys } = useQuery({
    queryKey: ['merchantApiKeys'],
    queryFn: () => api.get('/b2b/keys').then(res => res.data)
  });

  // 2. Fetch Webhook Logs
  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['merchantWebhookLogs'],
    queryFn: () => api.get('/b2b/webhook/logs').then(res => res.data),
    refetchInterval: 10000 // Refetch every 10 seconds for real-time tracking
  });

  // 3. Sync configured Webhook URL from merchant profile (stored in bank_details)
  useEffect(() => {
    api.get('/auth/profile').then(res => {
      if (res.data?.bank_details?.webhook_url) {
        setWebhookUrl(res.data.bank_details.webhook_url);
      }
    }).catch(err => console.error('Failed to sync profile webhook:', err));
  }, []);

  // 4. Create Key Mutation
  const createMutation = useMutation({
    mutationFn: (name: string) => api.post('/b2b/keys', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantApiKeys'] });
      setNewKeyName('');
      toast.success('New secret API key generated!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to generate key');
    }
  });

  // 5. Revoke Key Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/b2b/keys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantApiKeys'] });
      toast.success('API key revoked and deactivated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to revoke key');
    }
  });

  // 6. Save Webhook URL Mutation
  const saveWebhookMutation = useMutation({
    mutationFn: (url: string) => api.post('/b2b/webhook/config', { url }),
    onSuccess: () => {
      toast.success('Webhook endpoint configured successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to configure webhooks');
    }
  });

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isLoading = isLoadingKeys || isLoadingLogs;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em]">Securing developer console...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Developer Center</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">API & Webhooks</h1>
          <p className="mt-2 text-slate-500 font-medium text-sm">
            Manage credentials and listen to transactional webhooks to integrate Zenda's installment engine.
          </p>
        </div>
      </div>

      {/* SECTION 1: API KEYS SECTION */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Key Generator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-md font-black mb-6 flex items-center gap-2 uppercase tracking-wide text-slate-800">
              <Plus className="h-5 w-5 text-primary" /> Generate Credentials
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 block">Key Description</label>
                <Input 
                  placeholder="e.g. Production Storefront" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="h-14 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-primary focus-visible:bg-white text-sm"
                />
              </div>
              <Button 
                onClick={() => createMutation.mutate(newKeyName)}
                disabled={!newKeyName || createMutation.isPending}
                className="w-full h-14 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all text-xs uppercase tracking-widest"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                Generate Secret Key
              </Button>
            </div>
            <div className="mt-8 p-5 rounded-2xl bg-amber-50 border border-amber-100">
              <div className="flex gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-[10px] font-medium leading-relaxed text-amber-800">
                  <span className="font-black uppercase tracking-wider block mb-1">Security Guard</span>
                  Your API keys grant access to checkout operations. Never publish them in frontend clients or commit them to git repository.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Keys List */}
        <div className="lg:col-span-2">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-md font-black flex items-center gap-2 uppercase tracking-wide text-slate-800">
                <Terminal className="h-5 w-5 text-primary" /> Active Access Tokens
              </h3>
              <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                {keys?.length || 0} Total
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {keys && keys.length > 0 ? (
                keys.map((k: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={k.id} 
                    className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/20 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-800 uppercase text-[12px] tracking-tight">{k.name || 'API Key'}</p>
                        {k.is_active ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[8px] font-black uppercase">Revoked</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Clock className="h-3 w-3" /> Used: {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <ShieldCheck className="h-3 w-3" /> Created: {new Date(k.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <div className="h-12 w-48 md:w-64 rounded-xl bg-slate-50 border border-slate-100 px-4 flex items-center font-mono text-[11px] text-slate-400 select-all overflow-hidden whitespace-nowrap pr-12">
                          {k.api_key}
                        </div>
                        <button 
                          onClick={() => handleCopy(k.api_key)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90"
                        >
                          {copiedKey === k.api_key ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                        </button>
                      </div>
                      {k.is_active && (
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to revoke this secret credentials? Third-party integrations utilizing this key will instantly fail.')) {
                              deleteMutation.mutate(k.id);
                            }
                          }}
                          className="h-12 w-12 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 hover:text-rose-600 transition-all active:scale-90"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                    <Terminal className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">No Access Keys Registered</p>
                    <p className="text-xs text-slate-400">Onboard your e-commerce storefront by creating your first secret token.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WEBHOOKS SECTION */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Card: Webhook Config */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-md font-black mb-6 flex items-center gap-2 uppercase tracking-wide text-slate-800">
              <Globe className="h-5 w-5 text-primary" /> Webhook Setup
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 block">Endpoint URL</label>
                <Input 
                  placeholder="https://yourdomain.com/webhooks/zenda" 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="h-14 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-primary focus-visible:bg-white text-sm"
                />
              </div>
              <Button 
                onClick={() => saveWebhookMutation.mutate(webhookUrl)}
                disabled={!webhookUrl || saveWebhookMutation.isPending}
                className="w-full h-14 rounded-xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-950/10 hover:bg-slate-800 transition-all text-xs uppercase tracking-widest"
              >
                {saveWebhookMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Endpoint
              </Button>
            </div>
            <div className="mt-8 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-indigo-600 shrink-0" />
                <p className="text-[10px] font-medium leading-relaxed text-indigo-800">
                  <span className="font-black uppercase tracking-wider block mb-1">Verify Signatures</span>
                  Zenda signs each webhook payload with a cryptographic header: <code className="bg-indigo-100/50 px-1 rounded text-primary">x-zenda-signature</code>. Check this signature to verify authenticity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Webhook Logs */}
        <div className="lg:col-span-2">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-md font-black flex items-center gap-2 uppercase tracking-wide text-slate-800">
                <Globe className="h-5 w-5 text-primary" /> Delivery Logs History
              </h3>
              <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Real-Time
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {logs && logs.length > 0 ? (
                logs.map((log: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={log.id} 
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/10 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {log.event_type}
                        </span>
                        <span className={`h-2 w-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">
                        Attempt {log.attempt_number}/6 • ID: #{log.id.slice(0, 8)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Code Tag */}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider ${log.response_status === 200 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                        {log.response_status === 200 ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        HTTP {log.response_status}
                      </span>
                      
                      {/* Timestamp */}
                      <div className="text-[10px] font-bold text-slate-400 tracking-wider">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">No Pushes Triggered</p>
                    <p className="text-xs text-slate-400">Logs will populate as transactions trigger background webhook webhooks.</p>
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
