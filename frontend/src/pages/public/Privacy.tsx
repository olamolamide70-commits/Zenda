import { motion } from 'framer-motion';
import { Lock, Eye, Shield, Users } from 'lucide-react';

const sections = [
  {
    icon: Lock,
    title: "1. Data Collection",
    content: "We collect information you provide directly to us when creating an account, such as your name, email, and identification documents for KYC purposes."
  },
  {
    icon: Eye,
    title: "2. How We Use Data",
    content: "Your data is used to verify your identity, process installments, improve our services, and communicate important updates regarding your account."
  },
  {
    icon: Shield,
    title: "3. Data Protection",
    content: "We implement industry-standard security measures to protect your personal information from unauthorized access, loss, or disclosure."
  },
  {
    icon: Users,
    title: "4. Information Sharing",
    content: "We do not sell your personal data. We may share information with trusted partners (e.g., payment processors) only to facilitate our services."
  },
  {
    icon: Lock,
    title: "5. Your Rights",
    content: "Every Nigerian using Zenda has the right to access, correct, or request deletion of their personal data. Contact our support team for any privacy concerns."
  }
];

export default function Privacy() {
  return (
    <div className="py-24 lg:py-40 bg-[#F9FAFB] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] -z-10" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black text-foreground lg:text-8xl tracking-tighter mb-8"
          >
            Privacy <span className="text-primary/40 italic">Policy.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground/60 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Your privacy is our priority. Learn how we handle your data with transparency and care.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, i) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-[2.5rem] border border-border bg-white p-10 shadow-sm transition-all hover:bg-slate-50 hover:border-primary/20"
            >
              <div className="flex items-start gap-8">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <section.icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight mb-4 uppercase text-[12px] tracking-widest text-primary/60">
                    {section.title}
                  </h3>
                  <p className="text-lg font-medium text-muted-foreground/60 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">
            Last Updated: March 20, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
