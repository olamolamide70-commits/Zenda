import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { categoryIcons } from '@/utils/mockData';
import { useApp } from '@/context/AppContext';
import { toast } from 'react-toastify';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, isAuthenticated } = useApp();
  const imageUrl = (product.image_url || product.image);
  const isWishlisted = wishlist.some(w => w.id === product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Sign in to save items to your wishlist');
      return;
    }
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.info(`${product.name} removed from wishlist`);
    } else {
      addToWishlist(product);
      toast.success(`${product.name} added to wishlist!`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="group overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-premium transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 hover:border-primary/30 glow-border">
      <div className="relative aspect-square overflow-hidden bg-slate-50/50">
        <div className="flex h-full items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-2 p-10">
          {(imageUrl && !imgError) ? (
            <img
              src={imageUrl.startsWith('http')
                ? imageUrl
                : `${import.meta.env.VITE_IMAGE_BASE_URL}${imageUrl}`}
              alt={product.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-contain mix-blend-multiply drop-shadow-2xl"
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <span className="text-7xl drop-shadow-2xl select-none animate-bounce-slow">
                {categoryIcons[product.category] || '📦'}
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Premium Gadget</p>
            </div>
          )}
        </div>

        {/* Badges */}
        {(product.installment_eligible || product.installmentEligible) && (
          <div className="absolute left-6 top-6 rounded-full glass-card glass-grain border border-primary/20 px-4 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-primary shadow-lg">
            Pay in bits
          </div>
        )}
        {product.vendor_id && (
          <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <CheckCircle className="h-4 w-4" />
          </div>
        )}

        {/* Wishlist button — always visible on hover */}
        <button
          onClick={handleWishlist}
          className={`absolute right-4 ${product.vendor_id ? 'top-14' : 'top-4'} h-9 w-9 rounded-xl flex items-center justify-center border transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm ${
            isWishlisted
              ? 'bg-red-50 border-red-200 text-red-500'
              : 'bg-white/90 border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
        </button>

        {/* Quick add to cart on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-primary/95 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-colors"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{product.brand}</span>
          <div className="flex items-center gap-1 text-xs font-bold text-primary">
            <Star className="h-3.5 w-3.5 fill-primary" />
            {product.rating}
          </div>
        </div>
        <h3 className="mb-3 text-lg font-black text-foreground tracking-tight line-clamp-1">{product.name}</h3>
        <div className="mb-6">
          <div className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(product.price)}</div>
          {product.installment_eligible && (
            <div className="text-[10px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest leading-none">
              From <span className="text-primary">{formatCurrency(product.monthly_installment || (product.price * 1.05 / 12))}</span> / month
            </div>
          )}
        </div>
        <Link to={`/product/${product.id}`} aria-label={`View details for ${product.name}`}>
          <Button className="w-full h-11 rounded-xl bg-slate-50 text-slate-500 hover:bg-primary hover:text-white transition-all font-black uppercase tracking-[0.2em] text-[8px] border border-slate-100 shadow-none hover:shadow-lg hover:shadow-primary/20">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
