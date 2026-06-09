import { useState, useMemo } from 'react';
import { Calculator, PieChart as PieIcon, TrendingUp, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

export default function InstallmentCalculator() {
  const [price, setPrice] = useState(150000);
  const [duration, setDuration] = useState(6);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const result = useMemo(() => {
    const interestRate = 0.05;
    const totalWithInterest = price * (1 + interestRate * (duration / 12));
    const divisor = frequency === 'daily' ? duration * 30 : frequency === 'weekly' ? duration * 4 : duration;
    const installment = Math.ceil(totalWithInterest / divisor);
    const total = installment * divisor;
    
    const chartData = [
      { name: 'Principal', value: price, color: '#1D4ED8' },
      { name: 'Interest', value: total - price, color: '#93C5FD' }
    ];

    const schedule = Array.from({ length: Math.min(divisor, 8) }, (_, i) => ({
      period: i + 1,
      amount: installment,
      cumulative: installment * (i + 1),
      remaining: total - installment * (i + 1),
    }));

    return { installment, total, interest: total - price, schedule, periods: divisor, chartData };
  }, [price, duration, frequency]);

  return (
    <div className="py-24 lg:py-40 bg-[#F9FAFB] relative overflow-hidden selection:bg-primary/10">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/[0.03] blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-400/[0.03] blur-[100px] -z-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-20 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white border border-slate-100 shadow-premium glow-border"
          >
            <Calculator className="h-10 w-10 text-primary" />
          </motion.div>
          <h1 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-none">Payment <br /><span className="text-primary italic pr-4">Calculator.</span></h1>
          <p className="mt-8 text-xl font-medium text-slate-500 max-w-2xl mx-auto tracking-tight text-balance">Ownership made simple. Pick your price, set your duration, and see exactly what you pay.</p>
        </div>

        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-2">
          {/* Inputs Section */}
          <div className="rounded-[3rem] border border-slate-100 bg-white p-12 shadow-premium glass-grain relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 group-hover:bg-primary/5 transition-colors duration-700" />
            
            <h2 className="mb-12 text-lg font-black text-foreground tracking-tight uppercase text-[10px] tracking-[0.3em] text-primary flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-primary" /> Configuration
            </h2>

            <div className="space-y-16">
              {/* Price Slider */}
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Gadget Price</Label>
                  <div className="text-3xl font-black text-foreground tracking-tighter">{formatCurrency(price)}</div>
                </div>
                <Slider 
                  value={[price]} 
                  onValueChange={v => setPrice(v[0])} 
                  min={10000} 
                  max={2500000} 
                  step={10000} 
                  className="py-4" 
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-2">
                  <span>Min ₦10k</span>
                  <div className="flex gap-4">
                    {[500000, 1000000, 2000000].map(val => (
                       <button key={val} onClick={() => setPrice(val)} className="hover:text-primary transition-colors">₦{val/1000}k</button>
                    ))}
                  </div>
                  <span>Max ₦2.5m</span>
                </div>
              </div>

              {/* Duration Slider */}
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Payment Duration</Label>
                  <div className="text-3xl font-black text-foreground tracking-tighter">{duration} <span className="text-sm text-muted-foreground">Months</span></div>
                </div>
                <Slider 
                  value={[duration]} 
                  onValueChange={v => setDuration(v[0])} 
                  min={1} 
                  max={24} 
                  step={1} 
                  className="py-4" 
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-2">
                  <span>1 Month</span>
                  <div className="flex gap-4">
                    {[3, 6, 12, 18].map(val => (
                       <button key={val} onClick={() => setDuration(val)} className="hover:text-primary transition-colors">{val}m</button>
                    ))}
                  </div>
                  <span>24 Months</span>
                </div>
              </div>

              {/* Frequency Selection */}
              <div className="space-y-8">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Repayment Frequency</Label>
                <div className="grid grid-cols-3 gap-4">
                  {(['daily', 'weekly', 'monthly'] as const).map(freq => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq)}
                      className={`h-16 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all ${
                        frequency === freq 
                          ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-10">
            <div className="rounded-[3rem] border border-slate-100 bg-white p-12 shadow-premium relative overflow-hidden glow-border">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl" />
              
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-lg font-black text-foreground tracking-tight uppercase text-[10px] tracking-[0.3em] text-primary flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Results Breakdown
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                  <ShieldCheck className="h-3 w-3" /> No hidden fees
                </div>
              </div>

              <div className="grid gap-12 lg:grid-cols-2 items-center">
                <div className="space-y-10">
                  <div className="flex flex-col justify-center rounded-[2.5rem] bg-slate-50/50 p-10 border border-slate-100 group hover:bg-slate-50 transition-colors">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Recurring Payment</span>
                    <span className="text-6xl font-black text-primary tracking-tighter">{formatCurrency(result.installment)}</span>
                    <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-2">Every {frequency.replace('ly', '')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Grand Total</span>
                      <span className="text-xl font-black text-foreground tracking-tight">{formatCurrency(result.total)}</span>
                    </div>
                    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Total Interest</span>
                      <span className="text-xl font-black text-primary italic tracking-tight">{formatCurrency(result.interest)}</span>
                    </div>
                  </div>
                </div>

                {/* Data Viz */}
                <div className="h-[280px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={result.chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {result.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <PieIcon className="h-6 w-6 text-slate-200 mb-1" />
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Breakdown</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Repayment Timeline Preview */}
            <div className="rounded-[3rem] border border-slate-100 bg-white p-12 shadow-premium relative overflow-hidden group">
              <div className="mb-10 flex items-center justify-between">
                <h3 className="text-lg font-black text-foreground tracking-tight uppercase text-[10px] tracking-[0.3em] text-primary flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Payment Timeline Preview
                </h3>
                <TrendingUp className="h-5 w-5 text-slate-200 group-hover:text-primary transition-colors" />
              </div>

              <div className="grid gap-6">
                {result.schedule.map((s, i) => (
                  <motion.div 
                    key={s.period} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-8 group/item"
                  >
                    <div className="w-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">#{s.period}</div>
                    <div className="flex-1 relative">
                      <div className="h-3 rounded-full bg-slate-50 overflow-hidden p-0.5 border border-slate-100/50">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(s.cumulative / result.total) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-primary/30 to-primary/10" 
                        />
                      </div>
                    </div>
                    <div className="w-28 text-right text-sm font-black text-foreground tracking-tight group-hover/item:text-primary transition-colors">{formatCurrency(s.amount)}</div>
                  </motion.div>
                ))}
                <div className="mt-4 pt-6 border-t border-slate-50 text-center">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Showing first 8 payments of {result.periods} total periods.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
