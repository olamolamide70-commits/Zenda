import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, AlertCircle, ShoppingBag, X, Package, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { useApp } from '@/context/AppContext';
import { productService } from '@/services';
import { Product } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';

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
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [colors, setColors] = useState('');
  const [condition, setCondition] = useState('Brand New');
  const [warranty, setWarranty] = useState('1 Year');

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

  // Multi-image upload handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 10) {
      toast.warning('Maximum of 10 pictures is allowed');
      return;
    }

    try {
      setUploadingImage(true);
      const newImages = [...images];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);
        
        const res = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        newImages.push(res.data.url);
      }
      
      setImages(newImages);
      if (newImages.length > 0) {
        setImageUrl(newImages[0]);
      }
      toast.success('Image(s) uploaded and compressed successfully!');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    setImages(updated);
    if (updated.length > 0) {
      setImageUrl(updated[0]);
    } else {
      setImageUrl('');
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setCategory(CATEGORIES[0]);
    setPrice('');
    setDescription('');
    setImageUrl('');
    setImages([]);
    setColors('');
    setCondition('Brand New');
    setWarranty('1 Year');
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
    setImages(p.images || (p.image_url ? [p.image_url] : []));
    setColors(p.metadata?.colors?.join(', ') || p.specs?.['Colors'] || '');
    setCondition(p.metadata?.condition || p.specs?.['Condition'] || 'Brand New');
    setWarranty(p.metadata?.warranty || p.specs?.['Warranty'] || '1 Year');
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
      images: images.length > 0 ? images : [imageUrl || defaultImg],
      metadata: {
        colors: colors.split(',').map(c => c.trim()).filter(Boolean),
        condition,
        warranty
      },
      specs: {
        "Colors": colors,
        "Condition": condition,
        "Warranty": warranty
      },
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

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Colors Available</label>
                  <input 
                    type="text" 
                    value={colors} 
                    onChange={(e) => setColors(e.target.value)} 
                    placeholder="e.g. Space Gray, Deep Purple, Silver (comma separated)"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Condition</label>
                    <select 
                      value={condition} 
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-xs uppercase tracking-widest transition-all"
                    >
                      <option value="Brand New">Brand New</option>
                      <option value="Refurbished">Refurbished</option>
                      <option value="Used - Like New">Used - Like New</option>
                      <option value="Used - Good">Used - Good</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Warranty</label>
                    <select 
                      value={warranty} 
                      onChange={(e) => setWarranty(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-xs uppercase tracking-widest transition-all"
                    >
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="6 Months">6 Months</option>
                      <option value="3 Months">3 Months</option>
                      <option value="No Warranty">No Warranty</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Images (Upload up to 10 compressed pictures)</label>
                  
                  {/* Image Grid of Uploaded Images */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-5 gap-3">
                      {images.map((img, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setImageUrl(img)}
                          className={`relative aspect-square rounded-xl border cursor-pointer overflow-hidden group transition-all ${img === imageUrl ? 'border-primary ring-2 ring-primary/20' : 'border-border bg-slate-50 hover:border-slate-300'}`}
                        >
                          <img src={img} alt={`Product ${idx}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="absolute top-1 right-1 h-5 w-5 bg-red-600/90 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100 z-10"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {img === imageUrl && (
                            <div className="absolute bottom-0 left-0 right-0 bg-primary text-[8px] font-bold uppercase tracking-widest text-white text-center py-0.5 z-10 select-none">
                              Cover Image
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Trigger Dropzone */}
                  {images.length < 10 && (
                    <div className="relative rounded-2xl border border-dashed border-slate-200 p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        disabled={uploadingImage}
                        onChange={handleImageUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      {uploadingImage ? (
                        <div className="space-y-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Uploading & Compressing...</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                            <UploadCloud className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Drag or Select Product Images</p>
                            <p className="text-[8px] text-slate-400 font-medium mt-0.5">Upload up to 10 pictures. Auto-compressed using Sharp.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Single URL fallback for convenience */}
                  <div className="pt-2">
                    <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-1">Or paste single image URL fallback</label>
                    <input 
                      type="text" 
                      value={imageUrl} 
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        if (images.length === 0 && e.target.value) {
                          setImages([e.target.value]);
                        }
                      }} 
                      placeholder="https://example.com/gadget.png"
                      className="w-full h-10 px-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 font-medium text-xs transition-all"
                    />
                  </div>
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
