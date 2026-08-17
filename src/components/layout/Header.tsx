import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Globe, Shield } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { totalItems } = useCart();
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-bold text-primary">{t('site_name')}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">{t('home')}</Link>
            <Link to="/products" className="text-sm font-medium text-foreground hover:text-primary transition-colors">{t('products')}</Link>
            <Link to="/track-order" className="text-sm font-medium text-foreground hover:text-primary transition-colors">{t('track_order')}</Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button onClick={toggleLanguage} className="p-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">{language === 'bn' ? 'EN' : 'বাং'}</span>
            </button>
            <Link to="/cart" className="p-2 rounded-lg hover:bg-muted transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-cta text-cta-foreground text-[10px] font-bold flex items-center justify-center rounded-full min-w-[18px] h-[18px]">
                  {totalItems}
                </span>
              )}
            </Link>
            {isAdmin && (
              <Link to="/admin" className="p-2 rounded-lg hover:bg-muted transition-colors hidden sm:flex">
                <Shield className="h-5 w-5 text-primary" />
              </Link>
            )}
            <Link to={user ? '/dashboard' : '/auth'} className="hidden sm:flex">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <User className="h-4 w-4" />
                <span className="text-sm">{user ? (language === 'bn' ? 'অ্যাকাউন্ট' : 'Account') : t('login')}</span>
              </Button>
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder={t('search_placeholder')} className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" autoFocus />
            </div>
          </div>
        )}
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            <Link to="/" className="py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>{t('home')}</Link>
            <Link to="/products" className="py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>{t('products')}</Link>
            <Link to="/track-order" className="py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>{t('track_order')}</Link>
            <Link to={user ? '/dashboard' : '/auth'} className="py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
              {user ? t('my_account') : t('login')}
            </Link>
            {isAdmin && (
              <Link to="/admin" className="py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-muted text-primary" onClick={() => setMobileMenuOpen(false)}>
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
