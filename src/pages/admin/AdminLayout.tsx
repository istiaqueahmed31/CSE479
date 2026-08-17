import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Package,
  ShoppingCart,
  Layers,
  Image,
  LayoutDashboard,
  ArrowLeft,
  Warehouse,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/inventory', icon: Warehouse, label: 'Inventory' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/categories', icon: Layers, label: 'Categories' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
  { to: '/admin/ai-assistant', icon: Sparkles, label: 'AI Copilot' },
];

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-56 bg-card border-r border-border flex-shrink-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
          <h2 className="font-bold text-lg mt-2 text-primary">Admin Panel</h2>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname === item.to ||
                  location.pathname.startsWith(`${item.to}/`);
            const isCopilot = item.to === '/admin/ai-assistant';

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : isCopilot
                    ? 'border border-primary/30 bg-primary/5 hover:bg-primary/10'
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {isCopilot && (
                  <span
                    className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
                      active
                        ? 'bg-primary-foreground/20'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.to === '/admin'
              ? location.pathname === '/admin'
              : location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center py-2 text-[10px] ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <main className="flex-1 p-4 sm:p-6 overflow-auto pb-20 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
