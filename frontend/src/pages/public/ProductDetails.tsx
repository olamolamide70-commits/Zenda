import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, CreditCard, CheckCircle, Loader2, ShieldCheck, Palette, Heart, Share2, Copy, MessageCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categoryIcons } from '@/utils/mockData';
import { formatCurrency } from '@/utils/helpers';
import { useApp } from '@/context/AppContext';
import { productService, insuranceService, installmentService } from '@/services';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';

// Map common color names to actual CSS colors for the swatch + overlay
const COLOR_MAP: Record<string, string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  orange: '#f97316', purple: '#a855f7', pink: '#ec4899', cyan: '#06b6d4',
  teal: '#14b8a6', indigo: '#6366f1', white: '#f8fafc', black: '#0f172a',
  gray: '#94a3b8', grey: '#94a3b8', gold: '#f59e0b', silver: '#cbd5e1',
  'space gray': '#6b7280', 'deep purple': '#7c3aed', 'midnight': '#1e293b',
  'starlight': '#f1f5f9', 'alpine green': '#16a34a', 'sierra blue': '#38bdf8',
  'graphite': '#374151', 'rose gold': '#fb7185', 'coral': '#f87171',
};

function getColorHex(colorName: string): string {
  const lower = colorName.toLowerCase().trim();
  return COLOR_MAP[lower] || '#6366f1';
}

const plans = [
  { label: 'Daily (3 months)', months: 3, freq: 'day', divisor: 90 },
  { label: 'Weekly (6 months)', months: 6, freq: 'week', divisor: 26 },
  { label: 'Monthly (12 months)', months: 12, freq: 'month', divisor: 12 },
];

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, user, isAuthenticated } = useApp();
  const queryClient = useQueryClient();
  const [selectedInsurance, setSelectedInsurance] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mainImgError, setMainImgError] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [colorOverlay, setColorOverlay] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const isWishlisted = wishlist.some(w => w.id === id);

  const handleWishlistToggle = () => {
    if (!isAuthenticated) { toast.error('Sign in to save to wishlist'); return; }
    if (!product) return;
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist! ️');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product?.name || 'Check this out on Zenda', url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out ${product?.name} on Zenda! `);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) { toast.error('Sign in to leave a review'); return; }
    if (!reviewText.trim()) { toast.error('Please write a review'); return; }
    setIsSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewText });
      toast.success('Review submitted! Thank you ');
      setReviewText('');
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', id] });
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id!),
    enabled: !!id
  });

  useEffect(() => {
    if (product) {
      const allImages = product.images && product.images.length > 0
        ? product.images
        : product.image_url
          ? [product.image_url]
          : product.image
            ? [product.image]
            : [];
      setActiveImage(allImages[0] || null);

      const colorsList = product.metadata?.colors && product.metadata.colors.length > 0
        ? product.metadata.colors
        : product.specs?.['Colors']
          ? product.specs['Colors'].split(',').map((c: string) => c.trim()).filter(Boolean)
          : [];
      if (colorsList.length > 0) {
        setSelectedColor(colorsList[0]);
        setColorOverlay(null); // no overlay on first load — just the natural photo
      }
    }
  }, [product]);

  const allImages = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) return product.images;
    if (product.image_url) return [product.image_url];
    if (product.image) return [product.image];
    return [];
  }, [product]);

  const colorsList: string[] = useMemo(() => {
    if (!product) return [];
    if (product.metadata?.colors && product.metadata.colors.length > 0) return product.metadata.colors;
    if (product.specs?.['Colors']) return product.specs['Colors'].split(',').map((c: string) => c.trim()).filter(Boolean);
    return [];
  }, [product]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Apply a semi-transparent color overlay to give real-time color preview
    setColorOverlay(getColorHex(color));
  };

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
        <p className="text-4xl mb-6 text-slate-500"></p>
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
        <Link to="/marketplace" className="mb-12 inline-flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-primary transition-all group uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Shop
        </Link>
 
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative flex aspect-square items-center justify-center rounded-[3rem] border border-slate-100 bg-white overflow-hidden shadow-premium transition-transform hover:scale-[1.01] duration-500">
              {activeImage && !mainImgError ? (
                <>
                  <img 
                    src={activeImage.startsWith('http') 
                      ? activeImage 
                      : `${import.meta.env.VITE_IMAGE_BASE_URL}${activeImage}`} 
                    alt={product.name} 
                    onError={() => setMainImgError(true)}
                    className="h-full w-full object-cover transition-all duration-300"
                  />
                  {/* Color Overlay */}
                  {colorOverlay && (
                    <div 
                      className="absolute inset-0 transition-all duration-500 pointer-events-none"
                      style={{ backgroundColor: colorOverlay, opacity: 0.22, mixBlendMode: 'multiply' }}
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <span className="text-[180px] drop-shadow-[0_20px_50px_rgba(29,78,216,0.1)] transition-transform hover:rotate-3 duration-700 select-none">
                    {categoryIcons[product.category] || ''}
                  </span>
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Elite Device</p>
                </div>
              )}

              {/* Cover Image badge — top right, shown when active image is the first/cover image */}
              {allImages.length > 0 && activeImage === allImages[0] && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary text-white rounded-full px-3 py-1.5 shadow-lg shadow-primary/30 text-[9px] font-black uppercase tracking-widest z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Cover Image
                </div>
              )}

              {/* Color badge on image */}
              {selectedColor && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-slate-100">
                  <div className="h-3.5 w-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: getColorHex(selectedColor) }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{selectedColor}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Row — shown when there are images */}
            {allImages.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <div key={idx} className="relative flex-shrink-0">
                    <button
                      onClick={() => { setActiveImage(img); setMainImgError(false); }}
                      className={`h-20 w-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 block ${
                        activeImage === img
                          ? 'border-primary shadow-md shadow-primary/20 scale-105'
                          : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <img 
                        src={img.startsWith('http') ? img : `${import.meta.env.VITE_IMAGE_BASE_URL}${img}`} 
                        alt={`View ${idx + 1}`} 
                        className="h-full w-full object-cover"
                      />
                    </button>
                    {/* Cover badge on first thumbnail */}
                    {idx === 0 && (
                      <div className="absolute -bottom-0 left-0 right-0 bg-primary text-[7px] font-black uppercase tracking-widest text-white text-center py-0.5 rounded-b-2xl z-10 select-none">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit rounded-xl bg-primary/10 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {product.category}
            </div>
            <h1 className="mb-6 text-3xl sm:text-5xl font-black text-foreground lg:text-7xl tracking-tighter leading-[1.05]">{product.name}</h1>
            <div className="mb-10 flex items-center gap-8">
              <span className="text-xl font-bold text-slate-500 tracking-tight uppercase">{product.brand}</span>
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
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Price</p>
              <div className="mb-12 space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl sm:text-6xl font-black text-foreground tracking-tighter">{formatCurrency(product.price)}</span>
                {(product.installment_eligible || product.installmentEligible) && (
                  <div className="text-2xl font-black text-primary italic tracking-tight">
                    or {formatCurrency(product.monthly_installment || product.monthlyInstallment || (product.price * 1.05 / 12))} <span className="text-[10px] uppercase not-italic font-bold">/mo</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 items-center pt-4">
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 border border-emerald-100">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Verified Seller</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2 border border-primary/10">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary">Quality Guaranteed</span>
                </div>
                {(product.metadata?.warranty || product.specs?.['Warranty']) && (
                  <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 border border-amber-100">
                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-600"> {product.metadata?.warranty || product.specs?.['Warranty']}</span>
                  </div>
                )}
                {(product.metadata?.condition || product.specs?.['Condition']) && (
                  <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 border border-slate-200">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-600"> {product.metadata?.condition || product.specs?.['Condition']}</span>
                  </div>
                )}
              </div>
            </div>
            </div>

            <div className="mb-12 space-y-4">
              {product.description?.split('\n\n').map((para: string, i: number) => (
                <p key={i} className="text-xl text-muted-foreground leading-relaxed font-medium tracking-tight">{para}</p>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => handleCreatePlan(12, 'monthly')} className="h-16 flex-1 gap-4 rounded-2xl bg-primary text-lg font-black text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                <CreditCard className="h-5 w-5" /> Pay in parts
              </Button>
              <Button variant="outline" className="h-16 gap-4 rounded-2xl border-slate-100 bg-white text-lg font-black text-foreground lg:px-12 transition-all hover:bg-slate-50 shadow-premium" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5" /> Add to cart
              </Button>
            </div>

            {/* Wishlist + Share row */}
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                className={`flex-1 h-12 rounded-2xl gap-2 font-bold text-sm border transition-all ${
                  isWishlisted
                    ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                    : 'border-slate-100 bg-white text-muted-foreground hover:border-red-200 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
                {isWishlisted ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-1 h-12 rounded-2xl gap-2 font-bold text-sm border-slate-100 bg-white text-muted-foreground hover:bg-slate-50 transition-all"
              >
                <Copy className="h-4 w-4" /> Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={handleShareWhatsApp}
                className="h-12 px-5 rounded-2xl border-slate-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="specs" className="mt-32">
          <TabsList className="h-auto flex-wrap bg-white p-2 rounded-2xl sm:rounded-[1.25rem] border border-slate-100 gap-2 flex shadow-premium">
            <TabsTrigger value="specs" className="h-12 px-8 rounded-xl font-bold tracking-tight data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-[11px] uppercase">Features</TabsTrigger>
            <TabsTrigger value="plans" className="h-12 px-8 rounded-xl font-bold tracking-tight data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-[11px] uppercase">Payment Plans</TabsTrigger>
            {colorsList.length > 0 && (
              <TabsTrigger value="colors" className="h-12 px-8 rounded-xl font-bold tracking-tight data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-[11px] uppercase">Colors</TabsTrigger>
            )}
            <TabsTrigger value="reviews" className="h-12 px-8 rounded-xl font-bold tracking-tight data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-[11px] uppercase">Reviews</TabsTrigger>
          </TabsList>
 
          <TabsContent value="specs" className="mt-12">
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 overflow-hidden shadow-premium">
              <div className="grid gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden">
                {Object.entries(product.specs || {}).map(([key, val], i) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between px-10 py-6 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary/40" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{key}</span>
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
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Standard warranty</p>
                  <p className="mt-4 text-xl font-black text-foreground">₦0 <span className="text-[10px] text-muted-foreground">/mo</span></p>
                </div>
                {insurancePlans?.map((ins: any) => (
                  <div 
                    key={ins.id}
                    onClick={() => setSelectedInsurance(ins)}
                    className={`cursor-pointer rounded-2xl border p-6 transition-all ${selectedInsurance?.id === ins.id ? 'border-primary bg-white shadow-premium' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}
                  >
                    <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">{ins.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{ins.description}</p>
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
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Pay every {plan.freq === 'day' ? 'day' : plan.freq === 'week' ? 'week' : 'month'}</p>
                    </div>
                    <div className="mb-10">
                      <p className="text-3xl sm:text-4xl font-black text-primary tracking-tighter">
                        {formatCurrency(installment)}
                        <span className="text-sm font-bold text-slate-500 tracking-normal"> /{plan.freq === 'day' ? 'day' : plan.freq === 'week' ? 'week' : 'mo'}</span>
                      </p>
                      <p className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Price: {formatCurrency(total)}</p>
                    </div>
                    <div className="mb-10 space-y-4 flex-1">
                      {[1, 2, 3].map(item => (
                        <div key={item} className="flex items-center gap-4 text-sm font-bold text-slate-500">
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

          {/* Colors Tab */}
          {colorsList.length > 0 && (
            <TabsContent value="colors" className="mt-12">
              <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-premium">
                <div className="flex items-center gap-4 mb-8">
                  <Palette className="h-7 w-7 text-primary" />
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight">Available Colors</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Click a color to preview it on the product image</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-5">
                  {colorsList.map((color: string) => {
                    const hex = getColorHex(color);
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`group flex flex-col items-center gap-3 transition-all duration-200 ${
                          isSelected ? 'scale-110' : 'hover:scale-105'
                        }`}
                      >
                        <div
                          className={`h-16 w-16 rounded-2xl border-4 shadow-lg transition-all duration-200 ${
                            isSelected
                              ? 'border-primary shadow-primary/30 scale-110'
                              : 'border-transparent hover:border-slate-200'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                          isSelected ? 'text-primary' : 'text-slate-500'
                        }`}>
                          {color}
                        </span>
                        {isSelected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Live Preview Strip */}
                {selectedColor && (
                  <div className="mt-10 flex items-center gap-6 rounded-2xl bg-slate-50 border border-slate-100 p-6">
                    <div
                      className="h-14 w-14 rounded-xl border-4 border-white shadow-md flex-shrink-0"
                      style={{ backgroundColor: getColorHex(selectedColor) }}
                    />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Currently Viewing</p>
                      <p className="text-xl font-black text-foreground tracking-tight">{selectedColor}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Color preview applied to product image above ↑</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-12">
            <div className="space-y-8">
              {/* Submit review */}
              <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-premium">
                <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Write a Review</h3>
                <p className="text-sm text-muted-foreground font-medium mb-8">Share your experience with this product.</p>

                {/* Star picker */}
                <div className="flex items-center gap-2 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">Your Rating</p>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      onClick={() => setReviewRating(s)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star className={`h-8 w-8 ${s <= reviewRating ? 'fill-primary text-primary' : 'fill-slate-100 text-slate-200'} transition-colors`} />
                    </button>
                  ))}
                  <span className="ml-2 text-lg font-black text-primary">{reviewRating}/5</span>
                </div>

                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Tell others what you think about this product... (quality, delivery, etc.)"
                  rows={4}
                  className="w-full p-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all resize-none mb-6"
                />

                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview || !reviewText.trim()}
                  className="h-12 px-8 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-md shadow-primary/20"
                >
                  {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Review'}
                </Button>
              </div>

              {/* Existing reviews */}
              <ReviewsList productId={id!} />
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

function ReviewsList({ productId }: { productId: string }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: () => api.get(`/products/${productId}/reviews`).then(r => r.data).catch(() => []),
  });

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2].map(i => <div key={i} className="h-32 rounded-2xl bg-slate-50 animate-pulse" />)}
    </div>
  );

  if (!Array.isArray(reviews) || reviews.length === 0) return (
    <div className="rounded-[2.5rem] border border-dashed border-slate-100 bg-slate-50/50 py-20 text-center">
      <MessageCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
      <p className="font-black text-foreground uppercase tracking-widest text-xs">No reviews yet</p>
      <p className="text-sm font-medium text-muted-foreground mt-2">Be the first to share your experience!</p>
    </div>
  );

  const avgRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-premium flex items-center gap-8">
        <div className="text-center">
          <p className="text-6xl font-black text-foreground tracking-tighter">{avgRating.toFixed(1)}</p>
          <div className="flex gap-1 justify-center mt-2">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'fill-primary text-primary' : 'fill-slate-100 text-slate-200'}`} />
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 space-y-2">
          {[5,4,3,2,1].map(star => {
            const count = reviews.filter((r: any) => Math.round(r.rating) === star).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted-foreground w-4">{star}</span>
                <Star className="h-3 w-3 fill-primary text-primary" />
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 w-4">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review cards */}
      {reviews.map((r: any, i: number) => (
        <div key={r.id || i} className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-lg">
                {(r.user_name || r.reviewer || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-black text-foreground tracking-tight">{r.user_name || r.reviewer || 'Anonymous'}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`h-4 w-4 ${s <= (r.rating || 0) ? 'fill-primary text-primary' : 'fill-slate-100 text-slate-200'}`} />
              ))}
            </div>
          </div>
          <p className="text-base font-medium text-slate-500 leading-relaxed italic">"{r.comment || r.review || r.text}"</p>
        </div>
      ))}
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
                      {categoryIcons[product.category] || ''}
                    </span>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Premium Gadget</p>
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
