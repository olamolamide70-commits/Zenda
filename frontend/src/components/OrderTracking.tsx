import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Truck, 
  Package, 
  Clock, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface TrackingStep {
  status: string;
  label: string;
  description: string;
  icon: any;
}

const STEPS: TrackingStep[] = [
  { status: 'pending', label: 'Order Placed', description: 'Your order has been received.', icon: Clock },
  { status: 'processing', label: 'Processing', description: 'merchant is preparing your gadget.', icon: ShieldCheck },
  { status: 'shipped', label: 'In Transit', description: 'Package is on its way to you.', icon: Truck },
  { status: 'delivered', label: 'Delivered', description: 'Enjoy your new gadget!', icon: CheckCircle2 }
];

export default function OrderTracking({ currentStatus }: { currentStatus: string }) {
  const activeIndex = STEPS.findIndex(s => s.status === currentStatus);
  const displayIndex = activeIndex === -1 ? 0 : activeIndex;

  if (currentStatus === 'cancelled') {
    return (
      <div className="flex flex-col items-center justify-center p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 text-center">
        <div className="h-16 w-16 rounded-3xl bg-slate-200 text-slate-400 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h4 className="text-xl font-black text-slate-400 uppercase tracking-tight">Order Cancelled</h4>
        <p className="text-sm font-bold text-slate-400 mt-2">This order has been voided and is no longer active.</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-slate-100 lg:left-0 lg:right-0 lg:top-[23px] lg:bottom-auto lg:h-0.5 lg:w-full overflow-hidden">
          <motion.div 
            initial={{ width: 0, height: 0 }}
            animate={{ 
              width: '100%',
              height: '100%'
            }}
            transition={{ duration: 1 }}
            className="bg-primary"
            style={{ 
              clipPath: `polygon(0 0, ${typeof window !== 'undefined' && window.innerWidth > 1024 ? (displayIndex / (STEPS.length - 1)) * 100 : 100}% 0, ${typeof window !== 'undefined' && window.innerWidth > 1024 ? (displayIndex / (STEPS.length - 1)) * 100 : 100}% 100%, 0 100%)`
            }}
          />
          {/* Mobile height scale - cleaner to use scaleY or similar but let's use a simpler approach */}
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${(displayIndex / (STEPS.length - 1)) * 100}%` }}
            className="bg-primary absolute inset-0 lg:hidden"
          />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(displayIndex / (STEPS.length - 1)) * 100}%` }}
            className="bg-primary absolute inset-0 hidden lg:block"
          />
        </div>

        {/* Steps */}
        <div className="flex flex-col lg:flex-row justify-between relative z-10 gap-8 lg:gap-0">
          {STEPS.map((step, i) => {
            const isCompleted = i < displayIndex;
            const isActive = i === displayIndex;
            const Icon = step.icon;

            return (
              <div key={i} className="flex lg:flex-col items-start lg:items-center text-left lg:text-center group max-w-[140px]">
                <div className={`
                  h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500
                  ${isCompleted ? 'bg-primary text-white scale-90' : ''}
                  ${isActive ? 'bg-primary text-white ring-8 ring-primary/10 scale-110' : ''}
                  ${!isCompleted && !isActive ? 'bg-white border-2 border-slate-100 text-slate-300' : ''}
                `}>
                  {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                </div>
                
                <div className="ml-6 lg:ml-0 lg:mt-6">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1 line-clamp-2 max-w-[120px]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insurance Badge Integration */}
      <div className="mt-12 p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h4 className="font-black text-indigo-900 leading-tight">GadgetSafe™ Protection</h4>
            <p className="text-xs font-bold text-indigo-600/70 uppercase tracking-widest mt-1">Insured by LeadWay</p>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-[10px] font-bold text-indigo-900/40 uppercase tracking-[0.2em] mb-1">Status</p>
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
            Active Protection
          </div>
        </div>
      </div>
    </div>
  );
}

