ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_invoice_id text NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_transaction_id text NULL;