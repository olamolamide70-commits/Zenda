import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, CreditCard, CheckCircle, Star, Smartphone, Laptop, Tablet, Headphones, Loader2, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/services';
import { motion, Variants } from 'framer-motion';
import { useMemo } from 'react';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const steps = [
  { icon: Smartphone, title: 'Pick Your Gadget', desc: 'Check out our shop for the best gadgets from top brands.' },
  { icon: CreditCard, title: 'Choose a Plan', desc: 'Pick a simple payment plan — pay daily, weekly, or monthly.' },
  { icon: CheckCircle, title: 'Get Approved Instantly', desc: 'Quick approval process. No hidden fees, no surprises.' },
  { icon: Shield, title: 'Enjoy Your Device', desc: 'Receive your gadget and pay comfortably over time.' },
];

const benefits = [
  { icon: Clock, title: 'Flexible Schedules', desc: 'Daily, weekly, or monthly — you choose your payment rhythm.' },
  { icon: Shield, title: 'Zero Hidden Fees', desc: 'Transparent pricing with no surprise charges.' },
  { icon: CreditCard, title: 'Instant Approval', desc: 'Get approved in minutes with our streamlined process.' },
];

const testimonials = [
  { name: 'Sarah M.', role: 'Designer', text: 'Zenda made it possible to get my MacBook Pro without breaking the bank. The monthly payments are very manageable!', rating: 5 },
  { name: 'James K.', role: 'Developer', text: 'I couldn\'t afford a new laptop upfront. Zenda let me get one and pay weekly. Incredible service!', rating: 5 },
  { name: 'Amara O.', role: 'Business Owner', text: 'I got phones for my whole team. Being able to pay bit by bit is a life saver.', rating: 5 },
];

const categories = [
  { icon: Laptop, label: 'Laptops', count: 24 },
  { icon: Smartphone, label: 'Phones', count: 36 },
  { icon: Tablet, label: 'Tablets', count: 18 },
  { icon: Headphones, label: 'Accessories', count: 42 },
];

export default function Home() {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getAll()
  });

  const products = useMemo(() => productsData || [], [productsData]);
  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);

  // Dynamic category counts from real data
  const dynamicCategories = useMemo(() => [
    { icon: Laptop, label: 'Laptops', count: products.filter((p: any) => p.category === 'Laptops').length || 0 },
    { icon: Smartphone, label: 'Phones', count: products.filter((p: any) => p.category === 'Phones').length || 0 },
    { icon: Tablet, label: 'Tablets', count: products.filter((p: any) => p.category === 'Tablets').length || 0 },
    { icon: Headphones, label: 'Accessories', count: products.filter((p: any) => ['Accessories', 'Audio', 'Wearables'].includes(p.category)).length || 0 },
  ], [products]);
  return (
    <div className="bg-white min-h-screen selection:bg-primary/10">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-40 mesh-gradient-premium">
        {/* Elite Background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[150px] rounded-full animate-pulse delay-700" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={fadeIn}
              className="text-left"
            >
              <h1 className="mb-8 text-6xl font-black leading-[1.05] tracking-[-0.04em] text-foreground md:text-7xl lg:text-8xl text-balance">
                Ownership for <br />
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent italic pr-4">everyone.</span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-12 text-xl text-muted-foreground/80 max-w-xl leading-relaxed font-medium text-balance"
              >
                Get the latest premium gadgets and pay in easy, stress-free installments. 
                <span className="block text-primary font-black mt-4 uppercase tracking-[0.2em] text-xs">Empowering Your Digital Lifestyle.</span>
              </motion.p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/marketplace">
                  <Button className="h-16 px-10 rounded-2xl bg-primary text-white font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 text-base uppercase tracking-widest group">
                    <ShoppingBag className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" /> Start Shopping
                  </Button>
                </Link>
                <Link to="/calculator">
                  <Button variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white/50 backdrop-blur-md text-foreground font-bold hover:bg-white transition-all text-base shadow-premium uppercase tracking-widest">
                    See Plans
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-8 border-t border-slate-100 pt-10">
                <div>
                  <p className="text-3xl font-black text-foreground tracking-tight">15k+</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Happy Users</p>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <div>
                  <p className="text-3xl font-black text-foreground tracking-tight">98%</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Approval Rate</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white/50 backdrop-blur-sm">
                <img 
                  src="/hero-gadgets.png" 
                  alt="Premium Gadgets" 
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-1000"
                />
              </div>
              {/* Floating badges for extra premium feel */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 z-20 bg-white p-6 rounded-3xl shadow-premium border border-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Certified</p>
                    <p className="text-xs font-bold text-foreground">Gadget Assurance</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 z-20 bg-white p-6 rounded-3xl shadow-premium border border-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secure</p>
                    <p className="text-xs font-bold text-foreground">Flexible Payments</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative z-10 -mt-10 mb-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-4 md:grid-cols-4"
          >
            {dynamicCategories.map(cat => (
              <motion.div key={cat.label} variants={fadeIn}>
                <Link to={`/marketplace?category=${cat.label}`} className="group relative flex items-center gap-4 rounded-2xl border border-border bg-white p-5 transition-all hover:border-primary/50 shadow-sm hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:bg-primary/10">
                    <cat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-foreground uppercase">{cat.label}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{cat.count}+ units</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">Top Picks</p>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">Trending Gadgets</h2>
              <p className="mt-4 text-xl font-medium text-muted-foreground/60">Check out our most popular items available on easy payment plans.</p>
            </div>
            <Link to="/marketplace">
              <Button variant="link" className="h-12 text-base font-bold text-primary p-0">
                Browse Full Catalog <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[400px] rounded-3xl bg-slate-50 border border-border animate-pulse" />
              ))
            ) : (
              featuredProducts.map((product, i) => (
                <motion.div 
                  key={product.id} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50/50 py-32">
        <div className="container mx-auto px-4">
          <div className="mb-20 text-center">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">How it works</p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">Four easy steps</h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl font-medium text-muted-foreground/60">Getting your dream gadget is as simple as 1, 2, 3, 4.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div 
                key={i} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={fadeIn}
                transition={{ delay: i * 0.1 }}
                className="text-center bg-white p-10 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all"
              >
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
                  <step.icon className="h-10 w-10" />
                </div>
                <h3 className="mb-4 text-xl font-black tracking-tight text-foreground uppercase text-[12px] tracking-widest">{step.title}</h3>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground/60">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="mb-20">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">Why choose us</p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">The Zenda way</h2>
            <p className="mt-4 text-xl font-medium text-muted-foreground/60">We make it easy for you to own the best technology.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((b, i) => (
              <motion.div 
                key={i} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={fadeIn}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl border border-border bg-white p-10 transition-all hover:bg-slate-50"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
                  <b.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-4 text-xl font-black tracking-tight text-foreground uppercase text-[12px] tracking-widest">{b.title}</h3>
                <p className="text-base font-medium leading-relaxed text-muted-foreground/60">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50/50 py-32">
        <div className="container mx-auto px-4">
          <div className="mb-20 text-center">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">Wall of fame</p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">What our customers say</h2>
            <p className="mt-4 text-lg text-muted-foreground/60 font-medium max-w-2xl mx-auto">
              Join thousands of Nigerians using Zenda to upgrade their lives with smart, manageable payments.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={fadeIn}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl border border-border bg-white p-10 shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-6 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-10 text-lg font-medium leading-relaxed text-muted-foreground/80">{t.text}</p>
                <div>
                  <p className="font-bold tracking-tight text-foreground uppercase text-[10px] tracking-widest">{t.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="relative rounded-[3rem] bg-primary py-24 px-10 lg:py-32 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-slate-50 opacity-[0.05] pointer-events-none" />
            <h2 className="mb-8 text-4xl font-black tracking-tighter text-white lg:text-7xl leading-none">
              Get your gadget today.
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-xl font-bold text-white/60 leading-relaxed italic">
              Don't let anything hold you back. Upgrade your tech now and pay as you go.
            </p>
            <Link to="/register">
              <Button size="lg" className="h-20 rounded-2xl bg-white px-16 text-xl font-black text-primary hover:bg-slate-50 transition-all shadow-xl uppercase tracking-widest">
                Sign Up Now <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
