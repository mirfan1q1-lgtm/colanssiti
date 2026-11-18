-- D1 Database Schema for Sekarsiti Platform

CREATE TABLE IF NOT EXISTS partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  subdomain TEXT UNIQUE,
  name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  category TEXT NOT NULL,
  city_coverage TEXT NOT NULL,
  bio TEXT,
  tagline TEXT,
  phone_whatsapp TEXT NOT NULL,
  instagram TEXT,
  tiktok TEXT,
  youtube_video_id TEXT,
  design_mode TEXT DEFAULT 'custom_admin',
  template_type TEXT DEFAULT 'mc_5',
  max_photos INTEGER DEFAULT 5,
  theme_palette TEXT DEFAULT 'navy-gold',
  status TEXT DEFAULT 'active',
  password_hash TEXT,
  auth_salt TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS partner_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  features_json TEXT,
  is_featured INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS partner_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id INTEGER NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  secure_url TEXT NOT NULL,
  format TEXT DEFAULT 'webp',
  slot_name TEXT,
  sort_order INTEGER DEFAULT 1,
  caption TEXT,
  is_primary INTEGER DEFAULT 0
);
