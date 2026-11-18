import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mysql from 'mysql2/promise';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'pdskboqt';
const apiKey = process.env.CLOUDINARY_API_KEY || '523617844934853';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'XwKyALRc6VyY_BQODS9DkfDuQBE';
const dbUri = process.env.DATABASE_URL || 'mysql://root:12341234@127.0.0.1:3306/sekarsiti_colab';

// Helper generate signature Cloudinary
function generateSignature(params, secret) {
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys.map(k => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(serialized + secret).digest('hex');
}

// Upload file to Cloudinary via REST API
async function uploadFile(filePath, publicId, folder) {
  const timestamp = Math.floor(Date.now() / 1000);
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

  const paramsToSign = {
    folder,
    public_id: publicId,
    timestamp,
  };

  const signature = generateSignature(paramsToSign, apiSecret);

  const formData = new FormData();
  formData.append('file', base64Data);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);
  formData.append('public_id', publicId);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || JSON.stringify(json));
  }

  return {
    publicId: json.public_id,
    secureUrl: json.secure_url,
    format: json.format,
    width: json.width,
    height: json.height,
  };
}

async function run() {
  console.log(`=== MEMULAI UPLOAD FOTO MITRA KE CLOUDINARY (${cloudName}) ===\n`);

  const conn = await mysql.createConnection(dbUri);
  console.log('Terhubung ke database sekarsiti_colab.');

  const partners = [
    {
      slug: 'andi',
      brandName: 'ANDI_MC',
      dir: path.resolve(process.cwd(), 'public/assets/andi'),
      files: [
        { file: 'andi-1.jpg', slot: 'hero', id: 'andi_hero' },
        { file: 'andi-2.jpg', slot: 'about', id: 'andi_about' },
        { file: 'andi-3.jpg', slot: 'gallery_1', id: 'andi_gallery_1' },
        { file: 'andi-4.jpg', slot: 'gallery_2', id: 'andi_gallery_2' },
        { file: 'andi-5.jpg', slot: 'gallery_3', id: 'andi_gallery_3' },
      ],
    },
    {
      slug: 'revol',
      brandName: 'Revol Adli MC',
      dir: path.resolve(process.cwd(), 'public/assets/revol'),
      files: [
        { file: 'revol-3.jpg', slot: 'hero', id: 'revol_hero' },
        { file: 'revol-5.jpg', slot: 'about', id: 'revol_about' },
        { file: 'revol-1.jpg', slot: 'gallery_1', id: 'revol_gallery_1' },
        { file: 'revol-2.jpg', slot: 'gallery_2', id: 'revol_gallery_2' },
        { file: 'revol-4.jpg', slot: 'gallery_3', id: 'revol_gallery_3' },
      ],
    },
  ];

  for (const p of partners) {
    console.log(`\n--- Memproses Mitra: ${p.brandName} (${p.slug}) ---`);

    // Dapatkan partner ID dari database
    const [rows] = await conn.query('SELECT id FROM partners WHERE slug = ?', [p.slug]);
    if (!rows || rows.length === 0) {
      console.warn(`Mitra ${p.slug} tidak ditemukan di database. Lewati.`);
      continue;
    }
    const partnerId = rows[0].id;

    // Bersihkan media lama untuk mitra ini di DB
    await conn.query('DELETE FROM partner_media WHERE partner_id = ?', [partnerId]);

    let sortOrder = 1;
    for (const item of p.files) {
      const localPath = path.join(p.dir, item.file);
      if (!fs.existsSync(localPath)) {
        console.warn(`File ${localPath} tidak ditemukan.`);
        continue;
      }

      console.log(`Mengunggah ${item.file} -> Cloudinary [sekarsiti/${p.slug}/${item.id}]...`);
      try {
        const uploaded = await uploadFile(localPath, item.id, `sekarsiti/${p.slug}`);
        console.log(`  ✓ Sukses: ${uploaded.secureUrl}`);

        // Simpan URL Cloudinary ke tabel partner_media
        await conn.query(
          `INSERT INTO partner_media (partner_id, cloudinary_public_id, secure_url, format, slot_name, sort_order) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [partnerId, uploaded.publicId, uploaded.secureUrl, uploaded.format, item.slot, sortOrder]
        );
        sortOrder++;
      } catch (err) {
        console.error(`  ✗ Gagal upload ${item.file}:`, err.message);
      }
    }
  }

  // Tampilkan data media di database
  console.log('\n=== DATA MEDIA MITRA DI DATABASE MYSQL SEKARANG ===');
  const [mediaRows] = await conn.query(
    `SELECT m.id, p.slug, m.slot_name, m.cloudinary_public_id, m.secure_url 
     FROM partner_media m 
     JOIN partners p ON m.partner_id = p.id 
     ORDER BY p.id, m.sort_order`
  );
  console.table(mediaRows);

  await conn.end();
  console.log('\n>>> SELURUH FOTO BERHASIL DIUPLOAD KE CLOUDINARY & DISINKRONKAN KE DATABASE <<<');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

