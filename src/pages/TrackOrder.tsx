import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-5 w-5" />,
  confirmed: <Package className="h-5 w-5" />,
  processing: <Package className="h-5 w-5" />,
  shipped: <Truck className="h-5 w-5" />,
  delivered: <CheckCircle className="h-5 w-5" />,
};

const TrackOrder = () => {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (id?: string) => {
    const searchId = id || orderId;
    if (!searchId.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase.from('orders').select('*').eq('id', searchId).single();
    setOrder(data);
    if (data) {
      const { data: oi } = await supabase.from('order_items').select('*, products(name_bn, name_en)').eq('order_id', data.id);
      setItems(oi || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (searchParams.get('id')) search(searchParams.get('id')!);
  }, []);

  const currentStep = order ? statusSteps.indexOf(order.order_status) : -1;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-xl font-bold mb-6">{t('track_order')}</h1>

        <div className="flex gap-2 mb-6">
          <input
            placeholder={language === 'bn' ? 'অর্ডার আইডি লিখুন' : 'Enter Order ID'}
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button onClick={() => search()} disabled={loading} className="bg-primary text-primary-foreground">
            {language === 'bn' ? 'খুঁজুন' : 'Search'}
          </Button>
        </div>

        {loading && <div className="text-center py-8 text-muted-foreground">Loading...</div>}

        {searched && !loading && !order && (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'bn' ? 'অর্ডার পাওয়া যায়নি' : 'Order not found'}
          </div>
        )}

        {order && !loading && (
          <div className="space-y-6">
            {/* Status timeline */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-6">
                {statusSteps.map((step, i) => (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {statusIcons[step]}
                    </div>
                    <span className="text-[10px] mt-1 capitalize">{step}</span>
                    {i < statusSteps.length - 1 && (
                      <div className="hidden" /> // connector handled by flex
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order details */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono text-xs">{order.id.slice(0, 8)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('payment_method')}</span><span className="capitalize">{order.payment_method}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('subtotal')}</span><span>৳{order.subtotal}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('delivery_charge')}</span><span>৳{order.delivery_charge}</span></div>
              <div className="flex justify-between font-bold"><span>{t('total')}</span><span>৳{order.total}</span></div>
            </div>

            {/* Items */}
            {items.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-bold mb-3">{language === 'bn' ? 'পণ্যসমূহ' : 'Items'}</h3>
                <div className="space-y-2 text-sm">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{language === 'bn' ? item.products?.name_bn : item.products?.name_en} x{item.quantity}</span>
                      <span>৳{item.unit_price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrackOrder;
