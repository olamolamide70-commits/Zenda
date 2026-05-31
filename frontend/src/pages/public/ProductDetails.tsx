import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, CreditCard, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categoryIcons } from '@/utils/mockData';
import { formatCurrency } from '@/utils/helpers';
import { useApp } from '@/context/AppContext';
import { productService, insuranceService, installmentService } from '@/services';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';

const plans = [
  { label: 'Daily (3 months)', months: 3, freq: 'day', divisor: 90 },
  { label: 'Weekly (6 months)', months: 6, freq: 'week', divisor: 26 },
  { label: 'Monthly (12 months)', months: 12, freq: 'month', divisor: 12 },
];

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, user, isAuthenticated } = useApp();
  const [selectedInsurance, setSelectedInsurance] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mainImgError, setMainImgError] = useState(false);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id!),
    enabled: !!id
  });

  const { data: insurancePlans } = useQuery({
    queryKey: ['insurancePlans'],
    queryFn: () => insuranceService.getPlans().then(res => res.data)
  });

  const handleAddToCart = () => { if (product) { addToCart(product); toast.success('Added to cart!'); } };

  const handleCreatePlan = async (duration: number, frequency: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to start a payment plan');
      navigate('/login');
      return;
    }

    if (!user?.nin || !user?.bvn) {
      toast.error('KYC Required: Please complete your profile by adding your Bank Verification Number (BVN) and National Identification Number (NIN) to use installments.');
      navigate('/dashboard/profile');
      return;
    }

    try {
      setIsCreating(true);
      const { data } = await installmentService.create({
        productId: id,
        duration,
        frequency,
        insuranceId: selectedInsurance?.id
      });
      toast.success('Payment plan started!');
      navigate(`/dashboard/installments/${data.plan.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start plan');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 lg:py-40 min-h-screen bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <Skeleton className="h-6 w-32 mb-12" />
          <div className="grid gap-16 lg:grid-cols-2">
            <Skeleton className="aspect-square rounded-[3rem]" />
            <div className="space-y-8">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-40 w-full rounded-[2.5rem]" />
              <div className="flex gap-6">
                <Skeleton className="h-16 flex-1 rounded-2xl" />
                <Skeleton className="h-16 flex-1 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-40 text-center">
        <p className="text-4xl mb-6 text-muted-foreground/40">📦</p>
        <h2 className="text-4xl font-black text-foreground tracking-tight">Product not found</h2>
        <p className="mt-4 text-xl font-medium text-muted-foreground">We couldn't find the product you're looking for.</p>
        <Link to="/marketplace">
          <Button variant="outline" className="mt-12 h-16 px-12 rounded-2xl border-slate-100 text-lg font-bold hover:bg-slate-50 shadow-premium">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-24 lg:py-40 min-h-screen bg-[#F9FAFB] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] -z-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <Link to="/marketplace" className="mb-12 inline-flex items-center gap-3 text-sm font-bold text-muted-foreground/60 hover:text-primary transition-all group uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Shop
        </Link>
 
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Image */}
          <div className="flex aspect-square items-center justify-center rounded-[3rem] border border-slate-100 bg-white overflow-hidden shadow-premium transition-transform hover:scale-[1.01] duration-500">
            {product.image_url && !mainImgError ? (
              <img 
                src={product.image_url.startsWith('http') 
                  ? product.image_url 
                  : `${import.meta.env.VITE_IMAGE_BASE_URL}${product.image_url}`} 
                alt={product.name} 
                onError={() => setMainImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-6">
                <span className="text-[180px] drop-shadow-[0_20px_50px_rgba(29,78,216,0.1)] transition-transform hover:rotate-3 duration-700 select-none">
                  {categoryIcons[product.category] || '📦'}
                </span>
                <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/20">Elite Device</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit rounded-xl bg-primary/10 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {product.category}
            </div>
            <h1 className="mb-6 text-5xl font-black text-foreground lg:text-7xl tracking-tighter leading-[1.05]">{product.name}</h1>
            <div className="mb-10 flex items-center gap-8">
              <span className="text-xl font-bold text-muted-foreground/40 tracking-tight uppercase">{product.brand}</span>
              <div className="h-6 w-px bg-slate-100" />
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`h-5 w-5 ${s <= Math.floor(product.rating) ? 'fill-primary text-primary' : 'fill-slate-100 text-slate-100'}`} />
                  ))}
                </div>
                <span className="text-lg font-black text-foreground ml-1">{product.rating}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="mb-12 rounded-[2.5rem] border border-slate-100 bg-white p-10 group hover:border-primary/20 transition-all shadow-premium">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Price</p>
              <div className="mb-12 space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="text-6xl font-black text-foreground tracking-tighter">{formatCurrency(product.price)}</span>
                {(product.installment_eligible || product.installmentEligible) && (
                  <div className="text-2xl font-black text-primary italic tracking-tight">
                    or {formatCurrency(product.monthly_installment || product.monthlyInstallment || (product.price * 1.05 / 12))} <span className="text-[10px] uppercase not-italic font-bold">/mo</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 items-center pt-4">
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 border border-emerald-100">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Verified Seller</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2 border border-primary/10">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary">Quality Guaranteed</span>
                </div>
              </div>
            </div>
            </div>

            <div className="mb-12 space-y-4">
              {product.description?.split('\n\n').map((para: string, i: number) => (
                <p key={i} className="text-xl text-muted-foreground leading-relaxed font-medium tracking-tight">{para}</p>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Button onClick={() => handleCreatePlan(12, 'monthly')} className="h-16 flex-1 gap-4 rounded-2xl bg-primary text-lg font-black text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                <CreditCard className="h-5 w-5" /> Pay in parts
              </Button>
              <Button variant="outline" className="h-16 gap-4 rounded-2xl border-slate-100 bg-white text-lg font-black text-foreground lg:px-12 transition-all hover:bg-slate-50 shadow-premium" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5" /> Add to cart
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="specs" className="mt-32">
          <TabsList className="h-14 bg-white p-1 rounded-[1.25rem] border border-slate-100 gap-2 inline-flex shadow-premium">
            <TabsTrigger value="specs" className="h-12 px-8 rounded-xl font-bold tracking-tight data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-[11px] uppercase">Features</TabsTrigger>
            <TabsTrigger value="plans" className="h-12 px-8 rounded-xl font-bold tracking-tight data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-[11px] uppercase">Payment Plans</TabsTrigger>
          </TabsList>
 
          <TabsContent value="specs" className="mt-12">
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 overflow-hidden shadow-premium">
              <div className="grid gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden">
                {Object.entries(product.specs || {}).map(([key, val], i) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between px-10 py-6 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary/40" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{key}</span>
                    </div>
                    <span className="text-xl font-bold text-foreground tracking-tight">{val as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
 
          <TabsContent value="plans" className="mt-12">
            <div className="mb-12 rounded-[2.5rem] border border-primary/10 bg-primary/5 p-10 shadow-premium">
              <div className="flex items-center gap-4 mb-6">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-black text-foreground tracking-tight">Insurance</h3>
              </div>
              <p className="text-muted-foreground font-medium mb-8">Protect your gadget from damage or theft with our easy insurance plans.</p>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div 
                  onClick={() => setSelectedInsurance(null)}
                  className={`cursor-pointer rounded-2xl border p-6 transition-all ${!selectedInsurance ? 'border-primary bg-white shadow-premium' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}
                >
                  <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">Basic</p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Standard warranty</p>
                  <p className="mt-4 text-xl font-black text-foreground">₦0 <span className="text-[10px] text-muted-foreground">/mo</span></p>
                </div>
                {insurancePlans?.map((ins: any) => (
                  <div 
                    key={ins.id}
                    onClick={() => setSelectedInsurance(ins)}
                    className={`cursor-pointer rounded-2xl border p-6 transition-all ${selectedInsurance?.id === ins.id ? 'border-primary bg-white shadow-premium' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}
                  >
                    <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">{ins.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">{ins.description}</p>
                    <p className="mt-4 text-xl font-black text-foreground">{formatCurrency(ins.monthly_premium)} <span className="text-[10px] text-muted-foreground">/mo</span></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {plans.map(plan => {
                const interestDiscount = user?.interest_discount || 0;
                const baseRate = 0.05;
                const effectiveRate = Math.max(0, baseRate - (interestDiscount / 100));
                
                const interestMulti = (1 + effectiveRate * (plan.months / 12));
                const insurancePremium = selectedInsurance ? parseFloat(selectedInsurance.monthly_premium) : 0;
                
                const installment = Math.ceil(((product.price * interestMulti) + (insurancePremium * plan.months)) / plan.divisor);
                const total = installment * plan.divisor;

                return (
                  <div key={plan.label} className="group relative rounded-[2.5rem] border border-slate-100 bg-white p-10 transition-all hover:bg-slate-50 hover:border-primary/20 shadow-premium flex flex-col">
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-black text-foreground tracking-tight">{plan.label}</h3>
                        {interestDiscount > 0 && <Badge className="bg-emerald-500/10 text-emerald-600 border-none">-{interestDiscount}% Discount</Badge>}
                      </div>
                      <p className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">Pay every {plan.freq === 'day' ? 'day' : plan.freq === 'week' ? 'week' : 'month'}</p>
                    </div>
                    <div className="mb-10">
                      <p className="text-4xl font-black text-primary tracking-tighter">
                        {formatCurrency(installment)}
                        <span className="text-sm font-bold text-muted-foreground/40 tracking-normal"> /{plan.freq === 'day' ? 'day' : plan.freq === 'week' ? 'week' : 'mo'}</span>
                      </p>
                      <p className="mt-3 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">Total Price: {formatCurrency(total)}</p>
                    </div>
                    <div className="mb-10 space-y-4 flex-1">
                      {[1, 2, 3].map(item => (
                        <div key={item} className="flex items-center gap-4 text-sm font-bold text-muted-foreground/60">
                          <CheckCircle className="h-5 w-5 text-primary" /> {item === 1 ? 'No hidden fees' : item === 2 ? 'Instant approval' : 'Secure payments'}
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={() => handleCreatePlan(plan.months, plan.freq === 'day' ? 'daily' : plan.freq === 'week' ? 'weekly' : 'monthly')}
                      disabled={isCreating}
                      className="w-full h-14 rounded-xl bg-slate-50 text-slate-500 border border-slate-100 font-black uppercase text-[10px] tracking-widest transition-all hover:bg-primary hover:text-white hover:border-primary shadow-premium"
                    >
                      {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Choose This Plan'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recommendations */}
        <div className="mt-40">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl font-black text-foreground tracking-tight mb-2">You might also like</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Recommended for you</p>
            </div>
            <Link to="/marketplace" className="h-12 px-8 rounded-xl border border-slate-100 bg-white flex items-center justify-center font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:bg-slate-50 transition-all shadow-premium">
              Browse More
            </Link>
          </div>
          
          <Recommendations productId={id!} />
        </div>
      </div>
    </div>
  );
}

function Recommendations({ productId }: { productId: string }) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', productId],
    queryFn: async () => {
      const { data } = await api.get(`/ai/recommendations/${productId}`);
      return data;
    }
  });

  if (isLoading || !recommendations) return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {[1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {recommendations.map((product: any) => (
        <Link key={product.id} to={`/product/${product.id}`} className="group block h-full">
           <div className="h-full rounded-[2rem] border border-slate-100 bg-white p-8 transition-all hover:bg-white hover:border-primary/20 shadow-premium hover:shadow-2xl">
              <div className="aspect-square flex items-center justify-center rounded-2xl bg-slate-50 mb-6 overflow-hidden">
                {(product.image_url || product.imageUrl) && !imgErrors[product.id] ? (
                  <img 
                    src={(product.image_url || product.imageUrl).startsWith('http') 
                      ? (product.image_url || product.imageUrl) 
                      : `${import.meta.env.VITE_IMAGE_BASE_URL}${product.image_url || product.imageUrl}`} 
                    alt={product.name} 
                    onError={() => setImgErrors(prev => ({ ...prev, [product.id]: true }))}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-6xl drop-shadow-sm transition-transform group-hover:scale-110 duration-500">
                      {categoryIcons[product.category] || '📦'}
                    </span>
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">Premium Gadget</p>
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 opacity-60">{product.brand}</p>
              <h4 className="text-lg font-black text-foreground mb-2 line-clamp-1">{product.name}</h4>
              <p className="text-xl font-black text-primary">{formatCurrency(product.price)}</p>
           </div>
        </Link>
      ))}
    </div>
  );
}
