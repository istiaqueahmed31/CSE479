import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const DELIVERY_CHARGE = 80;

const checkoutSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  business_name: z.string().trim().max(150, 'Business name too long').optional().or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{10,15}$/, 'Enter a valid phone number (10-15 digits)'),
  email: z.string().trim().email('Invalid email').max(255).optional().or(z.literal('')),
  address: z.string().trim().min(1, 'Address is required').max(500),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  district: z.string().trim().max(100).optional().or(z.literal('')),
});

const Checkout = () => {
  const { language, t } = useLanguage();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: '',
    business_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    payment: 'cod',
  });

  const total = subtotal + DELIVERY_CHARGE;

  const handlePhoneChange = (v: string) => {
    const filtered = v.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
    setForm(f => ({ ...f, phone: filtered }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const k = issue.path[0] as string;
        if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
      });
      setErrors(fieldErrors);
      toast({
        title: language === 'bn' ? 'ফর্মে ত্রুটি আছে' : 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        guest_name: user ? null : form.name,
        guest_phone: user ? null : form.phone,
        guest_email: user ? null : (form.email || null),
        business_name: form.business_name?.trim() || null,
        subtotal,
        delivery_charge: DELIVERY_CHARGE,
        total,
        payment_method: form.payment,
        payment_status: 'pending',
        order_status: 'pending',
      }).select('id').single();

      if (error) throw error;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));
      await supabase.from('order_items').insert(orderItems);

      clearCart();
      toast({ title: t('order_success') });
      navigate(`/track-order?id=${order.id}`);
    } catch (err: any) {
      toast({ title: language === 'bn' ? 'অর্ডার ব্যর্থ হয়েছে' : 'Order failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const inputCls = "w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const errCls = "text-xs text-destructive mt-1";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">{t('checkout')}</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h2 className="font-bold">{language === 'bn' ? 'ডেলিভারি তথ্য' : 'Delivery Information'}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <input
                    placeholder={t('name') + ' *'}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={inputCls}
                  />
                  {errors.name && <p className={errCls}>{errors.name}</p>}
                </div>
                <div>
                  <input
                    placeholder={language === 'bn' ? 'ব্যবসার নাম (ঐচ্ছিক)' : "Business Name (optional)"}
                    value={form.business_name}
                    onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                    className={inputCls}
                  />
                  {errors.business_name && <p className={errCls}>{errors.business_name}</p>}
                </div>
                <div>
                  <input
                    placeholder={t('phone') + ' *'}
                    value={form.phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    inputMode="tel"
                    pattern="^\+?\d{10,15}$"
                    className={inputCls}
                  />
                  {errors.phone && <p className={errCls}>{errors.phone}</p>}
                </div>
                <div>
                  <input
                    placeholder={t('email')}
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    inputMode="email"
                    className={inputCls}
                  />
                  {errors.email && <p className={errCls}>{errors.email}</p>}
                </div>
                <div>
                  <input
                    placeholder={t('district')}
                    value={form.district}
                    onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <input
                    placeholder={t('city')}
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <textarea
                  placeholder={t('address') + ' *'}
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  rows={2}
                  className={inputCls}
                />
                {errors.address && <p className={errCls}>{errors.address}</p>}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h2 className="font-bold">{t('payment_method')}</h2>
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                <input type="radio" name="payment" value="cod" checked={form.payment === 'cod'} onChange={() => setForm(f => ({...f, payment: 'cod'}))} />
                <div>
                  <span className="text-sm font-medium">{t('cod')}</span>
                  <p className="text-xs text-muted-foreground">{t('cod_note')}</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                <input type="radio" name="payment" value="online" checked={form.payment === 'online'} onChange={() => setForm(f => ({...f, payment: 'online'}))} />
                <span className="text-sm font-medium">{t('online_payment')}</span>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-lg p-4 h-fit sticky top-20">
            <h3 className="font-bold mb-3">{language === 'bn' ? 'অর্ডার সারাংশ' : 'Order Summary'}</h3>
            <div className="space-y-2 text-sm">
              {items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="line-clamp-1">{language === 'bn' ? item.name_bn : item.name_en} x{item.quantity}</span>
                  <span>৳{item.price * item.quantity}</span>
                </div>
              ))}
              <hr className="border-border" />
              <div className="flex justify-between"><span>{t('subtotal')}</span><span>৳{subtotal}</span></div>
              <div className="flex justify-between"><span>{t('delivery_charge')}</span><span>৳{DELIVERY_CHARGE}</span></div>
              <hr className="border-border" />
              <div className="flex justify-between text-base font-bold"><span>{t('total')}</span><span>৳{total}</span></div>
            </div>
            <Button type="submit" className="w-full mt-4 bg-cta hover:bg-cta/90 text-cta-foreground" disabled={loading}>
              {loading ? (language === 'bn' ? 'প্রক্রিয়াকরণ...' : 'Processing...') : t('place_order')}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Checkout;
