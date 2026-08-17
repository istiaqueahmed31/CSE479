import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Pencil, X, ImageIcon } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import { RESIZE_PRESETS } from '@/lib/imageResize';

const MAX_HERO = 5;

const AdminBanners = () => {
  const { toast } = useToast();
  const [heroB, setHeroB] = useState<any[]>([]);
  const [promoB, setPromoB] = useState<any[]>([]);
  const [editingHeroId, setEditingHeroId] = useState<string | null>(null);
  const [showAddHero, setShowAddHero] = useState(false);
  const [heroUrl, setHeroUrl] = useState('');
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoUrl, setPromoUrl] = useState('');
  const [promoPosition, setPromoPosition] = useState('left');

  const fetchData = async () => {
    const [h, p] = await Promise.all([
      supabase.from('hero_banners').select('*').order('sort_order'),
      supabase.from('promo_banners').select('*'),
    ]);
    setHeroB(h.data || []);
    setPromoB(p.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  // Hero: add new
  const addHero = async () => {
    if (!heroUrl) { toast({ title: 'Please add an image', variant: 'destructive' }); return; }
    const nextOrder = heroB.length + 1;
    await supabase.from('hero_banners').insert({ image_url: heroUrl, sort_order: nextOrder });
    toast({ title: 'Hero banner added' });
    setShowAddHero(false);
    setHeroUrl('');
    fetchData();
  };

  // Hero: replace image on existing slot
  const replaceHero = async (id: string) => {
    if (!heroUrl) { toast({ title: 'Please add an image', variant: 'destructive' }); return; }
    await supabase.from('hero_banners').update({ image_url: heroUrl }).eq('id', id);
    toast({ title: 'Banner updated' });
    setEditingHeroId(null);
    setHeroUrl('');
    fetchData();
  };

  const removeHero = async (id: string) => {
    await supabase.from('hero_banners').delete().eq('id', id);
    toast({ title: 'Deleted' });
    fetchData();
  };

  // Promo
  const savePromo = async () => {
    if (!promoUrl) { toast({ title: 'Please add an image', variant: 'destructive' }); return; }
    await supabase.from('promo_banners').insert({ image_url: promoUrl, position: promoPosition });
    toast({ title: 'Promo banner added' });
    setShowPromoForm(false);
    setPromoUrl('');
    setPromoPosition('left');
    fetchData();
  };

  const removePromo = async (id: string) => {
    await supabase.from('promo_banners').delete().eq('id', id);
    toast({ title: 'Deleted' });
    fetchData();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Banners</h1>

      <div className="space-y-8">
        {/* Hero Banners — Grid of slots */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Hero Banners ({heroB.length}/{MAX_HERO})</h2>
            {heroB.length < MAX_HERO && !showAddHero && (
              <Button size="sm" onClick={() => { setShowAddHero(true); setEditingHeroId(null); }} className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-1" />Add
              </Button>
            )}
          </div>

          {/* Add new hero form */}
          {showAddHero && (
            <div className="bg-card border border-border rounded-lg p-4 mb-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Add New Hero Banner</p>
                <button onClick={() => { setShowAddHero(false); setHeroUrl(''); }}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <ImageUploader bucket="banners" resizeOptions={RESIZE_PRESETS.heroBanner} onUploaded={(url) => setHeroUrl(url)} />
              {heroUrl && <img src={heroUrl} alt="Preview" className="h-24 rounded-md object-cover" />}
              <Button size="sm" onClick={addHero} className="bg-cta text-cta-foreground">Save Banner</Button>
            </div>
          )}

          {/* Edit existing hero form */}
          {editingHeroId && (
            <div className="bg-card border border-border rounded-lg p-4 mb-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Replace Banner Image</p>
                <button onClick={() => { setEditingHeroId(null); setHeroUrl(''); }}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <ImageUploader bucket="banners" resizeOptions={RESIZE_PRESETS.heroBanner} onUploaded={(url) => setHeroUrl(url)} />
              {heroUrl && <img src={heroUrl} alt="Preview" className="h-24 rounded-md object-cover" />}
              <Button size="sm" onClick={() => replaceHero(editingHeroId)} className="bg-cta text-cta-foreground">Update Banner</Button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {heroB.map((b, i) => (
              <div key={b.id} className="relative group bg-card border border-border rounded-lg overflow-hidden aspect-[16/5]">
                <img src={b.image_url} alt={`Banner ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => { setEditingHeroId(b.id); setShowAddHero(false); setHeroUrl(''); }}
                    className="bg-primary text-primary-foreground rounded-full p-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => removeHero(b.id)} className="bg-destructive text-destructive-foreground rounded-full p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className="absolute top-1 left-1 bg-background/70 text-foreground text-xs px-1.5 py-0.5 rounded">{i + 1}</span>
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: MAX_HERO - heroB.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="border-2 border-dashed border-border rounded-lg aspect-[16/5] flex items-center justify-center text-muted-foreground"
              >
                <ImageIcon className="h-6 w-6" />
              </div>
            ))}
          </div>
        </div>

        {/* Promo Banners */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Promo Banners</h2>
            <Button size="sm" onClick={() => setShowPromoForm(true)} className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" />Add
            </Button>
          </div>

          {showPromoForm && (
            <div className="bg-card border border-border rounded-lg p-4 mb-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Add Promo Banner (auto-resized to 960×600)</p>
                <button onClick={() => { setShowPromoForm(false); setPromoUrl(''); }}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <ImageUploader bucket="banners" resizeOptions={RESIZE_PRESETS.promoBanner} onUploaded={(url) => setPromoUrl(url)} />
              {promoUrl && <img src={promoUrl} alt="Preview" className="h-24 rounded-md object-cover" />}
              <div>
                <label className="text-sm font-medium mb-1 block">Position</label>
                <select value={promoPosition} onChange={e => setPromoPosition(e.target.value)} className="px-3 py-2 bg-muted rounded-lg text-sm">
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <Button size="sm" onClick={savePromo} className="bg-cta text-cta-foreground">Save</Button>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {promoB.map(b => (
              <div key={b.id} className="relative bg-card border border-border rounded-lg overflow-hidden">
                <img src={b.image_url} alt="" className="w-full h-32 object-cover" />
                <div className="p-2 text-xs text-muted-foreground">Position: {b.position}</div>
                <button onClick={() => removePromo(b.id)} className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {promoB.length === 0 && <p className="text-muted-foreground text-sm">No promo banners yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBanners;
