import { useLanguage } from '@/i18n/LanguageContext';
import { Truck, Shield, BadgeDollarSign, Headphones } from 'lucide-react';

const KeyPoints = () => {
  const { language, t } = useLanguage();

  const points = [
    {
      icon: BadgeDollarSign,
      title_bn: 'পাইকারি দাম',
      title_en: 'Wholesale Price',
      desc_bn: 'সরাসরি কারখানা থেকে পাইকারি দামে পণ্য',
      desc_en: 'Products at wholesale price direct from factory',
    },
    {
      icon: Truck,
      title_bn: 'দ্রুত ডেলিভারি',
      title_en: 'Fast Delivery',
      desc_bn: 'সারাদেশে দ্রুত ও নিরাপদ ডেলিভারি',
      desc_en: 'Fast and safe delivery nationwide',
    },
    {
      icon: Shield,
      title_bn: 'গুণগত মান',
      title_en: 'Quality Assured',
      desc_bn: '১০০% খাঁটি এবং মানসম্মত পণ্যের নিশ্চয়তা',
      desc_en: '100% genuine and quality assured products',
    },
    {
      icon: Headphones,
      title_bn: '২৪/৭ সাপোর্ট',
      title_en: '24/7 Support',
      desc_bn: 'যেকোনো সময় যোগাযোগ করুন',
      desc_en: 'Contact us anytime for support',
    },
  ];

  return (
    <section className="py-6 sm:py-10 bg-accent/20">
      <div className="container mx-auto px-4">
        <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{t('why_choose_us')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {points.map((point, i) => (
            <div key={i} className="bg-card rounded-lg p-4 sm:p-5 text-center border border-border hover:shadow-md transition-shadow">
              <point.icon className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 text-primary" />
              <h3 className="text-sm sm:text-base font-semibold mb-1">
                {language === 'bn' ? point.title_bn : point.title_en}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                {language === 'bn' ? point.desc_bn : point.desc_en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyPoints;
