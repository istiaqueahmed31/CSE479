import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Filter } from 'lucide-react';

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
  category_id: string | null;
}

interface Category {
  id: string;
  name_bn: string;
  name_en: string;
  slug: string;
}

const Products = () => {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('id, name_bn, name_en, slug, price, compare_price, images, stock, unit, category_id').eq('is_active', true),
        supabase.from('categories').select('id, name_bn, name_en, slug').eq('is_active', true).order('sort_order'),
      ]);
      setProducts((prodRes.data as any[]) || []);
      setCategories((catRes.data as any[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  let filtered = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  if (sortBy === 'price_asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sortBy === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">{t('all_products')}</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? 'bg-primary text-primary-foreground' : ''}
          >
            {language === 'bn' ? 'সব' : 'All'}
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : ''}
            >
              {language === 'bn' ? cat.name_bn : cat.name_en}
            </Button>
          ))}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="ml-auto text-sm border border-border rounded-lg px-3 py-1.5 bg-card"
          >
            <option value="default">{language === 'bn' ? 'ডিফল্ট' : 'Default'}</option>
            <option value="price_asc">{language === 'bn' ? 'দাম: কম → বেশি' : 'Price: Low → High'}</option>
            <option value="price_desc">{language === 'bn' ? 'দাম: বেশি → কম' : 'Price: High → Low'}</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map(product => {
              const name = language === 'bn' ? product.name_bn : product.name_en;
              const discount = product.compare_price
                ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                : 0;
              const images = Array.isArray(product.images) ? product.images : [];

              return (
                <div key={product.id} className="bg-card rounded-lg border border-border overflow-hidden group hover:shadow-md transition-shadow">
                  <Link to={`/product/${product.slug}`}>
                    <div className="relative aspect-square bg-muted flex items-center justify-center">
                      {images.length > 0 ? (
                        <img src={images[0] as string} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl sm:text-4xl opacity-30">📦</span>
                      )}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-cta text-cta-foreground text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded">
                          -{discount}%
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-2.5 sm:p-3">
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="text-xs sm:text-sm font-medium line-clamp-2 mb-1.5 min-h-[2.5em] hover:text-primary transition-colors">{name}</h3>
                    </Link>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-sm sm:text-base font-bold text-primary">৳{product.price}</span>
                      {product.compare_price && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground line-through">৳{product.compare_price}</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-cta hover:bg-cta/90 text-cta-foreground text-xs sm:text-sm h-8 sm:h-9"
                      onClick={() => addItem({
                        id: product.id,
                        name_bn: product.name_bn,
                        name_en: product.name_en,
                        price: product.price,
                        image: images[0] as string || '',
                        stock: product.stock || 0,
                        unit: product.unit || 'piece',
                      })}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                      {t('add_to_cart')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
