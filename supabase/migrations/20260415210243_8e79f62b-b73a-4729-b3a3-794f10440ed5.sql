
-- Add inventory columns to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS reserved_stock integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_status text NOT NULL DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS stock_status_override text DEFAULT NULL;

-- Function to compute stock status
CREATE OR REPLACE FUNCTION public.compute_stock_status(
  _stock integer,
  _threshold integer,
  _override text
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF _override IS NOT NULL THEN
    RETURN _override;
  END IF;
  IF _stock <= 0 THEN
    RETURN 'out_of_stock';
  ELSIF _stock <= _threshold THEN
    RETURN 'low_stock';
  ELSE
    RETURN 'in_stock';
  END IF;
END;
$$;

-- Trigger function: deduct stock on order_items insert and update status
CREATE OR REPLACE FUNCTION public.deduct_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET
    stock = GREATEST(stock - NEW.quantity, 0),
    stock_status = public.compute_stock_status(
      GREATEST(stock - NEW.quantity, 0),
      low_stock_threshold,
      stock_status_override
    )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

-- Trigger on order_items
CREATE TRIGGER trg_deduct_stock_on_order
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.deduct_stock_on_order();

-- Function to release stock when order is cancelled
CREATE OR REPLACE FUNCTION public.release_order_stock(_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products p
  SET
    stock = p.stock + oi.quantity,
    stock_status = public.compute_stock_status(
      p.stock + oi.quantity,
      p.low_stock_threshold,
      p.stock_status_override
    )
  FROM public.order_items oi
  WHERE oi.order_id = _order_id
    AND oi.product_id = p.id;
END;
$$;
