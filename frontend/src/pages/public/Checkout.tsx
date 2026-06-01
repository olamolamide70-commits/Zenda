import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle, Loader2, MapPin, User, Phone, Mail } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { orderService, installmentService } from '@/services';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const PAYMENT_MODES = [
  { id: 'direct', label: 'Pay Outright', desc: 'Pay the full amount now', icon: '💳' },
  { id: 'monthly', label: 'Monthly (12 months)', desc: 'Spread over 12 months at 5% interest', icon: '📅' },
  { id: 'weekly', label: 'Weekly (6 months)', desc: 'Spread over 26 weeks at 5% interest', icon: '🗓️' },
  { id: 'daily', label: 'Daily (3 months)', desc: 'Spread over 90 days at 5% interest', icon: '⏱️' },
];

export default function Checkout() {
  const { cart, cartTotal, isAuthenticated, user } = useApp();
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState('direct');
  const [isPlacing, setIsPlacing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const interest = paymentMode !== 'direct' ? cartTotal * 0.05 : 0;
  const total = cartTotal + interest;
  const installmentMap: Record<string, { months: number; divisor: number; freq: string }> = {
    monthly: { months: 12, divisor: 12, freq: 'monthly' },
    weekly: { months: 6, divisor: 26, freq: 'weekly' },
    daily: { months: 3, divisor: 90, freq: 'daily' },
  };
  const plan = installmentMap[paymentMode];
  const periodicAmount = plan ? Math.ceil(total / plan.divisor) : total;

  const handlePlaceOrder = async () => {
    if (!form.fullName || !form.phone || !form.address || !form.city) {
      toast.error('Please fill in all required delivery fields');
      return;
    }

    try {
      setIsPlacing(true);

      for (const { product, quantity } of cart) {
        const orderData = {
          productId: product.id,
          quantity,
          totalAmount: product.price * quantity,
          paymentPlan: paymentMode,
          deliveryAddress: `${form.address}, ${form.city}, ${form.state}`,
          phoneNumber: form.phone,
        };

        if (paymentMode === 'direct') {
          await orderService.create(orderData);
        } else {
          await installmentService.create({
            productId: product.id,
            duration: plan.months,
            frequency: plan.freq,
          });
        }
      }

      toast.success('🎉 Order placed successfully!');
      navigate('/dashboard/orders');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-24 lg:py-40">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link
          to="/cart"
          className="mb-12 inline-flex items-center gap-3 text-sm font-bold text-muted-foreground/60 hover:text-primary transition-all group uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Cart
        </Link>

        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Final Step</p>
          <h1 className="text-5xl font-black text-foreground tracking-tight">Checkout</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Details */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-premium">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-black text-foreground tracking-tight">Delivery Information</h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  { key: 'fullName', label: 'Full Name *', icon: User, placeholder: 'John Doe' },
                  { key: 'phone', label: 'Phone Number *', icon: Phone, placeholder: '+234 800 000 0000' },
                  { key: 'email', label: 'Email Address', icon: Mail, placeholder: 'you@email.com' },
                  { key: 'city', label: 'City *', icon: MapPin, placeholder: 'Lagos' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{f.label}</label>
                    <div className="relative">
                      <f.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={(form as any)[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                      />
                    </div>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Delivery Address *</label>
                  <textarea
                    placeholder="House number, street, landmark..."
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    rows={3}
                    className="w-full p-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">State</label>
                  <select
                    value={form.state}
                    onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-sm"
                  >
                    <option value="">Select State</option>
                    {['Lagos', 'Abuja', 'Kano', 'Oyo', 'Rivers', 'Delta', 'Ogun', 'Enugu', 'Anambra', 'Kaduna'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Plan */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-premium">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-black text-foreground tracking-tight">Payment Method</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {PAYMENT_MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setPaymentMode(mode.id)}
                    className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
                      paymentMode === mode.id
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    {paymentMode === mode.id && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="h-5 w-5 text-primary fill-primary/20" />
                      </div>
                    )}
                    <div className="text-2xl mb-2">{mode.icon}</div>
                    <p className="font-black text-foreground tracking-tight text-sm">{mode.label}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest">{mode.desc}</p>
                    {mode.id !== 'direct' && plan && paymentMode === mode.id && (
                      <p className="mt-3 text-lg font-black text-primary">
                        {formatCurrency(periodicAmount)}
                        <span className="text-xs font-bold text-muted-foreground">
                          /{mode.id === 'daily' ? 'day' : mode.id === 'weekly' ? 'week' : 'mo'}
                        </span>
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-premium space-y-6">
              <h2 className="text-xl font-black text-foreground tracking-tight">Order Summary</h2>

              <div className="space-y-3 border-b border-slate-100 pb-5">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3">
                    <div className="h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                      {(product.image_url || product.image) ? (
                        <img
                          src={(product.image_url || product.image)!}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : <div className="h-full w-full flex items-center justify-center text-xl">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm line-clamp-1">{product.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">qty: {quantity}</p>
                    </div>
                    <p className="font-black text-primary text-sm">{formatCurrency(product.price * quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-muted-foreground uppercase tracking-widest">Subtotal</span>
                  <span className="font-black">{formatCurrency(cartTotal)}</span>
                </div>
                {interest > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-muted-foreground uppercase tracking-widest">Interest (5%)</span>
                    <span className="font-bold text-amber-600">{formatCurrency(interest)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-muted-foreground uppercase tracking-widest">Delivery</span>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 mt-2">
                  <span className="font-black uppercase tracking-widest text-sm">Total</span>
                  <span className="text-xl font-black text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  Secure checkout · Buyer protection guaranteed
                </p>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                {isPlacing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {paymentMode === 'direct' ? 'Place Order' : 'Start Installment Plan'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
