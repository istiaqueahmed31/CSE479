import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
        toast({ title: language === 'bn' ? 'লগইন সফল' : 'Login successful' });
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: language === 'bn' ? 'রেজিস্ট্রেশন সফল! ইমেইল ভেরিফাই করুন।' : 'Registration successful! Please verify your email.' });
      }
    } catch (err: any) {
      toast({ title: language === 'bn' ? 'ত্রুটি' : 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-md bg-card border border-border rounded-lg p-6">
          <h1 className="text-xl font-bold text-center mb-6">
            {isLogin ? t('login') : t('register')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                placeholder={t('name')}
                value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
                className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}
            <input
              type="email"
              required
              placeholder={t('email')}
              value={form.email}
              onChange={e => setForm(f => ({...f, email: e.target.value}))}
              className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder={language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              value={form.password}
              onChange={e => setForm(f => ({...f, password: e.target.value}))}
              className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button type="submit" className="w-full bg-cta hover:bg-cta/90 text-cta-foreground" disabled={loading}>
              {loading ? '...' : isLogin ? t('login') : t('register')}
            </Button>
          </form>

          <p className="text-center text-sm mt-4">
            {isLogin
              ? (language === 'bn' ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? ")
              : (language === 'bn' ? 'ইতোমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? ')}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
              {isLogin ? t('register') : t('login')}
            </button>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
