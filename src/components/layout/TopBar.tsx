import { useLanguage } from '@/i18n/LanguageContext';

const TopBar = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden">
      <div className="py-1.5 flex items-center">
        <div className="animate-slide-left whitespace-nowrap text-xs sm:text-sm font-medium">
          {t('topbar_welcome')} &nbsp;&nbsp;•&nbsp;&nbsp; {t('topbar_welcome')} &nbsp;&nbsp;•&nbsp;&nbsp; {t('topbar_welcome')}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
