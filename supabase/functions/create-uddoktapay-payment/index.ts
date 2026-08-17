import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BodySchema = z.object({
  order_id: z.string().uuid(),
  return_url: z.string().url(),
  cancel_url: z.string().url().optional(),
  amount: z.number().positive().optional(),
  is_advance: z.boolean().optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      console.error('[uddoktapay:create] invalid body', parsed.error.flatten());
      return new Response(JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { order_id, return_url, cancel_url, amount, is_advance } = parsed.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (error || !order) {
      console.error('[uddoktapay:create] order not found', order_id, error);
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('UDDOKTAPAY_API_KEY')!;
    const baseUrl = (Deno.env.get('UDDOKTAPAY_BASE_URL') || 'https://sandbox.uddoktapay.com').replace(/\/$/, '');

    const chargeAmount = typeof amount === 'number' && amount > 0 ? amount : Number(order.total);

    const payload = {
      full_name: order.guest_name || 'Customer',
      email: order.guest_email || 'noemail@example.com',
      amount: String(chargeAmount),
      metadata: { order_id: order.id, is_advance: is_advance ? '1' : '0' },
      redirect_url: return_url,
      cancel_url: cancel_url || return_url,
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-uddoktapay-payment`,
      return_type: 'GET',
    };

    console.log('[uddoktapay:create] creating session', { order_id, chargeAmount, is_advance, baseUrl });

    const upRes = await fetch(`${baseUrl}/api/checkout-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'RT-UDDOKTAPAY-API-KEY': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const upData = await upRes.json();
    if (!upRes.ok || upData.status === false || !upData.payment_url) {
      console.error('[uddoktapay:create] upstream error', upRes.status, upData);
      return new Response(JSON.stringify({ error: upData.message || 'Failed to create payment', details: upData }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const updatePatch: Record<string, unknown> = {};
    if (upData.invoice_id) updatePatch.payment_invoice_id = upData.invoice_id;
    if (Object.keys(updatePatch).length > 0) {
      await supabase.from('orders').update(updatePatch).eq('id', order.id);
    }

    console.log('[uddoktapay:create] success', { order_id, invoice_id: upData.invoice_id });

    return new Response(JSON.stringify({ payment_url: upData.payment_url, invoice_id: upData.invoice_id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[uddoktapay:create] exception', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
