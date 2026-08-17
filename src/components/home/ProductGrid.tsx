import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name_bn: string;
  name_en: string;
  slug: string;
  price: number;
  compare_price: number | null;
  images: string[];
  stock: number | null;
  unit: string | null;
}

interface ProductGridProps {
  title?: string;
  featured?: boolean;
}

const ProductGrid = ({ title, featured }: ProductGridProps) => {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase.from('products').select('id, name_bn, name_en, slug, price, compare_price, images, stock, unit').eq('is_active', true);
      if (featured) query = query.eq('is_featured', true);
      query = query.limit(8);
      const { data } = await query;
      setProducts((data as any[]) || []);
      setLoading(false);
    };
    fetchProducts();
  }, [featured]);

  const displayTitle = title || (featured ? t('featured_products') : t('all_products'));

  if (loading) {
    return (
      <section className="py-6 sm:py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">{displayTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-3 space-y-2"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-4 bg-muted rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold">{displayTitle}</h2>
          <Link to="/products" className="text-sm text-primary font-medium hover:underline">{t('load_more')} →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => {
            const name = language === 'bn' ? product.name_bn : product.name_en;
            const discount = product.compare_price ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;
            const images: string[] = Array.isArray(product.images) ? product.images : [];

            return (
              <div key={product.id} className="bg-card rounded-lg border border-border overflow-hidden group hover:shadow-md transition-shadow">
                <Link to={`/product/${product.slug}`}>
                  <div className="relative aspect-square bg-muted flex items-center justify-center">
                    {images.length > 0 ? (
                      <img src={images[0]} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl sm:text-4xl opacity-30">📦</span>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-cta text-cta-foreground text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded">-{discount}%</span>
                    )}
                  </div>
                </Link>
                <div className="p-2.5 sm:p-3">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="text-xs sm:text-sm font-medium line-clamp-2 mb-1.5 min-h-[2.5em] hover:text-primary transition-colors">{name}</h3>
                  </Link>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-sm sm:text-base font-bold text-primary">৳{product.price}</span>
                    {product.compare_price && <span className="text-[10px] sm:text-xs text-muted-foreground line-through">৳{product.compare_price}</span>}
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-cta hover:bg-cta/90 text-cta-foreground text-xs sm:text-sm h-8 sm:h-9"
                    onClick={() => addItem({
                      id: product.id,
                      name_bn: product.name_bn,
                      name_en: product.name_en,
                      price: product.price,
                      image: images[0] || '',
                      stock: product.stock || 0,
                      unit: product.unit || 'piece',
                    })}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1" />{t('add_to_cart')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
