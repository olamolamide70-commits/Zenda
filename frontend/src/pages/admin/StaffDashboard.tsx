import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, productService } from '@/services';
import { ClipboardList, Package, Loader2, Check, Send, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import api from '@/services/api';
import { Badge } from '@/components/ui/badge';

export default function StaffDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  
  // States for delivery confirmation modal
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);

  // States for editing product inventory
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // 1. Fetch Orders List (All System Orders)
  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ['staff-orders'],
    queryFn: () => api.get('/orders/all').then(res => res.data)
  });

  // 2. Fetch Products List (For Inventory Management)
  const { data: products = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ['staff-products'],
    queryFn: () => productService.getAll()
  });

  // 3. Update Order Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api.put(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update order status');
    }
  });

  const handleDeliveryConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !deliveryOtp) return;
    setIsConfirmingDelivery(true);
    try {
      await orderService.confirmDelivery(selectedOrderId, deliveryOtp);
      toast.success('Delivery OTP verified! Order status updated to delivered.');
      setSelectedOrderId(null);
      setDeliveryOtp('');
      queryClient.invalidateQueries({ queryKey: ['staff-orders'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid delivery OTP');
    } finally {
      setIsConfirmingDelivery(false);
    }
  };

  const handleUpdateStock = async (productId: string) => {
    setIsUpdatingStock(true);
    try {
      await productService.update(productId, { inventory: newStock });
      toast.success('Inventory stock level updated!');
      setEditingProductId(null);
      queryClient.invalidateQueries({ queryKey: ['staff-products'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update stock');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  if (ordersLoading || productsLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium italic">Loading Operations Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Logistics & Operations</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Staff Workspace</h1>
          <p className="mt-1 text-muted-foreground font-medium text-sm">Fulfill orders, verify delivery tokens, and track inventory stock counts.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2 border border-border shrink-0 self-start md:self-center">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'orders' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Fulfillment Queue
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'inventory' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Inventory Stock Room
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'orders' && (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" /> Order Fulfillment Pipeline
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-4 pl-8">Order ID / Customer</th>
                  <th className="py-4">Item Price</th>
                  <th className="py-4">Status</th>
                  <th className="py-4 pr-8 text-right">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map(o => (
                  <tr key={o.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-5 pl-8">
                      <span className="font-mono text-xs text-muted-foreground font-bold tracking-tighter uppercase block">ORD-{o.id.slice(0, 8)}</span>
                      <span className="font-bold text-foreground block text-sm">{o.user_name || 'Anonymous customer'}</span>
                      <span className="text-xs text-muted-foreground">{o.user_email}</span>
                    </td>
                    <td className="py-5 font-bold text-foreground">{formatCurrency(o.amount || o.total_amount)}</td>
                    <td className="py-5">
                      <Badge className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-none shadow-none ${getStatusColor(o.status)}`}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="py-5 pr-8 text-right">
                      <div className="flex gap-2 justify-end">
                        {o.status === 'pending' && (
                          <Button 
                            onClick={() => updateStatusMutation.mutate({ id: o.id, status: 'processing' })}
                            className="bg-slate-800 text-white font-bold h-9 rounded-lg text-[10px] uppercase tracking-wider px-3"
                          >
                            Process Order
                          </Button>
                        )}
                        {o.status === 'processing' && (
                          <Button 
                            onClick={() => updateStatusMutation.mutate({ id: o.id, status: 'shipped' })}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 rounded-lg text-[10px] uppercase tracking-wider px-3"
                          >
                            Ship Order
                          </Button>
                        )}
                        {o.status === 'shipped' && (
                          <Button 
                            onClick={() => { setSelectedOrderId(o.id); setDeliveryOtp(''); }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 rounded-lg text-[10px] uppercase tracking-wider px-3 flex items-center gap-1"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" /> Confirm Delivery
                          </Button>
                        )}
                        {o.status === 'delivered' && (
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 justify-end">
                            <Check className="h-4 w-4" /> Fulfilled
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-muted-foreground font-medium italic">
                      No orders found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> Stock Inventory Management
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-4 pl-8">Product Name</th>
                  <th className="py-4">Category</th>
                  <th className="py-4">Retail Price</th>
                  <th className="py-4">Stock Level</th>
                  <th className="py-4 pr-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(p => (
                  <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-5 pl-8 font-bold text-foreground text-sm">{p.name}</td>
                    <td className="py-5 text-muted-foreground font-semibold text-xs uppercase tracking-wider">{p.category}</td>
                    <td className="py-5 font-bold text-foreground">{formatCurrency(p.price)}</td>
                    <td className="py-5">
                      {editingProductId === p.id ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            value={newStock}
                            onChange={(e) => setNewStock(Number(e.target.value))}
                            className="w-20 h-10 px-2 rounded-lg font-bold border-border bg-slate-50"
                          />
                          <Button 
                            onClick={() => handleUpdateStock(p.id)}
                            disabled={isUpdatingStock}
                            className="bg-emerald-600 hover:bg-emerald-700 h-9 w-9 p-0 flex items-center justify-center rounded-lg"
                          >
                            <Check className="h-4 w-4 text-white" />
                          </Button>
                          <Button 
                            variant="ghost"
                            onClick={() => setEditingProductId(null)}
                            className="h-9 w-9 p-0 flex items-center justify-center rounded-lg"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-xs ${
                          (p.inventory || 0) < 5 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.inventory || 0} left
                        </span>
                      )}
                    </td>
                    <td className="py-5 pr-8 text-right">
                      {editingProductId !== p.id && (
                        <Button 
                          onClick={() => { setEditingProductId(p.id); setNewStock(p.inventory || 0); }}
                          variant="ghost"
                          className="h-9 px-4 rounded-lg text-xs font-bold text-primary hover:bg-primary/5 uppercase tracking-wider"
                        >
                          Modify Stock
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delivery OTP Verification Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative border border-border">
            <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2 mb-2">
              Verify Delivery OTP
            </h3>
            <p className="text-xs text-muted-foreground font-medium mb-6">Enter the customer-provided 6-digit confirmation code to unlock and finalize this installment transaction.</p>

            <form onSubmit={handleDeliveryConfirm} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Delivery Verification OTP</label>
                <input 
                  type="text"
                  required
                  value={deliveryOtp}
                  onChange={(e) => setDeliveryOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  maxLength={6}
                  className="w-full h-12 text-center tracking-widest font-mono text-xl rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setSelectedOrderId(null)} 
                  className="flex-1 h-12 rounded-xl border border-border font-bold text-xs uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isConfirmingDelivery}
                  className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest transition-all"
                >
                  {isConfirmingDelivery ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Confirm Release'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
