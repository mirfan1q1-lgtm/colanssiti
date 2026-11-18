import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { partners, partnerPackages, partnerMedia } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../../lib/auth';
import { notifyNewPartnerSubmission } from '../../lib/bot';
import { getCfEnv } from '../../lib/cfEnv';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const env = getCfEnv();
    const d1Db = getDb(env);

    const data = await request.json();
    const {
      name,
      brandName,
      category,
      cityCoverage,
      tagline,
      bio,
      yearStarted,
      whatsapp,
      instagram,
      tiktok,
      youtubeVideo,
      email,
      password,
      pin,
      designMode,
      selectedTemplate,
      packages,
      photos,
      notes,
    } = data;

    // Each partner chooses a private password or 6-digit PIN; minimal 6 characters
    const plainPassword = String(password || pin || '').trim();
    if (!name || !whatsapp || plainPassword.length < 6) {
      return new Response(
        JSON.stringify({ success: false, message: 'Nama, WhatsApp, dan Kata Sandi/PIN (minimal 6 karakter) wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const authCredentials = hashPassword(plainPassword);

    // Generate clean slug
    let cleanSlug = (brandName || name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const effectiveBio = notes && notes.trim()
      ? (bio && bio.trim() ? `${bio.trim()}\n\n[Catatan Tambahan]: ${notes.trim()}` : `[Catatan]: ${notes.trim()}`)
      : (bio || '');

    const submissionRecord = {
      slug: cleanSlug,
      subdomain: cleanSlug,
      name,
      brandName: brandName || name,
      category,
      cityCoverage,
      tagline: tagline || '',
      bio: effectiveBio,
      yearStarted: yearStarted || '',
      phoneWhatsapp: whatsapp,
      instagram: instagram || '',
      tiktok: tiktok || '',
      youtubeVideoId: youtubeVideo || '',
      designMode: designMode || 'custom_admin',
      templateType: selectedTemplate || 'mc_5',
      maxPhotos: photos?.length || 5,
      themePalette: selectedTemplate === 'mc_revol' ? 'maroon-rose' : 'navy-gold',
      status: 'pending',
      passwordHash: authCredentials.hash,
      authSalt: authCredentials.salt,
      packages: packages || [],
      photos: photos || [],
      submittedAt: new Date().toISOString(),
    };

    // 1. Try insert into Cloudflare D1
    let insertedId: number | null = null;
    let totalPhotosSaved = 0;

    if (d1Db) {
      try {
        let finalSlug = submissionRecord.slug || `mitra-${Date.now().toString(36)}`;
        try {
          const existing = await d1Db.select({ id: partners.id }).from(partners).where(eq(partners.slug, finalSlug)).limit(1);
          if (existing && existing.length > 0) {
            finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
          }
        } catch (checkErr) {
          console.warn('Slug uniqueness check notice:', checkErr);
        }
        submissionRecord.slug = finalSlug;
        submissionRecord.subdomain = finalSlug;

        const rows = await d1Db.insert(partners).values({
          slug: submissionRecord.slug,
          subdomain: submissionRecord.subdomain,
          name: submissionRecord.name,
          brandName: submissionRecord.brandName,
          category: submissionRecord.category,
          cityCoverage: submissionRecord.cityCoverage,
          tagline: submissionRecord.tagline,
          bio: submissionRecord.bio,
          phoneWhatsapp: submissionRecord.phoneWhatsapp,
          instagram: submissionRecord.instagram,
          tiktok: submissionRecord.tiktok,
          youtubeVideoId: submissionRecord.youtubeVideoId,
          designMode: submissionRecord.designMode,
          templateType: submissionRecord.templateType,
          maxPhotos: submissionRecord.maxPhotos,
          themePalette: submissionRecord.themePalette,
          status: 'pending',
          passwordHash: authCredentials.hash,
          authSalt: authCredentials.salt,
        }).returning({ id: partners.id });

        if (rows && rows.length > 0) {
          insertedId = rows[0].id;
        }

        // Insert packages if any
        if (insertedId && packages && packages.length > 0) {
          for (const pkg of packages) {
            if (pkg.name && pkg.price) {
              await d1Db.insert(partnerPackages).values({
                partnerId: insertedId,
                name: pkg.name,
                price: pkg.price.toString(),
                description: pkg.description || '',
                isFeatured: false,
              });
            }
          }
        }

        // Process photos & Cloudinary storage
        if (insertedId && photos && photos.length > 0) {
          const cloudName = env?.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'pdskboqt';
          const preset = env?.PUBLIC_CLOUDINARY_PRESET || process.env.PUBLIC_CLOUDINARY_PRESET || 'sekarsiti_mitra_preset';

          for (let idx = 0; idx < photos.length; idx++) {
            const photo = photos[idx];
            let photoUrl = photo.cloudinaryUrl;

            // Fallback: If client sent base64 image data directly, upload to Cloudinary via unsigned preset
            if (!photoUrl && photo.previewUrl && photo.previewUrl.startsWith('data:image/')) {
              try {
                const form = new FormData();
                form.append('file', photo.previewUrl);
                form.append('upload_preset', preset);
                form.append('folder', 'sekarsiti/mitra');

                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                  method: 'POST',
                  body: form,
                });

                if (uploadRes.ok) {
                  const upData: any = await uploadRes.json();
                  photoUrl = upData.secure_url;
                }
              } catch (upErr) {
                console.warn('Server upload to Cloudinary failed:', upErr);
              }
            }

            // Save permanent Cloudinary URL to D1 partner_media
            if (photoUrl) {
              const publicId =
                photo.publicId ||
                photoUrl.split('/').pop()?.split('.')[0] ||
                `mitra_${insertedId}_${idx + 1}`;

              await d1Db.insert(partnerMedia).values({
                partnerId: insertedId,
                cloudinaryPublicId: publicId,
                secureUrl: photoUrl,
                format: 'webp',
                slotName: photo.slot || (idx === 0 ? 'hero' : idx === 1 ? 'about' : `gallery_${idx - 1}`),
                caption: photo.slot || photo.name || `Foto Portofolio ${idx + 1}`,
                sortOrder: photo.sortOrder || idx + 1,
                isPrimary: idx === 0,
              });
              totalPhotosSaved++;
            }
          }
        }
      } catch (dbErr) {
        console.warn('Cloudflare D1 insert notice:', dbErr);
      }
    }

    // 2. Trigger Telegram Bot Alert to Admin
    try {
      await notifyNewPartnerSubmission(
        {
          name: submissionRecord.name,
          brandName: submissionRecord.brandName,
          slug: submissionRecord.slug,
          category: submissionRecord.category,
          cityCoverage: submissionRecord.cityCoverage,
          phoneWhatsapp: submissionRecord.phoneWhatsapp,
          packageCount: (packages || []).length,
          photoCount: totalPhotosSaved || (photos || []).length,
          designMode: submissionRecord.designMode,
          notes: notes && notes.trim() ? notes.trim() : undefined,
        },
        env
      );
    } catch (botErr) {
      console.warn('[Telegram Bot Alert Notice]:', botErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pengajuan kemitraan berhasil dikirim!',
        slug: submissionRecord.slug,
        pin: plainPassword,
        totalPhotos: totalPhotosSaved,
        previewUrl: `/mitra/${submissionRecord.slug}`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Submit partner error:', err);
    return new Response(
      JSON.stringify({ success: false, message: err.message || 'Terjadi kesalahan sistem' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
