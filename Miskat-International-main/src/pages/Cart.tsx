import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { language, t } = useLanguage();
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-bold mb-2">{t('empty_cart')}</h2>
          <Link to="/products"><Button className="bg-cta hover:bg-cta/90 text-cta-foreground mt-2">{t('continue_shopping')}</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">{t('cart')} ({totalItems})</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => {
              const name = language === 'bn' ? item.name_bn : item.name_en;
              return (
                <div key={item.id} className="flex gap-3 bg-card p-3 rounded-lg border border-border">
                  <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image ? <img src={item.image} alt={name} className="w-full h-full object-cover" /> : <span className="text-2xl opacity-30">📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium line-clamp-1">{name}</h3>
                    <p className="text-sm font-bold text-primary mt-1">৳{item.price}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded">
                        <button type="button" className="p-1.5" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}><Minus className="h-3 w-3" /></button>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={item.stock}
                          value={item.quantity}
                          onChange={e => {
                            const v = e.target.value;
                            if (v === '') return;
                            const n = parseInt(v, 10);
                            if (!isNaN(n)) updateQuantity(item.id, Math.max(1, Math.min(n, item.stock)));
                          }}
                          onBlur={e => {
                            const n = parseInt(e.target.value, 10);
                            const clamped = isNaN(n) ? 1 : Math.max(1, Math.min(n, item.stock));
                            updateQuantity(item.id, clamped);
                          }}
                          className="w-14 px-2 py-1 text-xs font-medium text-center bg-transparent border-x border-border focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button type="button" className="p-1.5" onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, item.stock))}><Plus className="h-3 w-3" /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">৳{item.price * item.quantity}</span>
                        <button onClick={() => removeItem(item.id)} className="text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-lg p-4 h-fit sticky top-20">
            <h3 className="font-bold mb-4">{language === 'bn' ? 'অর্ডার সারাংশ' : 'Order Summary'}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-medium">৳{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('delivery_charge')}</span>
                <span className="font-medium text-muted-foreground">{language === 'bn' ? 'চেকআউটে দেখুন' : 'See at checkout'}</span>
              </div>
              <hr className="my-2 border-border" />
              <div className="flex justify-between text-base font-bold">
                <span>{t('subtotal')}</span>
                <span>৳{subtotal}</span>
              </div>
            </div>
            <Link to="/checkout">
              <Button className="w-full mt-4 bg-cta hover:bg-cta/90 text-cta-foreground">
                {t('checkout')}
              </Button>
            </Link>
            <Link to="/products" className="block text-center text-sm text-muted-foreground mt-3 hover:text-foreground">
              {t('continue_shopping')}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
