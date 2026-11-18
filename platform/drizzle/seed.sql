-- Seed initial partners (Andi & Revol) with Cloudinary URLs

-- 1. Andi Irawan
INSERT OR REPLACE INTO partners (
  id, slug, subdomain, name, brand_name, category, city_coverage, bio, tagline,
  phone_whatsapp, instagram, tiktok, youtube_video_id, design_mode, template_type,
  max_photos, theme_palette, status, password_hash, auth_salt
) VALUES (
  1,
  'andi',
  'andi',
  'Andi Irawan',
  'ANDI_MC',
  'MC / Pembawa Acara',
  'Jabodetabek',
  'Saya Andi Irawan seorang MC yang sering memandu acara Akad, Wedding, dan Engagement dengan pembawaan lebih hidup, hangat, dan berkesan.',
  'Membawa Acara Lebih Hidup, Hangat & Berkesan',
  '081294891838',
  'https://www.instagram.com/andiirwan.mc/',
  'https://www.tiktok.com/@andi_mc',
  'nUrASTJRyXM',
  'preset_template',
  'mc_5',
  5,
  'navy-gold',
  'active',
  'cdae23f50e3a016f3d447d6c6f96cd014560d759818620ee75aa75aa8c9971d5',
  '7db284fe4efdbd24f0d9fba3a3ab9b7a'
);

DELETE FROM partner_packages WHERE partner_id = 1;
INSERT INTO partner_packages (partner_id, name, price, description, is_featured) VALUES
  (1, 'Paket Lamaran', '300000', 'Memandu prosesi lamaran dengan pembawaan hangat & akrab.', 0),
  (1, 'Paket Akad', '400000', 'Memandu prosesi akad nikah dengan suasana khidmat & tertib.', 0),
  (1, 'Paket Wedding (Akad + Resepsi)', '700000', 'Memandu seluruh rangkaian akad dan resepsi lebih hemat.', 1);

DELETE FROM partner_media WHERE partner_id = 1;
INSERT INTO partner_media (partner_id, cloudinary_public_id, secure_url, format, slot_name, sort_order, is_primary) VALUES
  (1, 'pmbimvuyonxcfubcmwuz', 'https://res.cloudinary.com/pdskboqt/image/upload/v1793582532/pmbimvuyonxcfubcmwuz.jpg', 'jpg', 'hero', 1, 1),
  (1, 'ypmywwbrym0pqckgdtwf', 'https://res.cloudinary.com/pdskboqt/image/upload/v1793582533/ypmywwbrym0pqckgdtwf.jpg', 'jpg', 'about', 2, 0),
  (1, 'shxabuzvul948qpxd6iy', 'https://res.cloudinary.com/pdskboqt/image/upload/v1793582535/shxabuzvul948qpxd6iy.jpg', 'jpg', 'gallery_1', 3, 0),
  (1, 'wvjkaina1hpfptmcnjcl', 'https://res.cloudinary.com/pdskboqt/image/upload/v1793582537/wvjkaina1hpfptmcnjcl.jpg', 'jpg', 'gallery_2', 4, 0),
  (1, 'xpbdd7xas2lgpproo1lw', 'https://res.cloudinary.com/pdskboqt/image/upload/v1793582538/xpbdd7xas2lgpproo1lw.jpg', 'jpg', 'gallery_3', 5, 0);

-- 2. Revol Adli MC
INSERT OR REPLACE INTO partners (
  id, slug, subdomain, name, brand_name, category, city_coverage, bio, tagline,
  phone_whatsapp, instagram, tiktok, youtube_video_id, design_mode, template_type,
  max_photos, theme_palette, status, password_hash, auth_salt
) VALUES (
  2,
  'revol',
  'revol',
  'Revol Adli',
  'Revol Adli MC',
  'MC / Pembawa Acara',
  'Cimahi, Bandung, Kab. Bandung Barat',
  'MC yang dapat menyesuaikan tone warna acara, santai, cair, dan membuat momen pernikahan Anda tetap berkesan.',
  'Terlihat Biasa, Tapi Seru',
  '083149732880',
  'https://www.instagram.com/revol_adli/',
  '',
  '',
  'preset_template',
  'mc_5',
  5,
  'maroon-rose',
  'active',
  'cdae23f50e3a016f3d447d6c6f96cd014560d759818620ee75aa75aa8c9971d5',
  '7db284fe4efdbd24f0d9fba3a3ab9b7a'
);

DELETE FROM partner_packages WHERE partner_id = 2;
INSERT INTO partner_packages (partner_id, name, price, description, is_featured) VALUES
  (2, 'MC Lamaran', '500000', 'Memandu prosesi lamaran keluarga.', 0),
  (2, 'MC Wedding (8 Jam Kerja)', '1000000', 'Memandu seluruh rangkaian akad dan resepsi.', 1),
  (2, 'Paket MC + WO + WCC', '2400000', 'Paket lengkap all-in 1 MC, 3 crew WO, 1 WCC.', 0);

DELETE FROM partner_media WHERE partner_id = 2;
INSERT INTO partner_media (partner_id, cloudinary_public_id, secure_url, format, slot_name, sort_order, is_primary) VALUES
  (2, 'yvfrytr5fajmfe9qj76m', 'https://res.cloudinary.com/pdskboqt/image/upload/v1793582539/yvfrytr5fajmfe9qj76m.jpg', 'jpg', 'hero', 1, 1),
  (2, 'esvp1y82euyrbl2ku6tw', 'https://res.cloudinary.com/pdskboqt/image/upload/v1793582541/esvp1y82euyrbl2ku6tw.jpg', 'jpg', 'about', 2, 0),
  (2, 'ryoqimuufqdaokix9eex', 'https://res.cloudinary.com/pdskboqt/image/upload/v1793582542/ryoqimuufqdaokix9eex.jpg', 'jpg', 'gallery_1', 3, 0),
  (2, 'h5nvqrlg1ftdyxx07zfp', 'https://res.cloudinary.com/pdskboqt/image/upload/v1793582544/h5nvqrlg1ftdyxx07zfp.jpg', 'jpg', 'gallery_2', 4, 0),
  (2, 'p9gg5i1qkuqisl5u0nub', 'https://res.cloudinary.com/pdskboqt/image/upload/v1793582545/p9gg5i1qkuqisl5u0nub.jpg', 'jpg', 'gallery_3', 5, 0);
