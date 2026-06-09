import { notificationService } from '@/services';
import { Bell, CheckCircle, AlertTriangle, Clock, Loader2, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const iconMap = { reminder: Clock, success: CheckCircle, error: AlertTriangle };
const colorMap = { 
  reminder: 'bg-orange-50 text-warning border-orange-100', 
  success: 'bg-blue-50 text-primary border-blue-100', 
  error: 'bg-red-50 text-destructive border-red-100' 
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll()
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Alerts</p>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Notifications</h1>
        <p className="mt-1 text-muted-foreground font-medium">Keep track of your payment reminders and status updates.</p>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications && notifications.length > 0 ? (
            notifications.map((n: any, i: number) => {
              const Icon = iconMap[n.type as keyof typeof iconMap] || Bell;
              return (
                <motion.div 
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                  className={`group flex gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:bg-slate-50 cursor-pointer ${!n.is_read ? 'border-primary/30 bg-primary/[0.02]' : ''}`}
                >
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border shadow-sm ${colorMap[n.type as keyof typeof colorMap] || 'bg-slate-100 text-foreground'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className={`text-xl font-bold tracking-tight ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                      {!n.is_read && (
                        <span className="flex items-center gap-1 leading-none rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> New
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-base font-medium text-muted-foreground leading-relaxed">{n.message}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <Clock className="h-3 w-3" /> {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50/50 py-24 text-center"
            >
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white border border-border shadow-sm">
                <Inbox className="h-10 w-10 text-slate-500" />
              </div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">No Notifications</h2>
              <p className="mt-2 text-muted-foreground text-center mx-auto max-w-xs">You'll see updates about your orders and payments here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
