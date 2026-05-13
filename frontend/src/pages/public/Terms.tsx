import { motion } from 'framer-motion';
import { Shield, FileText, Lock, AlertCircle } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: "1. Acceptance of Terms",
    content: "By accessing and using Zenda, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services."
  },
  {
    icon: Shield,
    title: "2. Eligibility",
    content: "Our services are available to all Nigerians aged 18 and above. By creating an account, you represent and warrant that you meet these eligibility requirements and provide accurate information."
  },
  {
    icon: Lock,
    title: "3. User Accounts",
    content: "You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility. Please notify us immediately of any unauthorized use."
  },
  {
    icon: AlertCircle,
    title: "4. Payments & Installments",
    content: "Zenda provides flexible payment plans. You agree to make timely payments according to your chosen schedule (Daily, Weekly, or Monthly). Failure to pay may result in service restrictions or debt recovery actions."
  },
  {
    icon: FileText,
    title: "5. KYC & Verification",
    content: "To access higher credit limits, you must complete our Know Your Customer (KYC) process by providing a valid government-issued ID (NIN, Passport, or Voter Card)."
  },
  {
    icon: Shield,
    title: "6. Privacy",
    content: "Your use of Zenda is also governed by our Privacy Policy. We are committed to protecting your personal data and using it only as described in our policy."
  },
  {
    icon: AlertCircle,
    title: "7. Governing Law",
    content: "These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes will be resolved in the appropriate courts within Nigeria."
  }
];

export default function Terms() {
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
            Terms of <span className="text-primary/40 italic">Service.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground/60 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Please read these terms carefully before using Zenda. We believe in transparency and fair use for every Nigerian.
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
