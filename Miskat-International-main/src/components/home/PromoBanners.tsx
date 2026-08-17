import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const PromoBanners = () => {
  const [left, setLeft] = useState<any>(null);
  const [right, setRight] = useState<any>(null);

  useEffect(() => {
    supabase
      .from('promo_banners')
      .select('*')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) {
          setLeft(data.find((b) => b.position === 'left') || null);
          setRight(data.find((b) => b.position === 'right') || null);
        }
      });
  }, []);

  if (!left && !right) {
    return (
      <section className="py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="h-32 sm:h-48 rounded-lg bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
              <p className="text-foreground/70 text-sm font-medium">Promo Banner Left</p>
            </div>
            <div className="h-32 sm:h-48 rounded-lg bg-gradient-to-br from-secondary/30 to-accent/30 flex items-center justify-center">
              <p className="text-foreground/70 text-sm font-medium">Promo Banner Right</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {left ? (
            <a href={left.link || '#'} className="block h-32 sm:h-48 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <img src={left.image_url} alt="" className="w-full h-full object-cover" />
            </a>
          ) : (
            <div className="h-32 sm:h-48 rounded-lg bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
              <p className="text-foreground/70 text-sm font-medium">Promo Banner Left</p>
            </div>
          )}
          {right ? (
            <a href={right.link || '#'} className="block h-32 sm:h-48 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <img src={right.image_url} alt="" className="w-full h-full object-cover" />
            </a>
          ) : (
            <div className="h-32 sm:h-48 rounded-lg bg-gradient-to-br from-secondary/30 to-accent/30 flex items-center justify-center">
              <p className="text-foreground/70 text-sm font-medium">Promo Banner Right</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
