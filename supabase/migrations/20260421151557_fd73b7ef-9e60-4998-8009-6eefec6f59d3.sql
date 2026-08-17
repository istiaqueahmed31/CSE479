ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS screenshot_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('review-screenshots', 'review-screenshots', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Review screenshots are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-screenshots');

CREATE POLICY "Admins can upload review screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-screenshots' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update review screenshots"
ON storage.objects FOR UPDATE
USING (bucket_id = 'review-screenshots' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete review screenshots"
ON storage.objects FOR DELETE
USING (bucket_id = 'review-screenshots' AND public.has_role(auth.uid(), 'admin'));