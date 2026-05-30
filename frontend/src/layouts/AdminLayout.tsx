import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingBag, CreditCard, DollarSign, BarChart3, LogOut, Laptop, Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const sidebarItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Installments', to: '/admin/installments', icon: CreditCard },
  { label: 'Transactions', to: '/admin/transactions', icon: DollarSign },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const sidebar = (
    <div className="flex h-full flex-col border-r border-primary/5 bg-background shadow-premium">
      <div className="flex h-20 items-center gap-3 px-6 border-b border-primary/10 bg-primary/[0.02]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-premium ring-1 ring-primary/20">
          <Laptop className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-lg font-bold text-foreground leading-none">Zenda</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">Admin</span>
        </div>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-8">
        {sidebarItems.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
                active 
                  ? 'bg-primary/10 text-primary shadow-premium ring-1 ring-primary/20' 
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
              }`}>
              <item.icon className={`h-5 w-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-primary/5 p-4">
        <button onClick={handleLogout} className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background mesh-bg">
      <aside className="hidden w-72 flex-shrink-0 lg:block">{sidebar}</aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/95" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 h-full shadow-premium animate-in slide-in-from-left duration-300">{sidebar}</aside>
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-20 items-center border-b border-primary/5 bg-background px-8 shadow-sm">
          <Button variant="ghost" size="icon" className="lg:hidden text-foreground hover:bg-primary/5 mr-4" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="font-display text-lg font-bold text-foreground">Admin Panel</h1>
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
