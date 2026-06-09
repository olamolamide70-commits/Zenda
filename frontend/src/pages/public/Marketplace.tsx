import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Loader2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { productService } from '@/services';
import { formatCurrency } from '@/utils/helpers';

const ITEMS_PER_PAGE = 12;
const categories = ['All', 'Laptops', 'Phones', 'Tablets', 'Gaming', 'Audio', 'Cameras', 'Accessories', 'Wearables'];

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('All');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAll()
  });

  // Dynamic brands from real product data
  const brands = useMemo(() => {
    const uniqueBrands = Array.from(new Set(products.map((p: any) => p.brand).filter(Boolean))).sort() as string[];
    return ['All', ...uniqueBrands];
  }, [products]);

  // Max price from data for slider hint
  const maxProductPrice = useMemo(() => {
    if (!products.length) return 1000000;
    return Math.max(...products.map((p: any) => p.price || 0));
  }, [products]);

  const filtered = useMemo(() => {
    let result = products.filter((p: any) => {
      const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
      const matchesBrand = brand === 'All' || p.brand === brand;
      const matchesCat = category === 'All' || p.category === category;
      const matchesMin = !minPrice || p.price >= Number(minPrice);
      const matchesMax = !maxPrice || p.price <= Number(maxPrice);
      return matchesSearch && matchesBrand && matchesCat && matchesMin && matchesMax;
    });
    if (sort === 'price-asc') result = [...result].sort((a: any, b: any) => a.price - b.price);
    if (sort === 'price-desc') result = [...result].sort((a: any, b: any) => b.price - a.price);
    if (sort === 'rating') result = [...result].sort((a: any, b: any) => b.rating - a.rating);
    if (sort === 'newest') result = [...result].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    return result;
  }, [products, search, brand, category, sort, minPrice, maxPrice]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const hasActiveFilters = brand !== 'All' || category !== 'All' || minPrice || maxPrice || search;

  const clearFilters = () => {
    setSearch(''); setBrand('All'); setCategory('All');
    setMinPrice(''); setMaxPrice(''); setSort('featured'); setPage(1);
  };

  return (
    <div className="py-24 lg:py-40 min-h-screen bg-[#F9FAFB] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-20 text-center">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">Find your next gadget</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 text-foreground tracking-tighter leading-none">
            Zenda
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-medium text-muted-foreground/60 leading-relaxed">
            Buy the world's best technology and pay in small, easy monthly steps.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/40" />
              <Input
                placeholder="Search gadgets, brands, or categories..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="h-16 pl-14 bg-white border-border rounded-2xl text-foreground placeholder:text-muted-foreground/30 focus:ring-primary/20 transition-all font-bold text-lg shadow-sm"
              />
            </div>
            <Button
              variant="outline"
              className={`h-16 gap-3 border-border bg-white text-foreground hover:bg-slate-50 rounded-2xl px-6 font-bold shadow-sm ${showFilters ? 'border-primary text-primary' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-5 w-5" /> Filters
              {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium space-y-5">
              <div className="flex flex-wrap gap-4">
                <Select value={brand} onValueChange={v => { setBrand(v); setPage(1); }}>
                  <SelectTrigger className="h-12 w-full sm:w-44 bg-slate-50 border-border rounded-xl font-bold">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border text-foreground">
                    {brands.map(b => <SelectItem key={b} value={b} className="font-bold py-3 uppercase text-[10px] tracking-widest">{b}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={category} onValueChange={v => { setCategory(v); setPage(1); }}>
                  <SelectTrigger className="h-12 w-full sm:w-48 bg-slate-50 border-border rounded-xl font-bold">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border text-foreground">
                    {categories.map(c => <SelectItem key={c} value={c} className="font-bold py-3 uppercase text-[10px] tracking-widest">{c}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={sort} onValueChange={v => { setSort(v); setPage(1); }}>
                  <SelectTrigger className="h-12 w-full sm:w-52 bg-slate-50 border-border rounded-xl font-bold">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border text-foreground">
                    <SelectItem value="featured" className="font-bold py-3 uppercase text-[10px] tracking-widest">Featured</SelectItem>
                    <SelectItem value="newest" className="font-bold py-3 uppercase text-[10px] tracking-widest">Newest First</SelectItem>
                    <SelectItem value="price-asc" className="font-bold py-3 uppercase text-[10px] tracking-widest">Price: Low → High</SelectItem>
                    <SelectItem value="price-desc" className="font-bold py-3 uppercase text-[10px] tracking-widest">Price: High → Low</SelectItem>
                    <SelectItem value="rating" className="font-bold py-3 uppercase text-[10px] tracking-widest">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                  Price Range (₦)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={minPrice}
                    onChange={e => { setMinPrice(e.target.value); setPage(1); }}
                    className="h-12 w-36 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-sm"
                  />
                  <span className="text-muted-foreground font-bold">—</span>
                  <input
                    type="number"
                    placeholder="Max price"
                    value={maxPrice}
                    onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
                    className="h-12 w-36 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-sm"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                    Max: {formatCurrency(maxProductPrice)}
                  </span>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="h-3.5 w-3.5" /> Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        <p className="mb-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] leading-none">
          {isLoading ? 'Synchronizing catalog...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found${page > 1 ? ` · Page ${page} of ${totalPages}` : ''}`}
        </p>

        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border border-red-500/10 bg-white py-24 text-center shadow-sm">
            <p className="text-3xl font-black text-foreground tracking-tight">Something went wrong</p>
            <p className="mt-4 text-lg font-medium text-muted-foreground/60 max-w-md mx-auto">We're having trouble loading products.</p>
            <Button variant="outline" className="mt-12 h-14 px-10 rounded-xl border-border font-bold uppercase tracking-widest text-[10px]" onClick={() => window.location.reload()}>Try again</Button>
          </div>
        ) : paginated.length > 0 ? (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginated.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-16">
                <Button
                  variant="outline"
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  disabled={page === 1}
                  className="h-12 px-6 rounded-xl border-border font-bold uppercase tracking-widest text-[10px]"
                >
                  ← Previous
                </Button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                      className={`h-12 w-12 rounded-xl font-black text-sm transition-all ${
                        p === page
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'bg-white border border-border text-muted-foreground hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  disabled={page === totalPages}
                  className="h-12 px-6 rounded-xl border-border font-bold uppercase tracking-widest text-[10px]"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border border-border bg-white py-24 text-center shadow-sm">
            <div className="h-32 w-32 rounded-full bg-slate-50 flex items-center justify-center mb-10">
              <Search className="h-10 w-10 text-muted-foreground/20" />
            </div>
            <p className="text-3xl font-black text-foreground tracking-tight lowercase">no matches found</p>
            <p className="mt-4 text-lg font-medium text-muted-foreground/60 max-w-md mx-auto italic">Adjust your search or filters.</p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} className="mt-8 h-12 px-8 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
