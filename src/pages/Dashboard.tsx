import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Package, User as UserIcon, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { language, t } = useLanguage();
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState({ full_name: '', phone: '', address: '', city: '', district: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setOrders(data || []));
    supabase.from('profiles').select('*').eq('user_id', user.id).single().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name || '', phone: data.phone || '', address: data.address || '', city: data.city || '', district: data.district || '' });
    });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update(profile).eq('user_id', user.id);
    toast({ title: language === 'bn' ? 'প্রোফাইল আপডেট হয়েছে' : 'Profile updated' });
    setSaving(false);
  };

  const statusColor = (s: string) => {
    if (s === 'delivered') return 'text-secondary';
    if (s === 'cancelled') return 'text-destructive';
    return 'text-cta';
  };

  if (authLoading) return <Layout><div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">{t('my_account')}</h1>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }}>
            <LogOut className="h-4 w-4 mr-1" />{t('logout')}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={tab === 'orders' ? 'default' : 'outline'} size="sm" onClick={() => setTab('orders')} className={tab === 'orders' ? 'bg-primary text-primary-foreground' : ''}>
            <Package className="h-4 w-4 mr-1" />{t('my_orders')}
          </Button>
          <Button variant={tab === 'profile' ? 'default' : 'outline'} size="sm" onClick={() => setTab('profile')} className={tab === 'profile' ? 'bg-primary text-primary-foreground' : ''}>
            <UserIcon className="h-4 w-4 mr-1" />{language === 'bn' ? 'প্রোফাইল' : 'Profile'}
          </Button>
        </div>

        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 && <p className="text-muted-foreground text-center py-8">{language === 'bn' ? 'কোনো অর্ডার নেই' : 'No orders yet'}</p>}
            {orders.map(order => (
              <div key={order.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm font-bold mt-1">৳{order.total}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium capitalize ${statusColor(order.order_status)}`}>{order.order_status}</span>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'profile' && (
          <div className="bg-card border border-border rounded-lg p-4 max-w-lg space-y-3">
            <input placeholder={t('name')} value={profile.full_name} onChange={e => setProfile(p => ({...p, full_name: e.target.value}))} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input placeholder={t('phone')} value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input placeholder={t('district')} value={profile.district} onChange={e => setProfile(p => ({...p, district: e.target.value}))} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input placeholder={t('city')} value={profile.city} onChange={e => setProfile(p => ({...p, city: e.target.value}))} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <textarea placeholder={t('address')} value={profile.address} onChange={e => setProfile(p => ({...p, address: e.target.value}))} rows={2} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <Button onClick={saveProfile} disabled={saving} className="bg-primary text-primary-foreground">
              {saving ? '...' : (language === 'bn' ? 'সেভ করুন' : 'Save')}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
