import { getDb } from '../db';
import { partners, partnerPackages, partnerMedia } from '../db/schema';
import { initialSeedPartners } from '../db/seed';
import { eq } from 'drizzle-orm';
import { hashPassword } from './auth';

export interface EnrichedPartner {
  id?: number;
  slug: string;
  subdomain?: string;
  name: string;
  brandName: string;
  category: string;
  cityCoverage: string;
  bio?: string;
  tagline?: string;
  phoneWhatsapp: string;
  instagram?: string;
  tiktok?: string;
  youtubeVideoId?: string;
  designMode?: string;
  templateType: string;
  maxPhotos: number;
  themePalette: string;
  status: string;
  passwordHash?: string;
  authSalt?: string;
  packages: Array<{
    name: string;
    price: string | number;
    description?: string;
    isFeatured?: boolean;
  }>;
  media: Array<{
    slotName?: string;
    secureUrl: string;
    isPrimary?: boolean;
    caption?: string;
  }>;
}

export async function getAllPartners(env?: any): Promise<EnrichedPartner[]> {
  const combined: Map<string, EnrichedPartner> = new Map();

  // 1. Load initial seed partners (Andi & Revol with Cloudinary CDN URLs)
  for (const p of initialSeedPartners) {
    combined.set(p.slug, {
      ...(p as unknown as EnrichedPartner),
    });
  }

  // 2. Load from Cloudflare D1 database if connected
  const d1Db = getDb(env);
  if (d1Db) {
    try {
      const dbPartners = await d1Db.select().from(partners).where(eq(partners.status, 'active'));
      for (const p of dbPartners) {
        const pkgs = await d1Db.select().from(partnerPackages).where(eq(partnerPackages.partnerId, p.id));
        const medias = await d1Db.select().from(partnerMedia).where(eq(partnerMedia.partnerId, p.id));

        combined.set(p.slug, {
          id: p.id,
          slug: p.slug,
          subdomain: p.subdomain || p.slug,
          name: p.name,
          brandName: p.brandName,
          category: p.category,
          cityCoverage: p.cityCoverage,
          bio: p.bio || '',
          tagline: p.tagline || '',
          phoneWhatsapp: p.phoneWhatsapp,
          instagram: p.instagram || '',
          tiktok: p.tiktok || '',
          youtubeVideoId: p.youtubeVideoId || '',
          designMode: p.designMode || 'custom_admin',
          templateType: p.templateType || 'mc_5',
          maxPhotos: p.maxPhotos || 5,
          themePalette: p.themePalette || 'navy-gold',
          status: p.status || 'active',
          passwordHash: p.passwordHash || undefined,
          authSalt: p.authSalt || undefined,
          packages: pkgs.map((k) => ({
            name: k.name,
            price: k.price,
            description: k.description || '',
            isFeatured: Boolean(k.isFeatured),
          })),
          media: medias.map((m) => ({
            slotName: m.slotName || '',
            secureUrl: m.secureUrl,
            isPrimary: Boolean(m.isPrimary),
            caption: m.caption || '',
          })),
        });
      }
    } catch (err) {
      console.warn('Cloudflare D1 read notice:', err);
    }
  }

  return Array.from(combined.values());
}

export async function getPartnerBySlug(slug: string, env?: any): Promise<EnrichedPartner | null> {
  const all = await getAllPartners(env);
  const clean = slug.toLowerCase().trim();
  const found = all.find((p) => p.slug === clean || p.subdomain === clean);
  return found || null;
}

export async function getPartnerByIdentifier(identifier: string, env?: any): Promise<EnrichedPartner | null> {
  const all = await getAllPartners(env);
  const raw = identifier.toLowerCase().trim();
  const cleanAlnum = raw.replace(/[^a-z0-9]/g, '');
  const cleanPhone = cleanAlnum.replace(/^62/, '0');
  
  const found = all.find((p) => {
    const slugClean = p.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const pPhoneRaw = (p.phoneWhatsapp || '').replace(/[^0-9]/g, '');
    const pPhoneNorm = pPhoneRaw.replace(/^62/, '0');

    // Cocokkan slug atau nomor WA (baik format 08... maupun 62...)
    return (
      (slugClean.length > 0 && slugClean === cleanAlnum) ||
      (pPhoneNorm.length > 0 && (pPhoneNorm === cleanAlnum || pPhoneNorm === cleanPhone))
    );
  });

  return found || null;
}
