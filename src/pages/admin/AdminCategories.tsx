import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import { RESIZE_PRESETS } from '@/lib/imageResize';

const AdminCategories = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const save = async () => {
    if (!editing.name_en || !editing.slug) {
      toast({ title: 'Name and slug required', variant: 'destructive' });
      return;
    }
    const { id, created_at, updated_at, ...data } = editing;

    if (editing.id) {
      await supabase.from('categories').update(data).eq('id', editing.id);
    } else {
      await supabase.from('categories').insert(data);
    }
    toast({ title: 'Category saved' });
    setShowForm(false);
    setEditing(null);
    fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await supabase.from('categories').delete().eq('id', id);
    toast({ title: 'Category deleted' });
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button size="sm" onClick={() => { setEditing({ name_bn: '', name_en: '', slug: '', sort_order: 0, is_active: true, image_url: '' }); setShowForm(true); }} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" />Add Category
        </Button>
      </div>

      {showForm && editing && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Name (English)" value={editing.name_en} onChange={e => setEditing({...editing, name_en: e.target.value})} className="px-3 py-2 bg-muted rounded-lg text-sm" />
            <input placeholder="নাম (বাংলা)" value={editing.name_bn} onChange={e => setEditing({...editing, name_bn: e.target.value})} className="px-3 py-2 bg-muted rounded-lg text-sm" />
            <input placeholder="Slug" value={editing.slug} onChange={e => setEditing({...editing, slug: e.target.value})} className="px-3 py-2 bg-muted rounded-lg text-sm" />
            <input type="number" placeholder="Sort Order" value={editing.sort_order} onChange={e => setEditing({...editing, sort_order: Number(e.target.value)})} className="px-3 py-2 bg-muted rounded-lg text-sm" />
          </div>

          {/* Category Image */}
          <div>
            <label className="text-sm font-medium mb-1 block">Category Image</label>
            {editing.image_url && (
              <img src={editing.image_url} alt="Category" className="h-16 w-16 rounded-lg object-cover mb-2" />
            )}
            <ImageUploader
              bucket="product-images"
              resizeOptions={RESIZE_PRESETS.category}
              onUploaded={(url) => setEditing({ ...editing, image_url: url })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={e => setEditing({...editing, is_active: e.target.checked})} />Active</label>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} className="bg-cta text-cta-foreground">Save</Button>
            <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-3">Image</th>
            <th className="text-left p-3">Category</th>
            <th className="text-left p-3">Slug</th>
            <th className="text-left p-3">Order</th>
            <th className="text-right p-3">Actions</th>
          </tr></thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name_en} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">—</div>
                  )}
                </td>
                <td className="p-3"><p className="font-medium">{c.name_en}</p><p className="text-xs text-muted-foreground">{c.name_bn}</p></td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditing({...c}); setShowForm(true); }} className="p-1 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(c.id)} className="p-1 hover:text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
