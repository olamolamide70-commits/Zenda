import { Shield, Users, Globe, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '₦5B+', label: 'Gadgets Financed' },
  { value: '99%', label: 'Approval Rate' },
  { value: '4.9/5', label: 'User Rating' },
];

const values = [
  { icon: Shield, title: 'Trust & Transparency', desc: 'No hidden fees. Transparent payment structures for our student community.' },
  { icon: Users, title: 'Community Driven', desc: 'Our support team understands student needs and is here to help 24/7.' },
  { icon: Globe, title: 'Country Reach', desc: 'Making premium technology accessible across all major Nigerian cities.' },
  { icon: Award, title: 'Certified Partners', desc: 'Only genuine products sourced from authorized manufacturers and dealers.' },
];

export default function About() {
  return (
    <div className="py-24 lg:py-40 bg-[#F9FAFB] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] -z-10" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl font-black text-foreground lg:text-9xl tracking-tighter"
          >
            Get the tech <span className="text-primary/40 italic">you need.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-12 text-xl text-muted-foreground/60 font-medium max-w-3xl mx-auto leading-relaxed md:text-2xl"
          >
            Zenda helps every Nigerian get the gadgets they need with easy monthly payments. We make premium technology affordable for everyone.
          </motion.p>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-[2.5rem] border border-border bg-white p-10 text-center shadow-sm transition-all hover:bg-slate-50 hover:border-primary/20"
            >
              <p className="relative text-4xl font-black text-foreground group-hover:text-primary transition-colors tracking-tighter">{s.value}</p>
              <p className="relative mt-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-40">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center text-4xl font-black text-foreground tracking-tighter md:text-6xl uppercase text-[12px] tracking-[0.3em] text-primary/60"
          >
            What we believe in
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-2">
            {values.map((v, i) => (
              <motion.div 
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col sm:flex-row gap-8 rounded-[3rem] border border-border bg-white p-10 shadow-sm transition-all hover:bg-slate-50 hover:border-primary/20"
              >
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <v.icon className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight mb-4 uppercase text-[12px] tracking-widest text-primary/60">{v.title}</h3>
                  <p className="text-lg font-medium text-muted-foreground/60 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
