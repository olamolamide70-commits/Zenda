import { mockProducts } from '@/utils/mockData';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { useApp } from '@/context/AppContext';

export default function AdminProducts() {
  const { user } = useApp();
  const isVendor = user?.role === 'vendor';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{isVendor ? 'Seller Store' : 'Inventory'}</p>
          <h1 className="text-4xl font-black text-foreground tracking-tight">{isVendor ? 'My Store' : 'Product Catalog'}</h1>
        </div>
        <Button className="h-12 px-6 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-[10px] gap-2 shadow-md hover:shadow-lg transition-all" onClick={() => toast.info('Product creation interface')}>
          <Plus className="h-4 w-4" /> Add New Item
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <th className="py-5 pl-8">Product Name</th>
                <th className="py-5">Manufacturer</th>
                <th className="py-5">Category</th>
                <th className="py-5">Standard Price</th>
                <th className="py-5">Metric</th>
                <th className="py-5 pr-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
               {mockProducts.map(p => (
                <tr key={p.id} className="group transition-colors hover:bg-slate-50">
                  <td className="py-6 pl-8 font-bold text-foreground">{p.name}</td>
                  <td className="py-6 text-muted-foreground font-medium">{p.brand}</td>
                  <td className="py-6">
                    <Badge className="rounded-lg bg-slate-100 text-slate-600 px-2 py-1 text-[10px] font-bold uppercase tracking-widest border-none shadow-none">
                      {p.category}
                    </Badge>
                  </td>
                  <td className="py-6 font-bold text-primary">{formatCurrency(p.price)}</td>
                  <td className="py-6 text-muted-foreground font-medium">{p.rating} ★</td>
                  <td className="py-6 pr-8 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => toast.info('Editing product...')}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors" onClick={() => toast.warning('Deletion safeguard active')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
