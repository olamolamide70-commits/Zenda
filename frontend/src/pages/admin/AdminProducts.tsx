import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, AlertCircle, ShoppingBag, X, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { useApp } from '@/context/AppContext';
import { productService } from '@/services';
import { Product } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Laptops', 'Phones', 'Tablets', 'Audio', 'Accessories', 'Wearables'];

export default function AdminProducts() {
  const { user } = useApp();
  const isVendor = user?.role === 'vendor';
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', user?.id],
    queryFn: () => {
      // Vendors only query their own products
      const params = isVendor ? { vendor_id: user.id } : {};
      return productService.getAll(params);
    }
  });

  // Create Product mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Product>) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product listed successfully!');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to list product');
    }
  });

  // Update Product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully!');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update product');
    }
  });

  // Delete Product mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete product');
    }
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setCategory(CATEGORIES[0]);
    setPrice('');
    setDescription('');
    setImageUrl('');
    setIsOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setCategory(p.category);
    setPrice(p.price.toString());
    setDescription(p.description);
    setImageUrl(p.image_url || p.image || '');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand || !price) {
      toast.warning('Please enter all required fields.');
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=600&auto=format&fit=crop';
    
    const productData: Partial<Product> = {
      name,
      brand,
      category,
      price: Number(price),
      description: description || `${name} by ${brand}`,
      image_url: imageUrl || defaultImg,
      specs: {},
      installment_eligible: true
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{isVendor ? 'Seller Store' : 'Inventory'}</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">{isVendor ? 'My Store' : 'Product Catalog'}</h1>
        </div>
        <Button 
          className="h-12 px-6 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-[10px] gap-2 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]" 
          onClick={handleOpenAdd}
        >
          <Plus className="h-4 w-4" /> Add New Item
        </Button>
      </div>

      {products.length > 0 ? (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-5 pl-8">Product Name</th>
                  <th className="py-5">Manufacturer</th>
                  <th className="py-5">Category</th>
                  <th className="py-5">Standard Price</th>
                  <th className="py-5">Image</th>
                  <th className="py-5 pr-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(p => (
                  <tr key={p.id} className="group transition-colors hover:bg-slate-50">
                    <td className="py-6 pl-8 font-bold text-foreground">
                      <div className="flex flex-col">
                        <span>{p.name}</span>
                        {isVendor && p.vendor_id !== user?.id && (
                          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Platform Stock</span>
                        )}
                      </div>
                    </td>
                    <td className="py-6 text-muted-foreground font-medium">{p.brand}</td>
                    <td className="py-6">
                      <Badge className="rounded-lg bg-slate-100 text-slate-600 px-2 py-1 text-[10px] font-bold uppercase tracking-widest border-none shadow-none">
                        {p.category}
                      </Badge>
                    </td>
                    <td className="py-6 font-bold text-primary">{formatCurrency(p.price)}</td>
                    <td className="py-6">
                      <img 
                        src={p.image_url || p.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=100&auto=format&fit=crop'} 
                        alt={p.name} 
                        className="h-10 w-10 object-cover rounded-lg border border-border"
                      />
                    </td>
                    <td className="py-6 pr-8 text-right">
                      {(!isVendor || p.vendor_id === user?.id) ? (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors" 
                            onClick={() => handleOpenEdit(p)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors" 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                deleteMutation.mutate(p.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Owned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-slate-50/50 py-24 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="font-black text-foreground uppercase tracking-widest text-xs">No Products Listed</h3>
          <p className="text-sm font-medium text-muted-foreground mt-2 max-w-[280px] mx-auto">Click "Add New Item" to populate your seller store catalog.</p>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={handleClose} 
                className="absolute top-6 right-6 h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-8">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">{editingProduct ? 'Update Stock' : 'Create Listing'}</p>
                <h2 className="text-3xl font-black text-foreground tracking-tight">
                  {editingProduct ? 'Edit Product Details' : 'Add New Product'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Product Name *</label>
                    <input 
                      type="text" 
                      required
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g. iPhone 15 Pro"
                      className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Manufacturer / Brand *</label>
                    <input 
                      type="text" 
                      required
                      value={brand} 
                      onChange={(e) => setBrand(e.target.value)} 
                      placeholder="e.g. Apple"
                      className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Category *</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-xs uppercase tracking-widest transition-all"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Price (₦) *</label>
                    <input 
                      type="number" 
                      required
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      placeholder="e.g. 1500000"
                      className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Image URL (Optional)</label>
                  <input 
                    type="url" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    placeholder="https://example.com/gadget.png"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                  />
                  <p className="text-[9px] text-muted-foreground mt-1.5 font-medium">Leave blank to assign a beautiful default tech graphic placeholder.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Product Description</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Provide a compelling description of the features, storage size, color options, etc."
                    rows={4}
                    className="w-full p-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleClose} 
                    className="flex-1 h-14 rounded-xl border border-border font-bold text-xs uppercase tracking-widest hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 h-14 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      editingProduct ? 'Save Changes' : 'List Product'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
