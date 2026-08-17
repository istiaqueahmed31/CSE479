
-- Seed categories
INSERT INTO public.categories (id, name_bn, name_en, slug, sort_order, is_active) VALUES
('c1000001-0000-4000-a000-000000000001', 'মশলা', 'Spices', 'spices', 1, true),
('c1000001-0000-4000-a000-000000000002', 'চাল ও শস্য', 'Rice & Grains', 'rice-grains', 2, true),
('c1000001-0000-4000-a000-000000000003', 'তেল', 'Oils', 'oils', 3, true),
('c1000001-0000-4000-a000-000000000004', 'বাদাম ও শুকনো ফল', 'Dry Fruits & Nuts', 'dry-fruits', 4, true),
('c1000001-0000-4000-a000-000000000005', 'স্ন্যাকস', 'Snacks', 'snacks', 5, true);

-- Seed products
INSERT INTO public.products (id, category_id, name_bn, name_en, slug, description_bn, description_en, price, compare_price, stock, unit, is_featured, is_active) VALUES
('a1000001-0000-4000-a000-000000000001', 'c1000001-0000-4000-a000-000000000001', 'হলুদ গুঁড়া (১ কেজি)', 'Turmeric Powder (1kg)', 'turmeric-powder-1kg', 'প্রিমিয়াম কোয়ালিটি হলুদ গুঁড়া, খাঁটি ও ভেজালমুক্ত।', 'Premium quality turmeric powder, pure and unadulterated.', 280, 350, 100, 'kg', true, true),
('a1000001-0000-4000-a000-000000000002', 'c1000001-0000-4000-a000-000000000001', 'মরিচ গুঁড়া (৫০০ গ্রাম)', 'Chili Powder (500g)', 'chili-powder-500g', 'ঝাল ও সুগন্ধি মরিচ গুঁড়া।', 'Spicy and aromatic chili powder.', 180, 220, 150, 'pack', true, true),
('a1000001-0000-4000-a000-000000000003', 'c1000001-0000-4000-a000-000000000001', 'জিরা গুঁড়া (২৫০ গ্রাম)', 'Cumin Powder (250g)', 'cumin-powder-250g', 'রান্নার স্বাদ বাড়াতে খাঁটি জিরা গুঁড়া।', 'Pure cumin powder to enhance cooking flavor.', 120, 150, 200, 'pack', false, true),
('a1000001-0000-4000-a000-000000000004', 'c1000001-0000-4000-a000-000000000002', 'বাসমতি চাল (৫ কেজি)', 'Basmati Rice (5kg)', 'basmati-rice-5kg', 'লম্বা দানা বাসমতি চাল, বিরিয়ানি ও পোলাওয়ের জন্য আদর্শ।', 'Long grain basmati rice, ideal for biryani and polao.', 850, 1050, 80, 'bag', true, true),
('a1000001-0000-4000-a000-000000000005', 'c1000001-0000-4000-a000-000000000002', 'মিনিকেট চাল (১০ কেজি)', 'Miniket Rice (10kg)', 'miniket-rice-10kg', 'প্রতিদিনের রান্নার জন্য সেরা মিনিকেট চাল।', 'Best miniket rice for everyday cooking.', 720, 800, 120, 'bag', false, true),
('a1000001-0000-4000-a000-000000000006', 'c1000001-0000-4000-a000-000000000003', 'সয়াবিন তেল (৫ লিটার)', 'Soybean Oil (5L)', 'soybean-oil-5l', 'স্বাস্থ্যকর ও বিশুদ্ধ সয়াবিন তেল।', 'Healthy and pure soybean oil.', 750, 900, 60, 'bottle', true, true),
('a1000001-0000-4000-a000-000000000007', 'c1000001-0000-4000-a000-000000000003', 'সরিষার তেল (১ লিটার)', 'Mustard Oil (1L)', 'mustard-oil-1l', 'খাঁটি ঘানি ভাঙা সরিষার তেল।', 'Pure cold-pressed mustard oil.', 320, 380, 90, 'bottle', false, true),
('a1000001-0000-4000-a000-000000000008', 'c1000001-0000-4000-a000-000000000004', 'কাজু বাদাম (৫০০ গ্রাম)', 'Cashew Nuts (500g)', 'cashew-nuts-500g', 'প্রিমিয়াম কোয়ালিটি কাজু বাদাম।', 'Premium quality cashew nuts.', 650, 800, 50, 'pack', true, true),
('a1000001-0000-4000-a000-000000000009', 'c1000001-0000-4000-a000-000000000004', 'কিসমিস (২৫০ গ্রাম)', 'Raisins (250g)', 'raisins-250g', 'মিষ্টি ও সুস্বাদু কিসমিস।', 'Sweet and delicious raisins.', 180, 220, 100, 'pack', false, true),
('a1000001-0000-4000-a000-000000000010', 'c1000001-0000-4000-a000-000000000004', 'খেজুর (১ কেজি)', 'Dates (1kg)', 'dates-1kg', 'আরব দেশ থেকে আমদানিকৃত প্রিমিয়াম খেজুর।', 'Premium dates imported from Arab countries.', 450, 550, 70, 'pack', true, true),
('a1000001-0000-4000-a000-000000000011', 'c1000001-0000-4000-a000-000000000005', 'চানাচুর (৫০০ গ্রাম)', 'Chanachur Mix (500g)', 'chanachur-500g', 'ঝাল-মিষ্টি চানাচুর মিক্স।', 'Spicy-sweet chanachur snack mix.', 90, 120, 200, 'pack', false, true),
('a1000001-0000-4000-a000-000000000012', 'c1000001-0000-4000-a000-000000000005', 'মুড়ি (১ কেজি)', 'Puffed Rice (1kg)', 'puffed-rice-1kg', 'হালকা ও মুচমুচে মুড়ি।', 'Light and crispy puffed rice.', 60, 80, 300, 'pack', false, true);
