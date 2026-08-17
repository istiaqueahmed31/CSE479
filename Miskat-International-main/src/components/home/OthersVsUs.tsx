import { useLanguage } from '@/i18n/LanguageContext';
import { Check, X } from 'lucide-react';

const OthersVsUs = () => {
  const { language, t } = useLanguage();

  const comparisons = language === 'bn' ? [
    { feature: 'পাইকারি দাম', us: true, others: false },
    { feature: 'সরাসরি সোর্সিং', us: true, others: false },
    { feature: 'গুণগত মান নিশ্চয়তা', us: true, others: false },
    { feature: 'দ্রুত ডেলিভারি', us: true, others: true },
    { feature: 'সহজ রিটার্ন পলিসি', us: true, others: false },
    { feature: 'COD পেমেন্ট', us: true, others: true },
  ] : [
    { feature: 'Wholesale Pricing', us: true, others: false },
    { feature: 'Direct Sourcing', us: true, others: false },
    { feature: 'Quality Assurance', us: true, others: false },
    { feature: 'Fast Delivery', us: true, others: true },
    { feature: 'Easy Return Policy', us: true, others: false },
    { feature: 'COD Payment', us: true, others: true },
  ];

  return (
    <section className="py-6 sm:py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{t('others_vs_us')}</h2>
        <div className="max-w-xl mx-auto bg-card rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-3 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold">
            <div className="p-3 text-center">{language === 'bn' ? 'সুবিধা' : 'Feature'}</div>
            <div className="p-3 text-center">{language === 'bn' ? 'অন্যরা' : 'Others'}</div>
            <div className="p-3 text-center bg-cta text-cta-foreground">{language === 'bn' ? 'আমরা' : 'Us'}</div>
          </div>
          {comparisons.map((row, i) => (
            <div key={i} className="grid grid-cols-3 border-t border-border text-xs sm:text-sm">
              <div className="p-3">{row.feature}</div>
              <div className="p-3 flex justify-center">
                {row.others ? <Check className="h-4 w-4 text-secondary" /> : <X className="h-4 w-4 text-destructive" />}
              </div>
              <div className="p-3 flex justify-center bg-cta/5">
                {row.us ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-destructive" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OthersVsUs;
