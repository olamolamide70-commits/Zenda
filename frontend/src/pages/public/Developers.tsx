import { Code2, Terminal, Shield, Zap, ArrowRight, Copy, Check, Globe, Building2, Calculator, Play, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type Language = 'curl' | 'nodejs' | 'python';

export default function Developers() {
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<Language>('nodejs');
  
  // Dynamic Pricing Estimator State
  const [testAmount, setTestAmount] = useState<number>(150000);
  const [isSubsidized, setIsSubsidized] = useState<boolean>(true);

  // Simulated Sandbox Modal State
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [sandboxStep, setSandboxStep] = useState<1 | 2 | 3>(1);
  const [sandboxRisk, setSandboxRisk] = useState<number>(75);
  const [loadingSimulation, setLoadingSimulation] = useState(false);

  // Multi-Language Code Snippets
  const codeSnippets = {
    curl: `curl -X POST https://api.zenda.com.ng/v1/checkout/session \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: gf_live_9a3efc81b2..." \\
  -d '{
    "productId": "prod_fa38bc89",
    "amount": ${testAmount},
    "plan": "monthly_3",
    "customer": {
      "name": "Acme Corp",
      "email": "procurement@acme.com"
    }
  }'`,
    nodejs: `const axios = require('axios');

const response = await axios.post(
  'https://api.zenda.com.ng/v1/checkout/session', 
  {
    productId: 'prod_fa38bc89',
    amount: ${testAmount},
    plan: 'monthly_3',
    customer: {
      name: 'Acme Corp',
      email: 'procurement@acme.com'
    }
  },
  {
    headers: {
      'x-api-key': 'gf_live_9a3efc81b2...',
      'Content-Type': 'application/json'
    }
  }
);

console.log('Checkout URL:', response.data.checkoutUrl);`,
    python: `import requests

url = "https://api.zenda.com.ng/v1/checkout/session"
headers = {
    "x-api-key": "gf_live_9a3efc81b2...",
    "Content-Type": "application/json"
}
data = {
    "productId": "prod_fa38bc89",
    "amount": ${testAmount},
    "plan": "monthly_3",
    "customer": {
        "name": "Acme Corp",
        "email": "procurement@acme.com"
    }
}

response = requests.post(url, json=data, headers=headers)
print("Checkout URL:", response.json()["checkoutUrl"])`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Estimator Math
  const feeRate = isSubsidized ? 0.055 : 0.015; // 5.5% subsidized vs 1.5% consumer interest
  const feeCapped = testAmount * feeRate;
  const merchantPayout = testAmount - feeCapped;
  const customerMonthly = Math.ceil(testAmount / 3);

  // Trigger simulated underwriting
  const triggerSimulation = () => {
    setLoadingSimulation(true);
    setTimeout(() => {
      setLoadingSimulation(false);
      setSandboxStep(2);
    }, 2000);
  };

  const completeSimulation = () => {
    setSandboxStep(3);
    toast.success('Simulation completed successfully!');
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 selection:bg-primary/20 selection:text-primary">
      {/* Dynamic Ambient Background Blur */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-36 pb-20 border-b border-slate-900 bg-slate-950">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Side Header */}
            <div className="lg:col-span-6 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.25em]"
              >
                <Terminal className="h-3.5 w-3.5" /> Developer Platform
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.95] uppercase text-white"
              >
                Power your sales with <span className="text-primary italic">Installments.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-slate-400 font-medium max-w-xl leading-relaxed"
              >
                Integrate Zenda’s high-conversion checkout API. Offer flexible B2B corporate installments and net terms on your site. You get paid 100% upfront, we bear the credit risk.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/register?type=merchant">
                  <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black hover:bg-primary/95 shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all">
                    Get Credentials
                  </Button>
                </Link>
                <Button 
                  onClick={() => {
                    setSandboxStep(1);
                    setIsSandboxOpen(true);
                  }}
                  variant="outline" 
                  className="h-14 px-8 rounded-2xl border-slate-800 bg-slate-900/40 text-slate-200 font-black hover:bg-slate-900 hover:text-white text-xs uppercase tracking-widest flex items-center gap-2 border active:scale-95 transition-all"
                >
                  <Play className="h-4 w-4 text-emerald-500 fill-emerald-500 animate-pulse" /> Launch Sandbox Checkout
                </Button>
              </motion.div>
            </div>

            {/* Right Side Code Terminal Console */}
            <div className="lg:col-span-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden"
              >
                {/* Window Header */}
                <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500/60" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/60" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
                  </div>
                  
                  {/* Language Selector Tabs */}
                  <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
                    {(['curl', 'nodejs', 'python'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${activeLang === lang ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {lang === 'curl' ? 'cURL' : lang === 'nodejs' ? 'Node.js' : 'Python'}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={handleCopy}
                    className="h-8 w-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    title="Copy Snippet"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Console Code Body */}
                <div className="p-6 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto max-h-[340px]">
                  <pre><code>{codeSnippets[activeLang]}</code></pre>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. DYNAMIC FEE & SETTLEMENT CALCULATOR */}
      <section className="py-24 border-b border-slate-900 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider"
            >
              <Calculator className="h-3 w-3" /> Live Cost Tool
            </motion.div>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight uppercase text-white">How we Cut the Money</h2>
            <p className="text-slate-400 font-medium text-sm leading-relaxed">
              Toggle our zero-interest subsidized modeling to calculate transaction settlements, platform commissions, and customer installment cycles instantly.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Input sliders card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Checkout Transaction Amount (₦)</label>
                <div className="flex gap-4">
                  <Input 
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(Math.max(1000, Number(e.target.value)))}
                    className="h-14 rounded-2xl border-slate-800 bg-slate-950 text-slate-100 text-lg font-black focus-visible:ring-primary focus-visible:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Subsidize Financing Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsSubsidized(true)}
                    className={`p-5 rounded-2xl border transition-all text-left group ${isSubsidized ? 'border-primary bg-primary/10 text-white' : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'}`}
                  >
                    <span className="font-black text-xs uppercase tracking-wider block mb-1">0% Interest Promo</span>
                    <span className="text-[10px] font-semibold opacity-75">5.5% Merchant fee. Drive sales.</span>
                  </button>
                  <button 
                    onClick={() => setIsSubsidized(false)}
                    className={`p-5 rounded-2xl border transition-all text-left group ${!isSubsidized ? 'border-primary bg-primary/10 text-white' : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'}`}
                  >
                    <span className="font-black text-xs uppercase tracking-wider block mb-1">Consumer Pay Interest</span>
                    <span className="text-[10px] font-semibold opacity-75">1.5% Merchant fee. User pays dynamic rate.</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Calculations display cards */}
            <div className="lg:col-span-7 grid sm:grid-cols-3 gap-6">
              
              {/* Card 1: What Merchant Receives */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 hover:border-slate-700 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Merchant Receives Upfront</p>
                  <p className="text-xl font-black text-white">₦{merchantPayout.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-1">Paid in 24 hours</p>
                </div>
              </div>

              {/* Card 2: Zenda Cut */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 hover:border-slate-700 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Play className="h-5 w-5 text-primary rotate-90" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Zenda Commission Cut</p>
                  <p className="text-xl font-black text-primary">₦{feeCapped.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-1">({(feeRate * 100).toFixed(1)}% flat transaction rate)</p>
                </div>
              </div>

              {/* Card 3: Customer pays */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 hover:border-slate-700 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Customer Splits Payments</p>
                  <p className="text-xl font-black text-white">₦{customerMonthly.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/mo</span></p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-1">Split in 3 months</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. BUSINESS BENEFITS */}
      <section className="py-24 border-b border-slate-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tight text-white mb-4">Why Partner with Zenda?</h2>
            <p className="text-slate-400 font-medium text-sm max-w-2xl mx-auto">
              Join e-commerce platforms using Zenda's Installment gateway to spike conversion limits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Building2, 
                title: 'B2B Procurement', 
                desc: 'Enable business clients to source office gadgets in bulk using organization lines.' 
              },
              { 
                icon: Code2, 
                title: 'Drop-In Checkout SDKs', 
                desc: 'Quick widgets optimized for React, Next.js, and WooCommerce storefront integrations.' 
              },
              { 
                icon: Shield, 
                title: 'Zero Collection Risk', 
                desc: 'Zenda manages dynamic customer underwriting, automated card auto-debiting, and default collections.' 
              },
            ].map((perk, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 hover:shadow-xl transition-all group"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <perk.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-md font-black text-white mb-3 uppercase tracking-wide">{perk.title}</h3>
                <p className="text-slate-400 font-medium text-xs leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WEB INTEGRATION FLOWS (SANDBOX MODAL DIALOG) */}
      <AnimatePresence>
        {isSandboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-slate-950 p-6 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Sandbox Checkout Mode</p>
                </div>
                <button 
                  onClick={() => setIsSandboxOpen(false)}
                  className="h-8 w-8 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 flex-1">
                {sandboxStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                        <Terminal className="h-6 w-6" />
                      </div>
                      <h4 className="font-black text-white text-lg uppercase">Start Zenda Checkout</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        This simulates the secure buyer verification gate. Zenda underwrites customer risk factors prior to approving installments.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex justify-between text-[11px] font-bold text-slate-400">
                        <span>Checkout Purchase Total:</span>
                        <span className="text-white">₦{testAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-400">
                        <span>Financing Split Term:</span>
                        <span className="text-white">3 Months Payment Plan</span>
                      </div>
                    </div>

                    <Button 
                      onClick={triggerSimulation}
                      disabled={loadingSimulation}
                      className="w-full h-14 rounded-xl bg-primary text-white font-black hover:bg-primary/95 text-xs uppercase tracking-widest flex items-center justify-center"
                    >
                      {loadingSimulation ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {loadingSimulation ? 'Performing Risk Underwriting...' : 'Authenticate Simulated Buyer'}
                    </Button>
                  </div>
                )}

                {sandboxStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-6 w-6" />
                      </div>
                      <h4 className="font-black text-white text-lg uppercase">Credit Limits Assessed</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Assess simulated customer risk indexes and verify credit tiers.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                          <span>Verified Risk Rating</span>
                          <span className="text-indigo-400">{sandboxRisk} / 100</span>
                        </div>
                        <input 
                          type="range"
                          min="10"
                          max="100"
                          value={sandboxRisk}
                          onChange={(e) => setSandboxRisk(Number(e.target.value))}
                          className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-primary border border-slate-800"
                        />
                      </div>

                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex justify-between text-[11px] font-bold text-slate-400">
                          <span>Dynamic Credit Rating:</span>
                          <span className={sandboxRisk >= 50 ? 'text-emerald-400' : 'text-rose-400'}>
                            {sandboxRisk >= 75 ? 'Low Risk (Platinum)' : sandboxRisk >= 50 ? 'Medium Risk (Bronze)' : 'High Risk (Declined)'}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-400">
                          <span>Max Finance Limit:</span>
                          <span className="text-white">₦{(sandboxRisk * 5000).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={completeSimulation}
                      disabled={sandboxRisk < 50}
                      className="w-full h-14 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-700 text-xs uppercase tracking-widest"
                    >
                      {sandboxRisk < 50 ? 'Credit Denied (Risk too high)' : 'Authorize Installment Contract'}
                    </Button>
                  </div>
                )}

                {sandboxStep === 3 && (
                  <div className="space-y-6 text-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                      <Check className="h-8 w-8 stroke-[3]" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-white text-lg uppercase">Transaction Approved!</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                        Installment contract is active! Merchant receives payout. Zenda triggers webhook event pushes to your server:
                      </p>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-left font-mono text-[10px] text-emerald-400 space-y-2 overflow-x-auto max-h-[140px]">
                      <p className="text-slate-500">// Webhook POST Event</p>
                      <pre>{`{
  "event": "installment.approved",
  "payload": {
    "merchantId": "merch_0a8bc",
    "amount": ${testAmount},
    "settlementAmount": ${merchantPayout},
    "payoutStatus": "pending_escrow"
  }
}`}</pre>
                    </div>

                    <Button 
                      onClick={() => setIsSandboxOpen(false)}
                      className="w-full h-14 rounded-xl bg-slate-950 text-slate-300 font-bold border border-slate-800 hover:bg-slate-900 text-xs uppercase tracking-widest"
                    >
                      Return to Console
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. CALL TO ACTION SECTION */}
      <section className="py-32 relative overflow-hidden bg-slate-950 text-center">
        <div className="container mx-auto px-4 max-w-7xl relative z-10 space-y-8">
          <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-white uppercase">Ready to scale conversions?</h2>
          <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto">
            Create your business merchant account and obtain API tokens in seconds.
          </p>
          <Link to="/register?type=merchant">
            <Button size="lg" className="h-16 rounded-2xl bg-primary px-12 text-sm font-black text-white hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest">
              Create Partner Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

