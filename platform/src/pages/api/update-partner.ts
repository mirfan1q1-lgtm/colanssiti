import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { partners, partnerPackages, partnerMedia } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { getPartnerBySlug } from '../../lib/partners';
import { getSessionFromRequest, hashPassword } from '../../lib/auth';
import { getCfEnv } from '../../lib/cfEnv';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const env = getCfEnv();
    const d1Db = getDb(env);

    // 1. Verifikasi Auth Session dari Cookie
    const session = getSessionFromRequest(request, env?.SESSION_SECRET || process.env.SESSION_SECRET || '');

    const body = await request.json();
    const { 
      slug, 
      phoneWhatsapp, 
      tagline, 
      bio, 
      cityCoverage, 
      instagram, 
      tiktok, 
      youtubeVideoId, 
      packages, 
      media,
      newPin,
    } = body;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug mitra wajib disertakan.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pastikan session aktif dan slug sesi cocok dengan slug target
    if (!session || session.slug !== slug) {
      return new Response(
        JSON.stringify({ error: 'Akses ditolak. Sesi login Anda telah berakhir atau tidak berwenang.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const currentPartner = await getPartnerBySlug(slug, env);
    if (!currentPartner) {
      return new Response(JSON.stringify({ error: 'Data mitra tidak ditemukan.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!d1Db || !currentPartner.id) {
      return new Response(JSON.stringify({ error: 'Penyimpanan portal belum tersedia. Perubahan belum disimpan; hubungi pengelola.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updatedData: any = {
      ...currentPartner,
      phoneWhatsapp: phoneWhatsapp ?? currentPartner.phoneWhatsapp,
      tagline: tagline ?? currentPartner.tagline,
      bio: bio ?? currentPartner.bio,
      cityCoverage: cityCoverage ?? currentPartner.cityCoverage,
      instagram: instagram ?? currentPartner.instagram,
      tiktok: tiktok ?? currentPartner.tiktok,
      youtubeVideoId: youtubeVideoId ?? currentPartner.youtubeVideoId,
      packages: packages ?? currentPartner.packages ?? [],
      media: (media && media.length > 0) ? media : (currentPartner.media || []),
      updatedAt: new Date().toISOString(),
    };

    if (newPin && String(newPin).trim().length >= 6) {
      const hashed = hashPassword(String(newPin).trim());
      updatedData.passwordHash = hashed.hash;
      updatedData.authSalt = hashed.salt;
    }

    // 2. Sinkronkan ke Cloudflare D1
    if (d1Db) {
      try {
        const updatePayload: Record<string, any> = {
          phoneWhatsapp: updatedData.phoneWhatsapp,
          tagline: updatedData.tagline,
          bio: updatedData.bio,
          cityCoverage: updatedData.cityCoverage,
          instagram: updatedData.instagram,
          tiktok: updatedData.tiktok,
          youtubeVideoId: updatedData.youtubeVideoId,
        };

        if (updatedData.passwordHash && updatedData.authSalt) {
          updatePayload.passwordHash = updatedData.passwordHash;
          updatePayload.authSalt = updatedData.authSalt;
        }

        await d1Db.update(partners).set(updatePayload).where(eq(partners.slug, slug));

        // Update paket jika diberikan
        if (packages && currentPartner.id) {
          await d1Db.delete(partnerPackages).where(eq(partnerPackages.partnerId, currentPartner.id));
          for (const pkg of packages) {
            await d1Db.insert(partnerPackages).values({
              partnerId: currentPartner.id,
              name: pkg.name,
              price: String(pkg.price),
              description: pkg.description || '',
              isFeatured: Boolean(pkg.isFeatured),
            });
          }
        }
      } catch (dbErr) {
        console.error('Cloudflare D1 update failed:', dbErr);
        return new Response(JSON.stringify({ error: 'Data gagal disimpan. Coba lagi beberapa saat.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data profil Anda berhasil diperbarui!',
        data: updatedData,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Terjadi kesalahan sistem.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
