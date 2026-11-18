import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. Partners Table
export const partners = sqliteTable('partners', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(), // e.g. 'andi', 'revol'
  subdomain: text('subdomain').unique(), // e.g. 'andi' -> andi.mltr.my.id
  name: text('name').notNull(),
  brandName: text('brand_name').notNull(),
  category: text('category').notNull(), // 'MC / Pembawa Acara', 'Wedding Organizer', 'Fotografer'
  cityCoverage: text('city_coverage').notNull(),
  bio: text('bio'),
  tagline: text('tagline'),
  phoneWhatsapp: text('phone_whatsapp').notNull(),
  instagram: text('instagram'),
  tiktok: text('tiktok'),
  youtubeVideoId: text('youtube_video_id'),
  designMode: text('design_mode').default('custom_admin'), // 'preset_template' | 'custom_admin'
  templateType: text('template_type').default('mc_5'), // 'mc_5' | 'vendor_8' | 'custom'
  maxPhotos: integer('max_photos').default(5),
  themePalette: text('theme_palette').default('navy-gold'), // 'navy-gold' | 'maroon-rose'
  status: text('status').default('active'), // 'pending' | 'active' | 'archived'
  passwordHash: text('password_hash'), // Scrypt password hash
  authSalt: text('auth_salt'), // Cryptographic salt
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 2. Packages Table
export const partnerPackages = sqliteTable('partner_packages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  partnerId: integer('partner_id').notNull(),
  name: text('name').notNull(), // 'Paket Lamaran', 'Paket Wedding'
  price: text('price').notNull(),
  description: text('description'),
  featuresJson: text('features_json'), // JSON array of string features
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
});

// 3. Media Assets Table
export const partnerMedia = sqliteTable('partner_media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  partnerId: integer('partner_id').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id').notNull(),
  secureUrl: text('secure_url').notNull(),
  format: text('format').default('webp'),
  slotName: text('slot_name'), // 'hero', 'about', 'gallery_1', etc.
  sortOrder: integer('sort_order').default(1),
  caption: text('caption'),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
});

export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;
export type PartnerPackage = typeof partnerPackages.$inferSelect;
export type PartnerMedia = typeof partnerMedia.$inferSelect;
