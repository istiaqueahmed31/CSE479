import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import { RESIZE_PRESETS } from '@/lib/imageResize';

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const emptyProduct = { name_bn: '', name_en: '', slug: '', price: 0, compare_price: null, stock: 0, unit: 'piece', category_id: null, description_bn: '', description_en: '', is_featured: false, is_active: true, images: [] };

  const fetchData = async () => {
    const [p, c] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name_en'),
    ]);
    setProducts(p.data || []);
    setCategories(c.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const save = async () => {
    if (!editing.name_en || !editing.slug) {
      toast({ title: 'Name and slug required', variant: 'destructive' });
      return;
    }
    const { id, created_at, updated_at, ...data } = editing;

    if (id) {
      await supabase.from('products').update(data).eq('id', id);
    } else {
      await supabase.from('products').insert(data);
    }
    toast({ title: 'Product saved' });
    setShowForm(false);
    setEditing(null);
    fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast({ title: 'Product deleted' });
    fetchData();
  };

  const addImage = (url: string) => {
    const imgs = [...(editing.images || []), url];
    setEditing({ ...editing, images: imgs });
  };

  const removeImage = (index: number) => {
    const imgs = [...(editing.images || [])];
    imgs.splice(index, 1);
    setEditing({ ...editing, images: imgs });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button size="sm" onClick={() => { setEditing({...emptyProduct}); setShowForm(true); }} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" />Add Product
        </Button>
      </div>

      {showForm && editing && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Name (English)" value={editing.name_en} onChange={e => setEditing({...editing, name_en: e.target.value})} className="px-3 py-2 bg-muted rounded-lg text-sm" />
            <input placeholder="নাম (বাংলা)" value={editing.name_bn} onChange={e => setEditing({...editing, name_bn: e.target.value})} className="px-3 py-2 bg-muted rounded-lg text-sm" />
            <input placeholder="Slug" value={editing.slug} onChange={e => setEditing({...editing, slug: e.target.value})} className="px-3 py-2 bg-muted rounded-lg text-sm" />
            <select value={editing.category_id || ''} onChange={e => setEditing({...editing, category_id: e.target.value || null})} className="px-3 py-2 bg-muted rounded-lg text-sm">
              <option value="">No category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
            </select>
            <input type="number" placeholder="Price" value={editing.price} onChange={e => setEditing({...editing, price: Number(e.target.value)})} className="px-3 py-2 bg-muted rounded-lg text-sm" />
            <input type="number" placeholder="Compare Price" value={editing.compare_price || ''} onChange={e => setEditing({...editing, compare_price: e.target.value ? Number(e.target.value) : null})} className="px-3 py-2 bg-muted rounded-lg text-sm" />
            <input type="number" placeholder="Stock" value={editing.stock} onChange={e => setEditing({...editing, stock: Number(e.target.value)})} className="px-3 py-2 bg-muted rounded-lg text-sm" />
            <input placeholder="Unit" value={editing.unit} onChange={e => setEditing({...editing, unit: e.target.value})} className="px-3 py-2 bg-muted rounded-lg text-sm" />
          </div>
          <textarea placeholder="Description (English)" value={editing.description_en || ''} onChange={e => setEditing({...editing, description_en: e.target.value})} className="w-full px-3 py-2 bg-muted rounded-lg text-sm" rows={2} />
          <textarea placeholder="বিবরণ (বাংলা)" value={editing.description_bn || ''} onChange={e => setEditing({...editing, description_bn: e.target.value})} className="w-full px-3 py-2 bg-muted rounded-lg text-sm" rows={2} />

          {/* Product Images */}
          <div>
            <label className="text-sm font-medium mb-1 block">Product Images</label>
            {editing.images && editing.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {(editing.images as string[]).map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="h-20 w-20 object-cover rounded-md border border-border" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <ImageUploader
              bucket="product-images"
              resizeOptions={RESIZE_PRESETS.product}
              onUploaded={addImage}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_featured} onChange={e => setEditing({...editing, is_featured: e.target.checked})} />Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={e => setEditing({...editing, is_active: e.target.checked})} />Active</label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} className="bg-cta text-cta-foreground">Save</Button>
            <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-3">Product</th>
            <th className="text-left p-3 hidden sm:table-cell">Price</th>
            <th className="text-left p-3 hidden sm:table-cell">Stock</th>
            <th className="text-left p-3 hidden sm:table-cell">Status</th>
            <th className="text-right p-3">Actions</th>
          </tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-3 flex items-center gap-2">
                  {p.images && (p.images as string[]).length > 0 && (
                    <img src={(p.images as string[])[0]} alt="" className="h-10 w-10 object-cover rounded" />
                  )}
                  <div>
                    <p className="font-medium">{p.name_en}</p>
                    <p className="text-xs text-muted-foreground">{p.name_bn}</p>
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell">৳{p.price}</td>
                <td className="p-3 hidden sm:table-cell">{p.stock}</td>
                <td className="p-3 hidden sm:table-cell">
                  <span className={`text-xs font-medium ${p.is_active ? 'text-secondary' : 'text-destructive'}`}>{p.is_active ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditing({...p}); setShowForm(true); }} className="p-1 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-1 hover:text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
