import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const fallbackBanners = [
  { id: 'f1', image_url: '', link: '#', color: 'from-primary to-secondary' },
];

const HeroBanner = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('hero_banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setBanners(data && data.length > 0 ? data : []);
        setLoading(false);
      });
  }, []);

  const items = banners.length > 0 ? banners : fallbackBanners;
  const count = items.length;

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [count]);

  if (loading) {
    return <div className="h-[200px] sm:h-[300px] md:h-[400px] lg:h-[480px] bg-muted animate-pulse" />;
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[200px] sm:h-[300px] md:h-[400px] lg:h-[480px]">
        {items.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {banner.image_url ? (
              <img
                src={banner.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-r ${banner.color || 'from-primary to-secondary'} flex items-center justify-center`}>
                <div className="text-center text-primary-foreground px-4">
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
                    পাইকারি দামে সেরা পণ্য
                  </h2>
                  <p className="text-sm sm:text-lg opacity-90">
                    Wholesale Products at Best Prices
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + count) % count)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center hover:bg-background/70 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % count)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center hover:bg-background/70 transition-colors"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? 'bg-primary-foreground w-6' : 'bg-primary-foreground/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
