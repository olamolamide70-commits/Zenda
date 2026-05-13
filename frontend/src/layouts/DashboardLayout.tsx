import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, CreditCard, Receipt, Clock, Heart, User, Bell, Wallet, LogOut, Laptop, Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const sidebarOpenPlaceholder = false; 

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const getSidebarItems = () => {
    const role = user?.role || 'user';
    
    const common = [
      { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
      { label: 'My Profile', to: '/dashboard/profile', icon: User },
      { label: 'Alerts', to: '/dashboard/notifications', icon: Bell },
    ];

    if (role === 'vendor') {
      return [
        { label: 'Seller Home', to: '/dashboard/vendor', icon: LayoutDashboard },
        { label: 'My Store', to: '/admin/products', icon: ShoppingBag }, 
        { label: 'Sales Stats', to: '/admin/analytics', icon: Clock },
        ...common.filter(i => i.label !== 'My Page')
      ];
    }

    if (role === 'admin' || role === 'super_admin') {
      return [
        { label: 'Admin Panel', to: '/admin', icon: LayoutDashboard },
        { label: 'All Products', to: '/admin/products', icon: ShoppingBag },
        { label: 'All Users', to: '/admin/users', icon: User },
        ...common.filter(i => i.label !== 'My Page' && i.label !== 'My Profile')
      ];
    }

    if (role === 'customer_care') {
      return [
        { label: 'Support Home', to: '/dashboard/support', icon: LayoutDashboard },
        { label: 'Find User', to: '/admin/users', icon: User },
        { label: 'Track Orders', to: '/admin/orders', icon: ShoppingBag },
        ...common
      ];
    }

    // Default User
    return [
      { label: 'Home', to: '/dashboard', icon: LayoutDashboard },
      { label: 'My Orders', to: '/dashboard/orders', icon: ShoppingBag },
      { label: 'Payment Plans', to: '/dashboard/installments', icon: CreditCard },
      { label: 'History', to: '/dashboard/payments', icon: Clock },
      { label: 'Receipts', to: '/dashboard/receipts', icon: Receipt },
      { label: 'Wishlist', to: '/dashboard/wishlist', icon: Heart },
      { label: 'My Profile', to: '/dashboard/profile', icon: User },
      { label: 'Wallet', to: '/dashboard/payment-methods', icon: Wallet },
      { label: 'Notifications', to: '/dashboard/notifications', icon: Bell },
    ];
  };

  const sidebarItems = getSidebarItems();

  const sidebar = (
    <div className="flex h-full flex-col border-r border-border bg-white shadow-sm">
      <div className="flex h-20 items-center gap-3 px-6 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
          <Laptop className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-foreground">Zenda</span>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-8">
        {sidebarItems.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                active 
                  ? 'bg-primary/5 text-primary' 
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}>
              <item.icon className={`h-5 w-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <button onClick={handleLogout} className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 flex-shrink-0 lg:block">{sidebar}</aside>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 h-full shadow-xl animate-in slide-in-from-left duration-300">{sidebar}</aside>
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b border-border bg-white px-8 shadow-sm">
          <Button variant="ghost" size="icon" className="lg:hidden text-foreground hover:bg-secondary" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-6">
            <Link to="/dashboard/notifications" className="relative group rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-secondary hover:text-primary">
              <Bell className="h-6 w-6" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground leading-none">{user?.name || user?.email}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Verified</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-bold shadow-sm">
                {(user?.name || user?.email)?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
