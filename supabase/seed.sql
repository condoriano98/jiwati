-- Seed data for the Natural-health storefront (Bahasa Indonesia).
-- Safe to re-run: uses deterministic slugs with upserts.

-- Brands ---------------------------------------------------------------------
insert into brands (name, slug, logo) values
  ('NutriPro', 'nutripro', null),
  ('Herbalia', 'herbalia', null),
  ('VitaForce', 'vitaforce', null),
  ('PureNature', 'purenature', null),
  ('FitFuel', 'fitfuel', null)
on conflict (slug) do nothing;

-- Categories (belanja per tujuan / kesehatan) --------------------------------
insert into categories (name, slug, description, image, sort_order) values
  ('Tambah Berat Badan', 'tambah-berat-badan',
   'Suplemen penambah massa & kalori untuk membantu menaikkan berat badan secara sehat.',
   'https://images.unsplash.com/photo-1579722821273-0f6c1b5d0b9c?auto=format&fit=crop&w=800&q=60', 1),
  ('Sebelum Latihan', 'sebelum-latihan',
   'Pre-workout & booster energi agar latihan lebih maksimal.',
   'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=60', 2),
  ('Pemulihan Setelah Latihan', 'pemulihan-setelah-latihan',
   'Protein & BCAA untuk pemulihan otot setelah berolahraga.',
   'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=60', 3),
  ('Kekuatan & Performa', 'kekuatan-performa',
   'Creatine & suplemen performa untuk kekuatan maksimal.',
   'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?auto=format&fit=crop&w=800&q=60', 4),
  ('Vitamin & Imun', 'vitamin-imun',
   'Multivitamin dan penjaga daya tahan tubuh sehari-hari.',
   'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=800&q=60', 5),
  ('Herbal & Alami', 'herbal-alami',
   'Produk herbal alami untuk kesehatan menyeluruh.',
   'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=60', 6)
on conflict (slug) do nothing;

-- Products -------------------------------------------------------------------
-- Helper inserts reference brands/categories by slug.
with b as (select slug, id from brands), c as (select slug, id from categories)
insert into products (name, slug, description, price, compare_at_price, stock, sku, brand_id, images, rating, is_bestseller)
values
  ('Whey Protein Isolate 1kg Cokelat', 'whey-protein-isolate-1kg-cokelat',
   'Protein whey isolate murni 27g per sajian. Cepat diserap untuk pemulihan otot maksimal.',
   549000, 649000, 40, 'WPI-1K-CHO', (select id from b where slug='nutripro'),
   array['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=70'], 4.8, true),
  ('Mass Gainer 3kg Vanilla', 'mass-gainer-3kg-vanilla',
   'Penambah berat badan 1250 kalori per sajian dengan karbohidrat & protein seimbang.',
   685000, null, 25, 'MG-3K-VAN', (select id from b where slug='fitfuel'),
   array['https://images.unsplash.com/photo-1606889464198-fcb18894cf50?auto=format&fit=crop&w=800&q=70'], 4.6, true),
  ('Pre-Workout Booster Mangga', 'pre-workout-booster-mangga',
   'Pre-workout dengan kafein + beta-alanine untuk fokus dan energi latihan.',
   295000, 350000, 60, 'PWO-MNG', (select id from b where slug='vitaforce'),
   array['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=70'], 4.5, true),
  ('Creatine Monohydrate 300g', 'creatine-monohydrate-300g',
   'Creatine micronized murni untuk peningkatan kekuatan & performa.',
   210000, null, 80, 'CRE-300', (select id from b where slug='nutripro'),
   array['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=70'], 4.7, false),
  ('BCAA 2:1:1 Jeruk 250g', 'bcaa-211-jeruk-250g',
   'Asam amino rantai cabang untuk mengurangi nyeri otot dan mempercepat pemulihan.',
   245000, 280000, 55, 'BCAA-ORG', (select id from b where slug='fitfuel'),
   array['https://images.unsplash.com/photo-1622818425825-1c2a8f5b0b8a?auto=format&fit=crop&w=800&q=70'], 4.4, false),
  ('Multivitamin Harian 60 Tablet', 'multivitamin-harian-60-tablet',
   'Multivitamin lengkap A-Z untuk menjaga daya tahan tubuh setiap hari.',
   125000, null, 120, 'MV-60', (select id from b where slug='herbalia'),
   array['https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=800&q=70'], 4.6, true),
  ('Vitamin C 1000mg 30 Tablet', 'vitamin-c-1000mg-30-tablet',
   'Vitamin C dosis tinggi untuk imunitas dan antioksidan.',
   75000, 95000, 200, 'VC-1000', (select id from b where slug='vitaforce'),
   array['https://images.unsplash.com/photo-1626197031507-c17099753214?auto=format&fit=crop&w=800&q=70'], 4.5, false),
  ('Madu Hutan Murni 500ml', 'madu-hutan-murni-500ml',
   'Madu hutan alami tanpa campuran, kaya enzim dan antioksidan.',
   135000, null, 90, 'HNY-500', (select id from b where slug='purenature'),
   array['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=70'], 4.9, true),
  ('Omega-3 Fish Oil 100 Softgel', 'omega-3-fish-oil-100-softgel',
   'Minyak ikan EPA & DHA untuk kesehatan jantung dan otak.',
   165000, 199000, 70, 'OMG-100', (select id from b where slug='herbalia'),
   array['https://images.unsplash.com/photo-1559757175-7b21e7afdd29?auto=format&fit=crop&w=800&q=70'], 4.7, false),
  ('Kolagen Peptide 200g', 'kolagen-peptide-200g',
   'Kolagen peptida untuk kesehatan kulit, sendi, dan rambut.',
   289000, null, 45, 'COL-200', (select id from b where slug='purenature'),
   array['https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=70'], 4.6, false),
  ('Teh Herbal Detox 30 Sachet', 'teh-herbal-detox-30-sachet',
   'Campuran herbal alami untuk membantu detoksifikasi tubuh.',
   89000, 110000, 110, 'TEA-DTX', (select id from b where slug='herbalia'),
   array['https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=70'], 4.3, false),
  ('Glutamine Recovery 250g', 'glutamine-recovery-250g',
   'L-Glutamine untuk pemulihan otot dan kesehatan pencernaan.',
   199000, null, 50, 'GLU-250', (select id from b where slug='nutripro'),
   array['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=70'], 4.4, false)
on conflict (slug) do nothing;

-- Map products to categories -------------------------------------------------
insert into product_categories (product_id, category_id)
select p.id, c.id from products p, categories c where
  (p.slug='whey-protein-isolate-1kg-cokelat' and c.slug='pemulihan-setelah-latihan') or
  (p.slug='mass-gainer-3kg-vanilla' and c.slug='tambah-berat-badan') or
  (p.slug='pre-workout-booster-mangga' and c.slug='sebelum-latihan') or
  (p.slug='creatine-monohydrate-300g' and c.slug='kekuatan-performa') or
  (p.slug='bcaa-211-jeruk-250g' and c.slug='pemulihan-setelah-latihan') or
  (p.slug='multivitamin-harian-60-tablet' and c.slug='vitamin-imun') or
  (p.slug='vitamin-c-1000mg-30-tablet' and c.slug='vitamin-imun') or
  (p.slug='madu-hutan-murni-500ml' and c.slug='herbal-alami') or
  (p.slug='omega-3-fish-oil-100-softgel' and c.slug='vitamin-imun') or
  (p.slug='kolagen-peptide-200g' and c.slug='herbal-alami') or
  (p.slug='teh-herbal-detox-30-sachet' and c.slug='herbal-alami') or
  (p.slug='glutamine-recovery-250g' and c.slug='pemulihan-setelah-latihan')
on conflict do nothing;

-- Blog posts -----------------------------------------------------------------
insert into blog_posts (title, slug, excerpt, cover, body, published_at) values
  ('5 Tips Memilih Suplemen Protein yang Tepat', '5-tips-memilih-suplemen-protein',
   'Bingung memilih protein? Simak panduan singkat berikut sebelum membeli.',
   'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=70',
   E'Memilih suplemen protein yang tepat sangat penting untuk mendukung tujuan kebugaran Anda.\n\nPerhatikan kandungan protein per sajian, sumber protein, serta kebutuhan kalori harian Anda. Untuk pemula, whey protein concentrate sudah cukup. Bagi yang sensitif laktosa, pilih whey isolate.', now() - interval '3 days'),
  ('Pentingnya Vitamin D untuk Imunitas', 'pentingnya-vitamin-d-untuk-imunitas',
   'Vitamin D bukan hanya untuk tulang. Pelajari perannya bagi daya tahan tubuh.',
   'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1200&q=70',
   E'Vitamin D berperan penting dalam menjaga sistem imun tubuh.\n\nPaparan sinar matahari pagi adalah sumber alami terbaik, namun suplemen dapat membantu memenuhi kebutuhan harian terutama bagi yang jarang beraktivitas di luar ruangan.', now() - interval '10 days'),
  ('Panduan Nutrisi Sebelum dan Sesudah Latihan', 'panduan-nutrisi-sebelum-sesudah-latihan',
   'Apa yang sebaiknya dikonsumsi sebelum dan sesudah berolahraga?',
   'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?auto=format&fit=crop&w=1200&q=70',
   E'Nutrisi yang tepat di sekitar waktu latihan dapat meningkatkan performa dan pemulihan.\n\nSebelum latihan, konsumsi karbohidrat kompleks dan sedikit protein. Setelah latihan, prioritaskan protein cepat serap dan karbohidrat untuk mengisi kembali glikogen.', now() - interval '20 days')
on conflict (slug) do nothing;
