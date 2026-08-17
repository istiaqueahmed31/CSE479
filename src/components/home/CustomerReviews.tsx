import { Star } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const placeholderReviews = [
  { id: '1', customer_name: 'রহিম আহমেদ', rating: 5, text_bn: 'চমৎকার পণ্য এবং দ্রুত ডেলিভারি। খুবই সন্তুষ্ট।', text_en: 'Excellent products and fast delivery. Very satisfied.' },
  { id: '2', customer_name: 'করিম হোসেন', rating: 5, text_bn: 'পাইকারি দামে ভালো মানের পণ্য পেলাম।', text_en: 'Got good quality products at wholesale price.' },
  { id: '3', customer_name: 'সালমা বেগম', rating: 4, text_bn: 'দোকানের জন্য নিয়মিত অর্ডার করি। সবসময় ভালো সার্ভিস পাই।', text_en: 'I order regularly for my shop. Always get great service.' },
];

const CustomerReviews = () => {
  const { language, t } = useLanguage();

  return (
    <section className="py-6 sm:py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{t('customer_reviews')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {placeholderReviews.map((review) => (
            <div key={review.id} className="bg-card rounded-lg p-4 sm:p-5 border border-border">
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? 'fill-cta text-cta' : 'text-border'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                "{language === 'bn' ? review.text_bn : review.text_en}"
              </p>
              <p className="text-sm font-semibold">{review.customer_name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
