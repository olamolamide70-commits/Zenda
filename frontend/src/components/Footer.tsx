import { Link } from 'react-router-dom';
import { Laptop } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-slate-50 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-primary/[0.02] blur-[80px] -z-10" />
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid gap-16 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="mb-8 flex items-center gap-4 font-bold text-foreground tracking-tighter transition-all hover:scale-[1.02] w-fit">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-xl rotate-6">
                <Laptop className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-black uppercase tracking-tighter text-foreground">ZENDA<span className="text-primary">.</span></span>
            </Link>
            <p className="text-base font-medium text-slate-500 leading-relaxed max-w-xs italic">
              We help every Nigerian get the gadgets they need with easy monthly payments. No jargon, no stress.
            </p>
          </div>
          <div>
            <h4 className="mb-10 text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Links</h4>
            <div className="flex flex-col gap-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <Link to="/marketplace" className="hover:text-primary transition-colors">Shop</Link>
              <Link to="/calculator" className="hover:text-primary transition-colors">Calculator</Link>
              <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link to="/developers" className="hover:text-primary transition-colors italic">Developer API</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-10 text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Legal</h4>
            <div className="flex flex-col gap-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <Link to="/contact" className="hover:text-primary transition-colors">Support</Link>
              <Link to="/about" className="hover:text-primary transition-colors">About</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-10 text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Contact</h4>
            <div className="flex flex-col gap-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <p className="hover:text-primary transition-colors cursor-pointer lowercase">hello@Zenda.com.ng</p>
              <p className="hover:text-primary transition-colors cursor-pointer">+234 801 000 0000</p>
              <p className="text-slate-400 italic">Global Logistics Center, Lagos</p>
            </div>
          </div>
        </div>
        <div className="mt-24 border-t border-border/50 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            © {new Date().getFullYear()} Zenda. <span className="text-primary/40 italic">Accelerating progress.</span>
          </p>
          <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">
            <span className="hover:text-primary cursor-pointer transition-colors hover:scale-110">Insta</span>
            <span className="hover:text-primary cursor-pointer transition-colors hover:scale-110">X Corp</span>
            <span className="hover:text-primary cursor-pointer transition-colors hover:scale-110">Node</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
