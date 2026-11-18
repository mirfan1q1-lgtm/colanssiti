import React, { useState } from 'react';
import type { EnrichedPartner } from '../lib/partners';
import { 
  Save, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Phone, 
  Video, 
  Image as ImageIcon, 
  Tag, 
  AlertCircle,
  Sparkles,
  Lock,
  MessageCircle,
  ShieldCheck,
  MapPin,
  AtSign,
  FileText
} from 'lucide-react';

interface Props {
  partner: EnrichedPartner;
}

export default function PartnerSelfServiceEditor({ partner }: Props) {
  // 1. State data kontak & profil
  const [phoneWhatsapp, setPhoneWhatsapp] = useState(partner.phoneWhatsapp || '');
  const [tagline, setTagline] = useState(partner.tagline || '');
  const [bio, setBio] = useState(partner.bio || '');
  const [cityCoverage, setCityCoverage] = useState(partner.cityCoverage || '');
  const [instagram, setInstagram] = useState(partner.instagram || '');
  const [tiktok, setTiktok] = useState(partner.tiktok || '');
  const [youtubeVideoId, setYoutubeVideoId] = useState(partner.youtubeVideoId || '');
  const [newPin, setNewPin] = useState('');

  // 2. State paket layanan
  const [packages, setPackages] = useState(
    partner.packages && partner.packages.length > 0
      ? partner.packages
      : [{ name: 'Paket Reguler', price: 2500000, description: 'Layanan lengkap MC Pernikahan (Akad + Resepsi)', isFeatured: true }]
  );

  // 3. State foto aktif (Read-only tampilan kurasi)
  const maxPhotos = partner.maxPhotos || 5;
  const initialMedia = partner.media || [];
  
  const slotLabels = [
    { key: 'hero_portrait', label: 'Foto Utama (Hero Banner)' },
    { key: 'about_portrait', label: 'Foto Profil (Tentang Saya)' },
    { key: 'gallery_1', label: 'Galeri Portofolio 1' },
    { key: 'gallery_2', label: 'Galeri Portofolio 2' },
    { key: 'gallery_3', label: 'Galeri Portofolio 3' },
    { key: 'gallery_4', label: 'Galeri Portofolio 4' },
    { key: 'gallery_5', label: 'Galeri Portofolio 5' },
    { key: 'gallery_6', label: 'Galeri Portofolio 6' },
  ].slice(0, maxPhotos);

  const displaySlots = slotLabels.map((slot, index) => {
    const existing = initialMedia.find((m) => m.slotName === slot.key) || initialMedia[index];
    return {
      slotName: slot.key,
      label: slot.label,
      secureUrl: existing?.secureUrl || '',
    };
  });

  // State status penyimpanan
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handlers Paket
  const handleAddPackage = () => {
    setPackages([
      ...packages,
      { name: 'Paket Baru', price: 2000000, description: 'Deskripsi rincian fasilitas layanan...', isFeatured: false }
    ]);
  };

  const handleUpdatePackage = (index: number, field: string, value: any) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  const handleRemovePackage = (index: number) => {
    if (packages.length <= 1) {
      alert('Minimal harus ada 1 paket layanan.');
      return;
    }
    setPackages(packages.filter((_, i) => i !== index));
  };

  // Handler Simpan Perubahan (Data Teks Dinamis)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    const payload = {
      slug: partner.slug,
      phoneWhatsapp,
      tagline,
      bio,
      cityCoverage,
      instagram,
      tiktok,
      youtubeVideoId,
      packages,
      newPin: newPin.trim() ? newPin.trim() : undefined,
    };

    try {
      const res = await fetch('/api/update-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menyimpan data.');
      }

      setSaveSuccess(true);
      if (newPin.trim()) {
        setNewPin('');
      }
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-28">
      {/* Top Banner Alert */}
      {saveSuccess && (
        <div role="status" className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">Perubahan berhasil disimpan! Data profil Anda telah diperbarui.</span>
          </div>
          <a
            href={`/mitra/${partner.slug}`}
            target="_blank"
            rel="noopener"
            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1 transition shrink-0 shadow-xs"
          >
            <span>Buka Halaman</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Bagian 1: Paket & Harga Layanan */}
      <section className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5" />
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                Paket & Tarif Layanan
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Atur daftar paket, rincian fasilitas, dan harga yang tampil di landing page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddPackage}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Paket</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg, idx) => (
            <div key={idx} className="bg-stone-50/70 p-4 sm:p-5 rounded-xl border border-stone-200/80 space-y-3.5 relative group hover:border-stone-300 transition">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-200/50">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Paket #{idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-stone-600 flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-stone-200 hover:border-stone-300 transition">
                    <input
                      type="checkbox"
                      checked={Boolean(pkg.isFeatured)}
                      onChange={(e) => handleUpdatePackage(idx, 'isFeatured', e.target.checked)}
                      className="rounded text-stone-900 focus:ring-0"
                    />
                    <span className="font-medium">Populer / Rekomendasi</span>
                  </label>
                  {packages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePackage(idx)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                      title="Hapus Paket Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Paket</label>
                <input
                  type="text"
                  value={pkg.name}
                  onChange={(e) => handleUpdatePackage(idx, 'name', e.target.value)}
                  placeholder="Cth: Paket Akad & Resepsi"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none font-medium transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tarif / Harga (Rp)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-400 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={pkg.price}
                    onChange={(e) => handleUpdatePackage(idx, 'price', Number(e.target.value))}
                    placeholder="2500000"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none font-mono font-semibold text-stone-900 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Rincian Fasilitas</label>
                <textarea
                  rows={2}
                  value={pkg.description || ''}
                  onChange={(e) => handleUpdatePackage(idx, 'description', e.target.value)}
                  placeholder="Durasi acara, koordinasi rundown, konsultasi konsep..."
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none leading-relaxed transition"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bagian 2: Kontak Langsung (Direct Booking) */}
      <section className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
        <div className="pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Phone className="w-3.5 h-3.5" />
            </span>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
              Kontak Booking WhatsApp & Sosial Media
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Tombol booking di landing page Anda akan langsung terhubung ke nomor WhatsApp ini tanpa perantara.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              WhatsApp Booking (Wajib)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={phoneWhatsapp}
                onChange={(e) => setPhoneWhatsapp(e.target.value)}
                placeholder="081234567890"
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none font-mono font-medium transition"
                required
              />
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">Bisa format 08... atau 628...</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Instagram</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                <AtSign className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="username_instagram"
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none transition"
              />
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">Username tanpa tanda @</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">TikTok</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                <AtSign className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="username_tiktok"
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none transition"
              />
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">Username TikTok Anda</span>
          </div>
        </div>
      </section>

      {/* Bagian 3: Tagline, Bio & Video YouTube */}
      <section className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
        <div className="pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-800 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
              Profil, Headline & Video Showreel
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Informasi perkenalan diri dan cuplikan video performa untuk menarik calon pengantin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Headline / Tagline Promosi</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Cth: Suara Berkarakter untuk Momen Sakral & Pesta Meriah"
              className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Cakupan Wilayah / Kota Layanan</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={cityCoverage}
                onChange={(e) => setCityCoverage(e.target.value)}
                placeholder="Cth: Jabodetabek, Bandung & Sekitarnya"
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi Singkat / Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan pengalaman, gaya pembawaan acara, atau keunggulan layanan Anda..."
              className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none leading-relaxed transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ID Video YouTube Shorts / Video Showreel
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-mono bg-stone-100 px-3 py-2 rounded-lg border border-stone-200 shrink-0">
                youtube.com/shorts/
              </span>
              <input
                type="text"
                value={youtubeVideoId}
                onChange={(e) => setYoutubeVideoId(e.target.value)}
                placeholder="dQw4w9WgXcQ"
                className="flex-1 px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none font-mono transition"
              />
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">
              Masukkan ID video YouTube (karakter setelah youtube.com/shorts/ atau ?v=)
            </span>
          </div>
        </div>
      </section>

      {/* Bagian 4: Galeri Foto Aktif (Terkurasi) */}
      <section className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center">
                <ImageIcon className="w-3.5 h-3.5" />
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                Galeri Portofolio Aktif
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {maxPhotos} slot foto terpilih yang sedang tayang di halaman publik Anda.
            </p>
          </div>

          <a
            href={`https://wa.me/6281294891838?text=${encodeURIComponent(`Halo Admin Sekarsiti, saya ${partner.brandName} (${partner.slug}) ingin meminta update foto portofolio di landing page saya.`)}`}
            target="_blank"
            rel="noopener"
            className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-600 hover:text-emerald-700 text-stone-600 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto bg-white shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Request Ganti Foto via WhatsApp</span>
          </a>
        </div>

        {/* Grid Preview Foto */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {displaySlots.map((slot) => (
            <div key={slot.slotName} className="bg-stone-50 p-2 rounded-xl border border-stone-200/70 space-y-1.5">
              <span className="text-[10px] font-semibold text-stone-600 block truncate" title={slot.label}>
                {slot.label}
              </span>
              <div className="aspect-3/4 bg-stone-200 rounded-lg overflow-hidden border border-stone-200/80 relative">
                {slot.secureUrl ? (
                  <img
                    src={slot.secureUrl}
                    alt={slot.label}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-stone-400 text-center">
                    <ImageIcon className="w-5 h-5 stroke-1 mb-1" />
                    <span className="text-[9px]">Belum ada foto</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bagian 5: Keamanan Akun & Ganti Kata Sandi */}
      <section className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </span>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
              Keamanan Akun
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Kosongkan kolom ini jika Anda tidak ingin mengganti kata sandi login saat ini.
          </p>
        </div>

        <div className="max-w-md">
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Kata Sandi Baru (Minimal 6 Karakter Huruf & Angka)
          </label>
          <input
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Masukkan kata sandi baru jika ingin diubah"
            className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none font-mono transition"
          />
          <span className="text-[11px] text-stone-400 mt-1 block">
            Gunakan kombinasi karakter huruf dan angka yang aman.
          </span>
        </div>
      </section>

      {/* Floating Modern Save Toolbar */}
      <div className="fixed bottom-4 inset-x-4 max-w-4xl mx-auto z-40 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-stone-900 text-stone-100 font-serif font-bold flex items-center justify-center shrink-0 text-sm">
            {partner.brandName.charAt(0)}
          </div>
          <div className="truncate hidden sm:block">
            <span className="font-serif font-bold text-xs sm:text-sm text-stone-900 block truncate">
              {partner.brandName}
            </span>
            <span className="text-[11px] text-stone-400 block truncate">
              Klik Simpan untuk menerapkan pembaruan ke landing page
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`/mitra/${partner.slug}`}
            target="_blank"
            rel="noopener"
            className="px-3.5 py-2 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-700 hover:text-stone-900 text-xs font-semibold transition bg-white shadow-2xs"
          >
            Lihat Halaman
          </a>

          <button
            type="submit"
            disabled={isSaving}
            className="px-4 sm:px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait cursor-pointer"
          >
            {isSaving ? (
              <div className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Menyimpan...</span>
              </div>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
