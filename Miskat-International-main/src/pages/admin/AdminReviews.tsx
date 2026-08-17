import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Star, Trash2, Edit, Loader2, X, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  text_bn: string | null;
  text_en: string | null;
  screenshot_url: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyForm = {
  id: '',
  customer_name: '',
  rating: 5,
  text_bn: '',
  text_en: '',
  screenshot_url: '',
  is_active: true,
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [hoverRating, setHoverRating] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast({ title: 'Failed to load', description: error.message, variant: 'destructive' });
    else setReviews(data as Review[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setHoverRating(0);
  };

  const handleScreenshot = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from('review-screenshots')
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('review-screenshots').getPublicUrl(path);
      setForm((f) => ({ ...f, screenshot_url: data.publicUrl }));
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.customer_name.trim()) {
      toast({ title: 'Customer name required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      customer_name: form.customer_name.trim(),
      rating: form.rating,
      text_bn: form.text_bn || null,
      text_en: form.text_en || null,
      screenshot_url: form.screenshot_url || null,
      is_active: form.is_active,
    };
    const { error } = form.id
      ? await supabase.from('reviews').update(payload).eq('id', form.id)
      : await supabase.from('reviews').insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: form.id ? 'Review updated' : 'Review added' });
    resetForm();
    load();
  };

  const handleEdit = (r: Review) => {
    setForm({
      id: r.id,
      customer_name: r.customer_name,
      rating: r.rating || 5,
      text_bn: r.text_bn || '',
      text_en: r.text_en || '',
      screenshot_url: r.screenshot_url || '',
      is_active: r.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Review deleted' });
      load();
    }
  };

  const toggleActive = async (r: Review) => {
    const { error } = await supabase.from('reviews').update({ is_active: !r.is_active }).eq('id', r.id);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else load();
  };

  const displayRating = hoverRating || form.rating;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-primary">Customer Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add reviews shown on the homepage carousel.{' '}
          {reviews.length < 10 && (
            <span className="text-cta font-medium">
              Tip: Add at least 10 reviews ({reviews.length}/10) for the best sliding effect.
            </span>
          )}
        </p>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold">{form.id ? 'Edit Review' : 'Add New Review'}</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Customer Name *</Label>
            <Input
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              placeholder="e.g. Rahim Ahmed"
            />
          </div>
          <div>
            <Label>Rating</Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setForm({ ...form, rating: n })}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      n <= displayRating ? 'fill-cta text-cta' : 'text-border'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{form.rating}/5</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Review Text (Bangla)</Label>
            <Textarea
              value={form.text_bn}
              onChange={(e) => setForm({ ...form, text_bn: e.target.value })}
              placeholder="বাংলায় রিভিউ লিখুন বা পেস্ট করুন"
              rows={4}
            />
          </div>
          <div>
            <Label>Review Text (English)</Label>
            <Textarea
              value={form.text_en}
              onChange={(e) => setForm({ ...form, text_en: e.target.value })}
              placeholder="Write or paste the review in English"
              rows={4}
            />
          </div>
        </div>

        <div>
          <Label>Screenshot (optional)</Label>
          <div className="mt-2 flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-sm hover:border-primary/50">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Uploading...' : 'Upload screenshot'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleScreenshot(e.target.files[0])}
              />
            </label>
            {form.screenshot_url && (
              <div className="relative">
                <img src={form.screenshot_url} alt="Screenshot" className="h-16 rounded-md object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, screenshot_url: '' })}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
          <Label>Active (show on homepage)</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {form.id ? 'Update Review' : 'Add Review'}
          </Button>
          {form.id && (
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border font-semibold">All Reviews ({reviews.length})</div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No reviews yet. Add your first one above.</div>
        ) : (
          <div className="divide-y divide-border">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 flex flex-col sm:flex-row gap-3 sm:items-start">
                {r.screenshot_url && (
                  <img src={r.screenshot_url} alt="" className="h-16 w-16 rounded-md object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{r.customer_name}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < (r.rating || 0) ? 'fill-cta text-cta' : 'text-border'}`}
                        />
                      ))}
                    </div>
                    {!r.is_active && (
                      <span className="text-xs px-2 py-0.5 bg-muted rounded">Inactive</span>
                    )}
                  </div>
                  {r.text_en && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.text_en}</p>}
                  {r.text_bn && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.text_bn}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch checked={r.is_active} onCheckedChange={() => toggleActive(r)} />
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(r)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
