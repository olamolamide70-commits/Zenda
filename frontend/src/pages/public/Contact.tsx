import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const contactInfo = [
  { icon: Mail, label: 'Support Email', value: 'hello@Zenda.com.ng', desc: 'Our team is here to help.' },
  { icon: Phone, label: 'Phone Number', value: '+234 801 000 0000', desc: 'Mon-Fri from 8am to 5pm.' },
  { icon: MapPin, label: 'Campus Office', value: 'LASUSTECH Ikorodu, Lagos', desc: 'Visit us for a consultation.' },
];

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Your message has been sent successfully! We will get back to you soon.');
  };

  return (
    <div className="py-24 lg:py-40 bg-[#F9FAFB] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] -z-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-black text-foreground lg:text-9xl tracking-tighter"
          >
            Get in <span className="text-primary/40 italic">touch.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-12 text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed md:text-2xl"
          >
            Have a question? We're here to help. Send us a message and we'll get back to you soon.
          </motion.p>
        </div>

        <div className="mx-auto mt-32 grid max-w-6xl gap-16 lg:grid-cols-3">
          <div className="space-y-8">
            {contactInfo.map((c, i) => (
              <motion.div 
                key={c.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col gap-6 rounded-[2.5rem] border border-border bg-white p-10 shadow-sm transition-all hover:bg-slate-50 hover:border-primary/20"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <c.icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">{c.label}</p>
                  <p className="text-2xl font-black text-foreground tracking-tighter underline decoration-primary/20 underline-offset-8">{c.value}</p>
                  <p className="mt-5 text-lg font-medium text-slate-500 leading-relaxed italic">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.form 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit} 
            className="group relative space-y-12 rounded-[3.5rem] border border-border bg-white p-12 shadow-sm lg:col-span-2"
          >
            <div className="relative grid gap-10 sm:grid-cols-2">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-5">Full Name</Label>
                <Input placeholder="Ayomide Makinde" className="h-20 px-8 bg-slate-50 border-none rounded-2xl text-foreground focus:ring-primary/20 transition-all font-bold placeholder:text-slate-500 text-lg shadow-inner" required />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-5">Email</Label>
                <Input type="email" placeholder="ayomide@example.com" className="h-20 px-8 bg-slate-50 border-none rounded-2xl text-foreground focus:ring-primary/20 transition-all font-bold placeholder:text-slate-500 text-lg shadow-inner" required />
              </div>
            </div>
            <div className="relative space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-5">Subject</Label>
              <Input placeholder="How can we help you?" className="h-20 px-8 bg-slate-50 border-none rounded-2xl text-foreground focus:ring-primary/20 transition-all font-bold placeholder:text-slate-500 text-lg shadow-inner" required />
            </div>
            <div className="relative space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-5">Message</Label>
              <Textarea 
                placeholder="Write your message here..." 
                className="min-h-[250px] px-8 py-8 bg-slate-50 border-none rounded-3xl text-foreground focus:ring-primary/20 transition-all font-bold resize-none placeholder:text-slate-500 text-lg shadow-inner" 
                required 
              />
            </div>
            <div className="relative pt-6">
              <Button type="submit" className="h-24 w-full rounded-2xl bg-primary text-2xl font-black text-white transition-all hover:bg-primary/90 shadow-xl group/btn uppercase tracking-widest">
                <Send className="mr-6 h-8 w-8 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-2 transition-transform" /> Send Message
              </Button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
