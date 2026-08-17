import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Clock, AlertTriangle } from 'lucide-react';

type Status = 'verifying' | 'success' | 'failed' | 'cancelled' | 'pending';

const PaymentReturn = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<Status>('verifying');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const invoice_id = params.get('invoice_id');

  const verify = async () => {
    if (!invoice_id) {
      setStatus('cancelled');
      return;
    }
    setRetrying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-uddoktapay-payment', {
        body: { invoice_id },
      });
      if (error || !data) {
        setStatus('failed');
        toast({ title: t('payment_failed'), variant: 'destructive' });
        return;
      }
      setOrderId(data.order_id || null);
      if (data.paid) {
        setStatus('success');
        clearCart();
        toast({ title: t('payment_success') });
        setTimeout(() => navigate(`/track-order?id=${data.order_id}`), 1800);
      } else if (data.pending) {
        setStatus('pending');
      } else if (data.cancelled) {
        setStatus('cancelled');
      } else {
        setStatus('failed');
      }
    } catch (err) {
      console.error('verify error', err);
      setStatus('failed');
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice_id]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center max-w-lg">
        {status === 'verifying' && (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h1 className="text-xl font-bold">
              {language === 'bn' ? 'পেমেন্ট যাচাই হচ্ছে...' : 'Verifying payment...'}
            </h1>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('payment_success')}</h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'আপনাকে রিডাইরেক্ট করা হচ্ছে...' : 'Redirecting...'}
            </p>
          </>
        )}

        {status === 'pending' && (
          <>
            <Clock className="h-16 w-16 text-cta mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('payment_pending')}</h1>
            <p className="text-muted-foreground mb-6">
              {language === 'bn'
                ? 'আমরা আপনার পেমেন্ট যাচাই করছি। কিছুক্ষণ পর আবার চেষ্টা করুন।'
                : "We're verifying your payment. Please retry in a moment."}
            </p>
            <div className="flex gap-3">
              <Button onClick={verify} disabled={retrying}>
                {retrying
                  ? (language === 'bn' ? 'যাচাই হচ্ছে...' : 'Verifying...')
                  : (language === 'bn' ? 'আবার যাচাই করুন' : 'Retry verification')}
              </Button>
              {orderId && (
                <Button variant="outline" onClick={() => navigate(`/track-order?id=${orderId}`)}>
                  {language === 'bn' ? 'অর্ডার দেখুন' : 'View Order'}
                </Button>
              )}
            </div>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <AlertTriangle className="h-16 w-16 text-cta mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('payment_cancelled')}</h1>
            <p className="text-muted-foreground mb-6">
              {language === 'bn'
                ? 'পেমেন্ট বাতিল করা হয়েছে। আপনি আবার চেষ্টা করতে পারেন।'
                : 'The payment was cancelled. You can try again.'}
            </p>
            <div className="flex gap-3">
              {orderId && (
                <Button variant="outline" onClick={() => navigate(`/track-order?id=${orderId}`)}>
                  {language === 'bn' ? 'অর্ডার দেখুন' : 'View Order'}
                </Button>
              )}
              <Button onClick={() => navigate('/cart')}>
                {language === 'bn' ? 'কার্টে ফিরে যান' : 'Back to Cart'}
              </Button>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('payment_failed')}</h1>
            <p className="text-muted-foreground mb-6">
              {language === 'bn'
                ? 'পেমেন্ট সম্পূর্ণ হয়নি। আবার চেষ্টা করুন।'
                : 'The payment was not completed. Please try again.'}
            </p>
            <div className="flex gap-3">
              {orderId && (
                <Button variant="outline" onClick={() => navigate(`/track-order?id=${orderId}`)}>
                  {language === 'bn' ? 'অর্ডার দেখুন' : 'View Order'}
                </Button>
              )}
              <Button onClick={() => navigate('/cart')}>
                {language === 'bn' ? 'কার্টে ফিরে যান' : 'Back to Cart'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default PaymentReturn;
