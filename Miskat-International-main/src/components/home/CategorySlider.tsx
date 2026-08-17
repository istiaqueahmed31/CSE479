import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const CategorySlider = () => {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order').then(({ data }) => setCategories(data || []));
  }, []);

  return (
    <section className="py-6 sm:py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">{t('categories')}</h2>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="flex-shrink-0 w-24 sm:w-32 cursor-pointer group"
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-full bg-accent/50 flex items-center justify-center mb-2 group-hover:bg-accent transition-colors border-2 border-transparent group-hover:border-primary/20 overflow-hidden">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={language === 'bn' ? cat.name_bn : cat.name_en} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl sm:text-3xl">🛒</span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-medium text-center truncate">
                {language === 'bn' ? cat.name_bn : cat.name_en}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
