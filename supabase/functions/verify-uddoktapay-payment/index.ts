import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    let invoice_id: string | null = null;
    let webhookPayload: Record<string, unknown> | null = null;

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({} as Record<string, unknown>));
      // UddoktaPay webhook posts the full invoice payload; we accept either {invoice_id} or full payload
      invoice_id = (body.invoice_id as string) || null;
      if (!invoice_id && (body.status || body.transaction_id || body.metadata)) {
        webhookPayload = body;
        invoice_id = (body.invoice_id as string) || null;
      }
    } else {
      const url = new URL(req.url);
      invoice_id = url.searchParams.get('invoice_id');
    }

    if (!invoice_id) {
      console.error('[uddoktapay:verify] missing invoice_id');
      return new Response(JSON.stringify({ error: 'invoice_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Always verify with UddoktaPay server-side, even if webhook posted us data
    const apiKey = Deno.env.get('UDDOKTAPAY_API_KEY')!;
    const baseUrl = (Deno.env.get('UDDOKTAPAY_BASE_URL') || 'https://sandbox.uddoktapay.com').replace(/\/$/, '');

    console.log('[uddoktapay:verify] verifying', { invoice_id, viaWebhook: !!webhookPayload });

    const upRes = await fetch(`${baseUrl}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'RT-UDDOKTAPAY-API-KEY': apiKey,
      },
      body: JSON.stringify({ invoice_id }),
    });

    const data = await upRes.json();
    console.log('[uddoktapay:verify] upstream response', data);

    const orderId = data?.metadata?.order_id;
    const isAdvance = data?.metadata?.is_advance === '1';
    const rawStatus = String(data?.status || '').toUpperCase();
    const transactionId = data?.transaction_id || null;
    const paidAmount = Number(data?.amount || 0);

    let mappedStatus: 'paid' | 'pending' | 'cancelled' | 'failed';
    if (rawStatus === 'COMPLETED' || rawStatus === 'PAID' || rawStatus === 'SUCCESS') {
      mappedStatus = 'paid';
    } else if (rawStatus === 'PENDING' || rawStatus === 'PROCESSING') {
      mappedStatus = 'pending';
    } else if (rawStatus === 'CANCELLED' || rawStatus === 'CANCELED') {
      mappedStatus = 'cancelled';
    } else {
      mappedStatus = 'failed';
    }

    let alreadyProcessed = false;

    if (orderId) {
      // Idempotency: if already paid, do not re-update
      const { data: existing } = await supabase
        .from('orders')
        .select('id, payment_status')
        .eq('id', orderId)
        .single();

      if (existing?.payment_status === 'paid') {
        alreadyProcessed = true;
        console.log('[uddoktapay:verify] order already paid, skipping update', orderId);
      } else {
        const updates: Record<string, unknown> = {
          payment_invoice_id: invoice_id,
          payment_transaction_id: transactionId,
        };

        if (mappedStatus === 'paid') {
          updates.payment_status = 'paid';
          updates.paid_at = new Date().toISOString();
          if (isAdvance) {
            updates.advance_paid = paidAmount;
          } else {
            updates.advance_paid = paidAmount;
          }
        } else if (mappedStatus === 'cancelled') {
          updates.payment_status = 'cancelled';
          updates.payment_cancelled_at = new Date().toISOString();
        } else if (mappedStatus === 'failed') {
          updates.payment_status = 'failed';
        }
        // pending: do not change payment_status

        const { error: updErr } = await supabase.from('orders').update(updates).eq('id', orderId);
        if (updErr) console.error('[uddoktapay:verify] order update error', updErr);
      }
    } else {
      console.error('[uddoktapay:verify] no order_id in metadata', data);
    }

    return new Response(JSON.stringify({
      paid: mappedStatus === 'paid',
      pending: mappedStatus === 'pending',
      cancelled: mappedStatus === 'cancelled',
      failed: mappedStatus === 'failed',
      already_processed: alreadyProcessed,
      order_id: orderId || null,
      status: data?.status,
      amount: paidAmount,
      transaction_id: transactionId,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[uddoktapay:verify] exception', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
