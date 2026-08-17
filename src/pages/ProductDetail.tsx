import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react';

const ProductDetail = () => {
  const { slug } = useParams();
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('slug', slug).eq('is_active', true).single();
      setProduct(data);
      if (data?.category_id) {
        const { data: rel } = await supabase.from('products').select('id, name_bn, name_en, slug, price, compare_price, images, stock, unit')
          .eq('category_id', data.category_id).eq('is_active', true).neq('id', data.id).limit(4);
        setRelated(rel || []);
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-20 bg-muted rounded" />
              <div className="h-12 bg-muted rounded w-1/2" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">{language === 'bn' ? 'পণ্যটি পাওয়া যায়নি' : 'Product not found'}</p>
          <Link to="/products"><Button className="mt-4">{t('continue_shopping')}</Button></Link>
        </div>
      </Layout>
    );
  }

  const name = language === 'bn' ? product.name_bn : product.name_en;
  const desc = language === 'bn' ? product.description_bn : product.description_en;
  const images: string[] = Array.isArray(product.images) ? product.images : [];
  const discount = product.compare_price ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;
  const inStock = (product.stock || 0) > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />{language === 'bn' ? 'পণ্যসমূহে ফিরুন' : 'Back to Products'}
        </Link>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Image */}
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {images.length > 0 ? (
              <img src={images[0]} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl opacity-30">📦</span>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">{name}</h1>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-primary">৳{product.price}</span>
              {product.compare_price && (
                <>
                  <span className="text-base text-muted-foreground line-through">৳{product.compare_price}</span>
                  <span className="text-sm font-semibold text-cta">-{discount}%</span>
                </>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-1">
              {t('per_unit')}: {product.unit || 'piece'}
            </p>
            <p className={`text-sm font-medium mb-4 ${inStock ? 'text-secondary' : 'text-destructive'}`}>
              {inStock ? `${t('in_stock')} (${product.stock})` : t('out_of_stock')}
            </p>

            {desc && <p className="text-sm text-foreground/80 mb-6 leading-relaxed">{desc}</p>}

            {/* Qty selector + Add to cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-border rounded-lg">
                <button className="p-2" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></button>
                <span className="px-4 text-sm font-medium">{qty}</span>
                <button className="p-2" onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}><Plus className="h-4 w-4" /></button>
              </div>
              <Button
                className="flex-1 bg-cta hover:bg-cta/90 text-cta-foreground"
                disabled={!inStock}
                onClick={() => {
                  addItem({
                    id: product.id,
                    name_bn: product.name_bn,
                    name_en: product.name_en,
                    price: product.price,
                    image: images[0] || '',
                    stock: product.stock || 0,
                    unit: product.unit || 'piece',
                  }, qty);
                  setQty(1);
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('add_to_cart')}
              </Button>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold mb-4">{language === 'bn' ? 'সম্পর্কিত পণ্য' : 'Related Products'}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {related.map(p => {
                const rImages: string[] = Array.isArray(p.images) ? p.images : [];
                return (
                  <Link key={p.id} to={`/product/${p.slug}`} className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {rImages.length > 0 ? <img src={rImages[0]} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl opacity-30">📦</span>}
                    </div>
                    <div className="p-2.5">
                      <h3 className="text-xs font-medium line-clamp-2 mb-1">{language === 'bn' ? p.name_bn : p.name_en}</h3>
                      <span className="text-sm font-bold text-primary">৳{p.price}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
