import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, CheckCircle, XCircle, DollarSign, Clock, Search } from 'lucide-react';

interface Product {
  id: string;
  name_en: string;
  name_bn: string;
  sku: string | null;
  price: number;
  stock: number | null;
  reserved_stock: number;
  low_stock_threshold: number;
  stock_status: string;
  stock_status_override: string | null;
  unit: string | null;
  images: any;
  updated_at: string | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name_en: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  in_stock: { label: 'In Stock', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle },
  low_stock: { label: 'Low Stock', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: AlertTriangle },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
};

const AdminInventory = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingStock, setEditingStock] = useState<{ id: string; mode: 'add' | 'reduce' | 'set'; value: number } | null>(null);
  const [editingThreshold, setEditingThreshold] = useState<{ id: string; value: number } | null>(null);

  const fetchData = async () => {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('id, name_en, name_bn, sku, price, stock, reserved_stock, low_stock_threshold, stock_status, stock_status_override, unit, images, updated_at, category_id'),
      supabase.from('categories').select('id, name_en'),
    ]);
    setProducts((prods as Product[]) || []);
    setCategories((cats as Category[]) || []);
  };

  useEffect(() => { fetchData(); }, []);

  const catMap = useMemo(() => {
    const m: Record<string, string> = {};
    categories.forEach(c => m[c.id] = c.name_en);
    return m;
  }, [categories]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (statusFilter !== 'all' && p.stock_status !== statusFilter) return false;
      if (search && !p.name_en.toLowerCase().includes(search.toLowerCase()) && !(p.sku?.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [products, search, statusFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => p.stock_status === 'in_stock').length;
    const lowStock = products.filter(p => p.stock_status === 'low_stock').length;
    const outOfStock = products.filter(p => p.stock_status === 'out_of_stock').length;
    const totalValue = products.reduce((s, p) => s + (p.price * (p.stock || 0)), 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const recentlyUpdated = products.filter(p => p.updated_at && p.updated_at >= sevenDaysAgo).length;
    return { total, inStock, lowStock, outOfStock, totalValue, recentlyUpdated };
  }, [products]);

  const updateStock = async () => {
    if (!editingStock) return;
    const product = products.find(p => p.id === editingStock.id);
    if (!product) return;

    let newStock = product.stock || 0;
    if (editingStock.mode === 'add') newStock += editingStock.value;
    else if (editingStock.mode === 'reduce') newStock = Math.max(0, newStock - editingStock.value);
    else newStock = editingStock.value;

    // Compute new status
    const override = product.stock_status_override;
    let newStatus = 'in_stock';
    if (override) {
      newStatus = override;
    } else if (newStock <= 0) {
      newStatus = 'out_of_stock';
    } else if (newStock <= product.low_stock_threshold) {
      newStatus = 'low_stock';
    }

    await supabase.from('products').update({ stock: newStock, stock_status: newStatus }).eq('id', editingStock.id);
    toast({ title: 'Stock updated' });
    setEditingStock(null);
    fetchData();
  };

  const updateThreshold = async () => {
    if (!editingThreshold) return;
    const product = products.find(p => p.id === editingThreshold.id);
    if (!product) return;

    const stock = product.stock || 0;
    const override = product.stock_status_override;
    let newStatus = 'in_stock';
    if (override) newStatus = override;
    else if (stock <= 0) newStatus = 'out_of_stock';
    else if (stock <= editingThreshold.value) newStatus = 'low_stock';

    await supabase.from('products').update({ low_stock_threshold: editingThreshold.value, stock_status: newStatus }).eq('id', editingThreshold.id);
    toast({ title: 'Threshold updated' });
    setEditingThreshold(null);
    fetchData();
  };

  const setOverride = async (productId: string, override: string | null) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const stock = product.stock || 0;
    let newStatus = 'in_stock';
    if (override) {
      newStatus = override;
    } else if (stock <= 0) {
      newStatus = 'out_of_stock';
    } else if (stock <= product.low_stock_threshold) {
      newStatus = 'low_stock';
    }

    await supabase.from('products').update({ stock_status_override: override, stock_status: newStatus }).eq('id', productId);
    toast({ title: override ? `Status set to ${override.replace('_', ' ')}` : 'Status set to auto' });
    fetchData();
  };

  const getImageUrl = (images: any) => {
    if (Array.isArray(images) && images.length > 0) return images[0];
    return null;
  };

  const alertCount = stats.lowStock + stats.outOfStock;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

      {/* Alert banner */}
      {alertCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6 flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          <span><strong>{alertCount}</strong> product(s) need attention: {stats.lowStock} low stock, {stats.outOfStock} out of stock.</span>
          <button onClick={() => setStatusFilter('low_stock')} className="ml-auto text-yellow-600 hover:underline text-xs">View low stock</button>
          <button onClick={() => setStatusFilter('out_of_stock')} className="text-red-600 hover:underline text-xs">View out of stock</button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Products', value: stats.total, icon: Package, color: 'text-primary' },
          { label: 'In Stock', value: stats.inStock, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'text-yellow-600' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: XCircle, color: 'text-red-600' },
          { label: 'Stock Value', value: `৳${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-cta' },
          { label: 'Recently Updated', value: stats.recentlyUpdated, icon: Clock, color: 'text-muted-foreground' },
        ].map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <p className="text-lg font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-muted rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">SKU</th>
              <th className="text-left p-3">Category</th>
              <th className="text-center p-3">Stock</th>
              <th className="text-center p-3">Reserved</th>
              <th className="text-center p-3">Available</th>
              <th className="text-left p-3">Unit</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Updated</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const imgUrl = getImageUrl(p.images);
              const available = Math.max(0, (p.stock || 0) - (p.reserved_stock || 0));
              const sc = statusConfig[p.stock_status] || statusConfig.in_stock;
              const StatusIcon = sc.icon;

              return (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {imgUrl ? (
                        <img src={imgUrl} alt="" className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted" />
                      )}
                      <div>
                        <p className="font-medium truncate max-w-[150px]">{p.name_en}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{p.name_bn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.sku || '—'}</td>
                  <td className="p-3 text-muted-foreground">{p.category_id ? catMap[p.category_id] || '—' : '—'}</td>
                  <td className="p-3 text-center font-medium">{p.stock ?? 0}</td>
                  <td className="p-3 text-center">{p.reserved_stock || 0}</td>
                  <td className="p-3 text-center font-medium">{available}</td>
                  <td className="p-3">{p.unit || 'piece'}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={`${sc.color} text-xs`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {sc.label}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2"
                        onClick={() => setEditingStock({ id: p.id, mode: 'add', value: 0 })}
                      >
                        Edit Stock
                      </Button>
                      <select
                        value={p.stock_status_override || 'auto'}
                        onChange={e => setOverride(p.id, e.target.value === 'auto' ? null : e.target.value)}
                        className="text-xs px-2 py-1 bg-muted rounded h-7"
                      >
                        <option value="auto">Auto</option>
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stock Edit Modal */}
      {editingStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingStock(null)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Edit Stock</h3>
            <p className="text-sm text-muted-foreground">
              {products.find(p => p.id === editingStock.id)?.name_en} — Current: {products.find(p => p.id === editingStock.id)?.stock ?? 0}
            </p>

            <div className="flex gap-1">
              {(['add', 'reduce', 'set'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setEditingStock({ ...editingStock, mode: m })}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-md ${editingStock.mode === m ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  {m === 'add' ? '+ Add' : m === 'reduce' ? '- Reduce' : '= Set'}
                </button>
              ))}
            </div>

            <input
              type="number"
              min="0"
              value={editingStock.value}
              onChange={e => setEditingStock({ ...editingStock, value: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-muted rounded-lg text-sm"
              placeholder="Quantity"
            />

            {/* Threshold edit */}
            <div>
              <label className="text-xs text-muted-foreground">Low stock threshold</label>
              <input
                type="number"
                min="0"
                defaultValue={products.find(p => p.id === editingStock.id)?.low_stock_threshold ?? 5}
                onChange={e => setEditingThreshold({ id: editingStock.id, value: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="bg-cta text-cta-foreground flex-1" onClick={async () => {
                await updateStock();
                if (editingThreshold && editingThreshold.id === editingStock.id) {
                  await updateThreshold();
                }
              }}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditingStock(null); setEditingThreshold(null); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
