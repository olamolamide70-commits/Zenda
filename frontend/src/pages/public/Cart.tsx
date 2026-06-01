import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus, CreditCard, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

export default function Cart() {
  const { cart, removeFromCart, addToCart, cartTotal, cartCount, isAuthenticated } = useApp();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const installmentTotal = cartTotal * 1.05 / 12;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-24 lg:py-40">
      <div className="container mx-auto px-4">
        <Link
          to="/marketplace"
          className="mb-12 inline-flex items-center gap-3 text-sm font-bold text-muted-foreground/60 hover:text-primary transition-all group uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Shop
        </Link>

        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Your Selection</p>
          <h1 className="text-5xl font-black text-foreground tracking-tight">
            Shopping Cart
            {cartCount > 0 && (
              <span className="ml-4 inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white text-lg font-black">
                {cartCount}
              </span>
            )}
          </h1>
        </div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-border bg-white py-32 text-center shadow-premium"
          >
            <ShoppingCart className="h-16 w-16 text-muted-foreground/20 mb-6" />
            <h2 className="text-3xl font-black text-foreground tracking-tight">Your cart is empty</h2>
            <p className="mt-3 text-lg text-muted-foreground font-medium max-w-sm mx-auto">
              Start exploring our premium gadgets and add items to your cart.
            </p>
            <Link to="/marketplace" className="mt-10">
              <Button className="h-14 px-12 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20">
                <ShoppingBag className="mr-2 h-5 w-5" /> Browse Gadgets
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map(({ product, quantity }) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="flex gap-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-premium hover:border-primary/20 transition-all"
                  >
                    {/* Image */}
                    <div className="h-28 w-28 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                      {product.image_url || product.image ? (
                        <img
                          src={(product.image_url || product.image)!.startsWith('http')
                            ? (product.image_url || product.image)!
                            : `${import.meta.env.VITE_IMAGE_BASE_URL}${product.image_url || product.image}`}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-4xl">📦</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">{product.brand}</p>
                      <h3 className="font-black text-foreground tracking-tight text-lg line-clamp-1">{product.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">{product.category}</p>

                      <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(product.price * quantity)}</p>
                          {quantity > 1 && (
                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{formatCurrency(product.price)} each</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-1">
                            <button
                              onClick={() => {
                                if (quantity === 1) removeFromCart(product.id);
                                else {
                                  // decrease quantity — just remove and re-add with quantity-1
                                  removeFromCart(product.id);
                                  for (let i = 0; i < quantity - 1; i++) {
                                    setTimeout(() => addToCart(product), i * 10);
                                  }
                                }
                              }}
                              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-muted-foreground hover:text-foreground"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center font-black text-foreground text-sm">{quantity}</span>
                            <button
                              onClick={() => addToCart(product)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-muted-foreground hover:text-foreground"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => { removeFromCart(product.id); toast.info(`${product.name} removed`); }}
                            className="h-9 w-9 rounded-xl flex items-center justify-center border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-premium space-y-6">
                <h2 className="text-2xl font-black text-foreground tracking-tight">Order Summary</h2>

                <div className="space-y-3 border-b border-slate-100 pb-6">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium line-clamp-1 flex-1 mr-2">{product.name} × {quantity}</span>
                      <span className="font-bold text-foreground">{formatCurrency(product.price * quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Subtotal</span>
                    <span className="font-black text-foreground">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Delivery</span>
                    <span className="font-black text-emerald-600">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-3 mt-3">
                    <span className="font-black text-foreground uppercase tracking-widest text-sm">Total</span>
                    <span className="text-2xl font-black text-primary">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                {/* Installment preview */}
                <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Pay in Installments</p>
                  <p className="text-xl font-black text-foreground">
                    From <span className="text-primary">{formatCurrency(installmentTotal)}</span>
                    <span className="text-sm font-bold text-muted-foreground"> /mo</span>
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest">12-month plan at 5% interest</p>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  <CreditCard className="mr-2 h-5 w-5" /> Proceed to Checkout
                </Button>

                <Link to="/marketplace" className="block">
                  <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-foreground">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
