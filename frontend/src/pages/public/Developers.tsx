import { Code2, Terminal, Shield, Zap, ArrowRight, Copy, Check, Globe, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Developers() {
  const [copied, setCopied] = useState(false);

  const exampleCode = `fetch('https://api.Zenda.com.ng/api/b2b/installments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your_merchant_api_key'
  },
  body: JSON.stringify({
    productId: 'gadget-uuid',
    customerId: 'cust-uuid',
    plan: 'monthly_6'
  })
})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(exampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white min-h-screen pt-24 pb-20 selection:bg-primary/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-40 bg-slate-900 text-white">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/20 blur-[120px] -z-0" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8"
            >
              <Terminal className="h-3 w-3" /> Developer API
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.95]"
            >
              Power your sales with <span className="text-primary italic">Installments.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl lg:text-2xl text-white/60 font-medium max-w-2xl leading-relaxed mb-12"
            >
              Integrate Zenda's checkout into your existing business. Let your customers pay later, while you get paid upfront.
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/register?type=vendor">
                <Button className="h-16 px-10 rounded-2xl bg-primary text-white font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 text-base uppercase tracking-widest">
                  Get API Access
                </Button>
              </Link>
              <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-all text-base uppercase tracking-widest">
                Read the Docs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Example */}
      <section className="py-32 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground mb-8 uppercase text-[12px] tracking-[0.3em] text-primary">Simple Integration</h2>
            <p className="text-xl text-muted-foreground font-medium leading-relaxed mb-10">
              Our API is designed for speed. Authenticate with a single header and start processing installment plans for your customers in minutes.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: Shield, title: 'Secure Auth', desc: 'Enterprise-grade API key authentication.' },
                { icon: Zap, title: 'Instant Response', desc: 'Real-time approval for qualified customers.' },
                { icon: Globe, title: 'Webhooks', desc: 'Stay notified on every payment and delivery status.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground/60 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/50" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                <div className="h-3 w-3 rounded-full bg-green-500/50" />
              </div>
              <button 
                onClick={handleCopy}
                className="text-white/40 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <pre className="text-sm font-mono text-emerald-400/90 overflow-x-auto leading-relaxed">
              <code>{exampleCode}</code>
            </pre>
          </motion.div>
        </div>
      </section>

      {/* Business Perks */}
      <section className="bg-slate-50 py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground mb-4">Why Partner with Us?</h2>
            <p className="text-lg text-muted-foreground/60 font-medium max-w-2xl mx-auto">
              Join 500+ businesses using Zenda to increase their conversion rates by up to 40%.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Building2, 
                title: 'B2B Wholesale', 
                desc: 'Bulk financing for corporate gadget procurement with custom interest rates.' 
              },
              { 
                icon: Code2, 
                title: 'Custom SDKs', 
                desc: 'Ready-to-use components for React, Next.js, and WordPress (WooCommerce).' 
              },
              { 
                icon: Shield, 
                title: 'Risk Management', 
                desc: 'We handle the risk and the collection. You focus on selling your products.' 
              },
            ].map((perk, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-[2rem] border border-border shadow-sm hover:shadow-md transition-all group"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <perk.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-4 uppercase text-[12px] tracking-widest">{perk.title}</h3>
                <p className="text-muted-foreground/60 font-medium leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 container mx-auto px-4 text-center">
        <h2 className="text-5xl lg:text-8xl font-black tracking-tighter text-foreground mb-8">Ready to grow?</h2>
        <p className="text-xl text-muted-foreground/60 font-medium mb-12 max-w-2xl mx-auto italic">
          Register your business today and get your API key in seconds.
        </p>
        <Link to="/register?type=vendor">
          <Button size="lg" className="h-20 rounded-2xl bg-primary px-16 text-xl font-black text-white hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 uppercase tracking-widest">
            Create Partner Account <ArrowRight className="ml-4 h-6 w-6" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
