import React, { useState, useEffect } from 'react';
import { compressImageToWebP, formatBytes, type CompressionResult } from '../lib/imageCompressor';
import {
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileImage,
  ArrowRight,
  ShieldCheck,
  Palette,
  Layers,
  HelpCircle,
  Lock,
  Copy,
  Check,
  ExternalLink,
  Share2,
} from 'lucide-react';

interface UploadedItem {
  id: string;
  slotName: string;
  result: CompressionResult;
}

export interface ServicePackage {
  name: string;
  price: string;
  description: string;
}

export default function OnboardingForm() {
  // Mode Desain
  const [designMode, setDesignMode] = useState<'custom_admin' | 'preset_template'>('custom_admin');
  const [selectedTemplate, setSelectedTemplate] = useState('mc_andi');
  
  // Data Form
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('MC / Pembawa Acara');
  const [cityCoverage, setCityCoverage] = useState('');
  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
  const [yearStarted, setYearStarted] = useState('');
  
  // Paket
  const [packages, setPackages] = useState<ServicePackage[]>([
    { name: 'Paket Lamaran', price: '300000', description: 'Memandu prosesi lamaran hangat & akrab' },
    { name: 'Paket Akad', price: '400000', description: 'Memandu prosesi akad nikah khidmat & tertib' },
    { name: 'Paket Wedding (Akad + Resepsi)', price: '700000', description: 'Memandu seluruh rangkaian pernikahan lebih hemat' },
  ]);

  // Kontak
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [youtubeVideo, setYoutubeVideo] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Media
  const [customPhotos, setCustomPhotos] = useState<UploadedItem[]>([]);
  const [slotPhotos, setSlotPhotos] = useState<Record<string, UploadedItem | null>>({
    hero: null,
    about: null,
    gallery_1: null,
    gallery_2: null,
    gallery_3: null,
  });

  // State
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const DRAFT_KEY = 'sekarsiti_mitra_onboarding_draft_v1';

  // 1. Muat draf yang tersimpan otomatis saat halaman pertama kali dibuka
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(DRAFT_KEY) : null;
      if (saved) {
        const d = JSON.parse(saved);
        if (d.name) setName(d.name);
        if (d.brandName) setBrandName(d.brandName);
        if (d.category) setCategory(d.category);
        if (d.cityCoverage) setCityCoverage(d.cityCoverage);
        if (d.bio) setBio(d.bio);
        if (d.tagline) setTagline(d.tagline);
        if (d.yearStarted) setYearStarted(d.yearStarted);
        if (d.whatsapp) setWhatsapp(d.whatsapp);
        if (d.instagram) setInstagram(d.instagram);
        if (d.tiktok) setTiktok(d.tiktok);
        if (d.youtubeVideo) setYoutubeVideo(d.youtubeVideo);
        if (d.email) setEmail(d.email);
        if (d.pin) setPin(d.pin);
        if (d.notes) setNotes(d.notes);
        if (d.packages && Array.isArray(d.packages) && d.packages.length > 0) {
          setPackages(d.packages);
        }
        if (d.designMode) setDesignMode(d.designMode);
        if (d.selectedTemplate) setSelectedTemplate(d.selectedTemplate);
        if (d.termsAccepted) setTermsAccepted(d.termsAccepted);
        
        if (d.name || d.brandName || d.whatsapp || d.bio) {
          setDraftRestored(true);
        }
      }
    } catch (e) {
      console.warn('Failed to load onboarding draft:', e);
    }
  }, []);

  // 2. Simpan draf otomatis setiap kali ada ketikan / input baru
  useEffect(() => {
    if (submitSuccess) return;
    if (!name && !brandName && !whatsapp && !bio && !tagline && !notes && !email && !pin) return;

    const draft = {
      name,
      brandName,
      category,
      cityCoverage,
      bio,
      tagline,
      yearStarted,
      whatsapp,
      instagram,
      tiktok,
      youtubeVideo,
      email,
      pin,
      notes,
      packages,
      designMode,
      selectedTemplate,
      termsAccepted,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('Failed to save onboarding draft:', e);
    }
  }, [
    name,
    brandName,
    category,
    cityCoverage,
    bio,
    tagline,
    yearStarted,
    whatsapp,
    instagram,
    tiktok,
    youtubeVideo,
    email,
    pin,
    notes,
    packages,
    designMode,
    selectedTemplate,
    termsAccepted,
    submitSuccess,
  ]);

  // 3. Peringatan sebelum tab tertutup jika sudah ada ketikan
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitSuccess && (name || whatsapp || brandName)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [name, whatsapp, brandName, submitSuccess]);

  // Fungsi mengosongkan draf jika mitra ingin mulai dari awal
  const handleClearDraft = () => {
    if (typeof window !== 'undefined' && confirm('Kosongkan semua data dan mulai pengisian baru dari awal?')) {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (e) {}
      setName('');
      setBrandName('');
      setCategory('MC / Pembawa Acara');
      setCityCoverage('');
      setBio('');
      setTagline('');
      setYearStarted('');
      setWhatsapp('');
      setInstagram('');
      setTiktok('');
      setYoutubeVideo('');
      setEmail('');
      setPin('');
      setNotes('');
      setTermsAccepted(false);
      setCustomPhotos([]);
      setSlotPhotos({ hero: null, about: null, gallery_1: null, gallery_2: null, gallery_3: null });
      setDraftRestored(false);
    }
  };

  // Helper convert File to base64 fallback
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handler Kompresi Opsi B (Multi-upload custom)
  const handleCustomPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setErrorMessage('');

    try {
      const newItems: UploadedItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        
        const result = await compressImageToWebP(file, 1600, 0.82);
        newItems.push({
          id: Math.random().toString(36).substring(7),
          slotName: `foto_${customPhotos.length + newItems.length + 1}`,
          result,
        });
      }
      setCustomPhotos((prev: UploadedItem[]) => [...prev, ...newItems]);
    } catch (err: any) {
      setErrorMessage('Terjadi kendala saat mengompresi foto: ' + (err?.message || err));
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  // Handler Kompresi Opsi A (Slot spesifik)
  const handleSlotPhotoUpload = async (slotKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setErrorMessage('');

    try {
      const result = await compressImageToWebP(file, 1600, 0.82);
      setSlotPhotos((prev: Record<string, UploadedItem | null>) => ({
        ...prev,
        [slotKey]: {
          id: Math.random().toString(36).substring(7),
          slotName: slotKey,
          result,
        },
      }));
    } catch (err: any) {
      setErrorMessage('Terjadi kendala kompresi: ' + (err?.message || err));
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  // Hapus foto
  const removeCustomPhoto = (id: string) => {
    setCustomPhotos((prev: UploadedItem[]) => prev.filter((item: UploadedItem) => item.id !== id));
  };

  const removeSlotPhoto = (slotKey: string) => {
    setSlotPhotos((prev: Record<string, UploadedItem | null>) => ({ ...prev, [slotKey]: null }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp) {
      setErrorMessage('Mohon lengkapi Nama Lengkap dan Nomor WhatsApp Anda.');
      return;
    }

    if (!pin || pin.trim().length < 6) {
      setErrorMessage('Mohon buat kata sandi portal mandiri minimal 6 karakter.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Mohon centang persetujuan penggunaan materi portofolio sebelum mengirim formulir.');
      return;
    }

    const totalUploaded =
      designMode === 'custom_admin'
        ? customPhotos.length
        : Object.values(slotPhotos).filter(Boolean).length;

    if (totalUploaded < 1) {
      setErrorMessage('Mohon unggah minimal 1 foto portofolio.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setUploadProgress('Menyiapkan foto terkompresi...');

    try {
      const itemsToUpload =
        designMode === 'custom_admin'
          ? customPhotos.map((p: UploadedItem, idx: number) => ({
              file: p.result.file,
              slot: p.slotName,
              sizeWebp: p.result.compressedSize,
              sortOrder: idx + 1,
            }))
          : (Object.entries(slotPhotos).filter(([_, val]) => val !== null) as [string, UploadedItem][]).map(
              ([slotKey, item], idx: number) => ({
                file: item.result.file,
                slot: slotKey,
                sizeWebp: item.result.compressedSize,
                sortOrder: idx + 1,
              })
            );

      const uploadedPhotos: Array<{
        slot: string;
        name: string;
        sizeWebp: number;
        cloudinaryUrl?: string;
        previewUrl?: string;
        sortOrder: number;
      }> = [];
      for (let i = 0; i < itemsToUpload.length; i++) {
        const item = itemsToUpload[i];
        setUploadProgress(`Mengunggah foto ${i + 1} dari ${itemsToUpload.length} ke Cloudinary CDN...`);

        try {
          const formData = new FormData();
          formData.append('file', item.file);
          formData.append('upload_preset', 'sekarsiti_mitra_preset');
          formData.append('folder', 'sekarsiti/mitra');

          const uploadRes = await fetch('https://api.cloudinary.com/v1_1/pdskboqt/image/upload', {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            const upData = await uploadRes.json();
            uploadedPhotos.push({
              slot: item.slot,
              name: item.file.name,
              sizeWebp: item.sizeWebp,
              cloudinaryUrl: upData.secure_url,
              sortOrder: item.sortOrder,
            });
          } else {
            const base64 = await fileToBase64(item.file);
            uploadedPhotos.push({
              slot: item.slot,
              name: item.file.name,
              sizeWebp: item.sizeWebp,
              previewUrl: base64,
              sortOrder: item.sortOrder,
            });
          }
        } catch (upErr) {
          console.warn('Direct upload error, falling back to base64:', upErr);
          const base64 = await fileToBase64(item.file);
          uploadedPhotos.push({
            slot: item.slot,
            name: item.file.name,
            sizeWebp: item.sizeWebp,
            previewUrl: base64,
            sortOrder: item.sortOrder,
          });
        }
      }

      setUploadProgress('Menyimpan data pendaftaran ke Cloudflare D1...');

      const payload = {
        name,
        brandName: brandName || name,
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
        pin,
        designMode,
        selectedTemplate: designMode === 'preset_template' ? selectedTemplate : 'custom_curated',
        packages,
        photos: uploadedPhotos,
        notes,
      };

      const res = await fetch('/api/submit-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Gagal mengirim formulir');
      }

      setSubmitSuccess(json);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (e) {}
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  if (submitSuccess) {
    const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
    const partnerPin = submitSuccess.pin || pin;
    const partnerSlug = submitSuccess.slug || '';
    const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mltr.my.id';
    const portalUrl = `${originUrl}/kelola`;
    const subdomainUrl = `https://${partnerSlug}.mltr.my.id`;
    const fallbackUrl = `${originUrl}/mitra/${partnerSlug}`;

    const waTemplateText =
      `Halo Kak ${name} (${brandName})! ✨\n\n` +
      `Materi profil & portofolio Anda telah berhasil diaktifkan pada ekosistem kemitraan Sekarsiti Wedding Studio.\n\n` +
      `🌐 *Tautan Landing Page Resmi:*\n` +
      `• Subdomain: ${subdomainUrl}\n` +
      `• Tautan Cadangan: ${fallbackUrl}\n\n` +
      `🔐 *Akses Portal Mandiri (Kelola Harga & Kontak):*\n` +
      `• Tautan: ${portalUrl}\n` +
      `• No. WhatsApp / Login: \`${whatsapp}\`\n` +
      `• Kata Sandi: \`${partnerPin}\`\n\n` +
      `_Di portal mandiri tersebut, Anda bisa memperbarui paket harga dan nomor WhatsApp kapan saja secara mandiri._\n\n` +
      `Terima kasih telah berkolaborasi dengan Sekarsiti Wedding Studio! 🤍`;

    const handleCopy = () => {
      if (typeof navigator !== 'undefined') {
        navigator.clipboard.writeText(waTemplateText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    };

    const handleSendWA = () => {
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waTemplateText)}`;
      window.open(waUrl, '_blank', 'noopener');
    };

    return (
      <div className="bg-white rounded-3xl border border-atelier-200 p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-sm space-y-6">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
            ✓ Materi Sukses Disimpan & Akun Dibuat
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Akun Portal Admin Mitra Telah Siap!
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-lg mx-auto leading-relaxed">
            Materi portofolio <strong>{brandName}</strong> ({name}) berhasil tersimpan dan foto terkompresi ke WebP. Anda dapat langsung membagikan akun ini ke mitra via WhatsApp atau membuka halaman admin mitra sekarang.
          </p>
        </div>

        {/* Kotak Akun Kredensial Mitra */}
        <div className="bg-stone-900 text-white rounded-2xl p-5 text-left space-y-3.5 shadow-md">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <span className="text-[11px] font-bold text-atelier-300 uppercase tracking-widest flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Detail Akun Akses Portal Mitra</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
              Status: Pending Review
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-stone-400 block text-[11px]">Tautan Portal Mandiri:</span>
              <a href="/kelola" target="_blank" className="text-atelier-300 font-mono hover:underline font-semibold flex items-center gap-1">
                <span>/kelola</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Identitas Masuk (Username):</span>
              <span className="font-mono font-bold text-white bg-stone-800 px-2 py-0.5 rounded inline-block mt-0.5">
                {whatsapp}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Kata Sandi Akses:</span>
              <span className="font-mono font-bold text-emerald-400 bg-stone-800 px-2 py-0.5 rounded inline-block mt-0.5 text-sm">
                {partnerPin}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Subdomain Mitra:</span>
              <a href={`https://${partnerSlug}.mltr.my.id`} target="_blank" className="text-emerald-300 font-mono hover:underline font-semibold flex items-center gap-1">
                <span>{partnerSlug}.mltr.my.id</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href={`/mitra/${partnerSlug}`} target="_blank" className="text-stone-400 text-[10px] font-mono hover:underline block mt-0.5">
                (atau /mitra/{partnerSlug})
              </a>
            </div>
          </div>
        </div>

        {/* Tombol Bagikan ke WhatsApp Mitra */}
        <div className="bg-atelier-50 border border-atelier-200 rounded-2xl p-4 text-left space-y-3">
          <div className="text-xs font-bold text-stone-800 flex items-center justify-between">
            <span>Bagikan Akses ke Mitra via WhatsApp:</span>
            <span className="text-[11px] text-stone-500 font-normal">Format pesan siap kirim</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleSendWA}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Kirim Langsung ke WA Mitra</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-4 rounded-xl border border-atelier-300 bg-white hover:bg-atelier-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-atelier-700" />
                  <span>Salin Teks Pesan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tombol Aksi Tambahan */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`/kelola/${partnerSlug}`}
            className="px-6 py-3 rounded-xl bg-atelier-800 text-white text-xs font-semibold hover:bg-atelier-900 transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Buka Halaman Admin Mitra</span>
          </a>
          <a
            href={`/mitra/${partnerSlug}`}
            target="_blank"
            className="px-6 py-3 rounded-xl border border-atelier-300 text-atelier-800 text-xs font-semibold hover:bg-atelier-100 transition flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Halaman Web</span>
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-3 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-medium transition"
          >
            + Input Mitra Lainnya
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
      {/* Sesi Draf Otomatis Aktif Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-4 py-3 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span><strong>Sesi Draf Tersimpan Aktif:</strong> Ketikan Anda tersimpan otomatis di HP/browser ini. Tidak akan hilang jika berpindah aplikasi atau tab tertutup.</span>
        </div>
        {(name || brandName || whatsapp) && (
          <button
            type="button"
            onClick={handleClearDraft}
            className="text-[11px] font-semibold text-stone-500 hover:text-rose-600 underline shrink-0 text-left sm:text-right"
          >
            Kosongkan Formulir
          </button>
        )}
      </div>

      {draftRestored && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Draf Anda Berhasil Dipulihkan!</strong> Data yang sempat Anda ketik sebelumnya telah dimuat kembali otomatis.</span>
          </div>
          <button
            type="button"
            onClick={() => setDraftRestored(false)}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bagian 1: Identitas & Brand */}
      <div className="bg-white rounded-3xl border border-atelier-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-atelier-100">
          <div className="w-8 h-8 rounded-full bg-atelier-100 text-atelier-800 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Identitas & Profil Usaha</h3>
            <p className="text-xs text-stone-500">Informasi dasar yang akan ditampilkan pada header landing page</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap / Profesional *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Andi Irawan"
              className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nama Brand / Panggung *
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Contoh: ANDI_MC"
              className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Jenis Vendor / Profesi *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none bg-white"
            >
              <option value="MC / Pembawa Acara">MC / Pembawa Acara</option>
              <option value="Wedding Organizer">Wedding Organizer (WO)</option>
              <option value="Fotografer & Videografer">Fotografer & Videografer</option>
              <option value="Dekorasi Pernikahan">Dekorasi Pernikahan</option>
              <option value="Make Up Artist (MUA)">Make Up Artist (MUA)</option>
              <option value="Entertainment & Band">Entertainment & Band</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Kota / Wilayah Layanan *
            </label>
            <input
              type="text"
              required
              value={cityCoverage}
              onChange={(e) => setCityCoverage(e.target.value)}
              placeholder="Contoh: Jabodetabek atau Cimahi & Bandung"
              className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Slogan / Ciri Khas Layanan (Tagline)
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Contoh: Membawa Acara Lebih Hidup, Hangat & Berkesan"
              className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Tahun Mulai Beroperasi (Opsional)
            </label>
            <input
              type="text"
              value={yearStarted}
              onChange={(e) => setYearStarted(e.target.value)}
              placeholder="Contoh: 2021"
              className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Deskripsi Singkat / Bio Profesional
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Ceritakan latar belakang pengalaman, gaya membawakan acara, dan suasana yang Anda hadirkan..."
            className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
          />
        </div>
      </div>

      {/* Bagian 2: Paket Layanan & Harga */}
      <div className="bg-white rounded-3xl border border-atelier-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-atelier-100">
          <div className="w-8 h-8 rounded-full bg-atelier-100 text-atelier-800 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Paket Layanan & Harga</h3>
            <p className="text-xs text-stone-500">Daftar paket yang dapat langsung dipilih klien</p>
          </div>
        </div>

        <div className="space-y-4">
          {packages.map((pkg, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-atelier-50/60 border border-atelier-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-atelier-800 uppercase tracking-wide">
                  Paket #{idx + 1}
                </span>
                {packages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPackages(packages.filter((_, i) => i !== idx))}
                    className="text-stone-400 hover:text-rose-600 text-xs"
                  >
                    Hapus
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nama Paket (misal: Paket Akad)"
                  value={pkg.name}
                  onChange={(e) => {
                    const next = [...packages];
                    next[idx].name = e.target.value;
                    setPackages(next);
                  }}
                  className="px-3 py-2 rounded-xl border border-atelier-200 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Harga (misal: 400000)"
                  value={pkg.price}
                  onChange={(e) => {
                    const next = [...packages];
                    next[idx].price = e.target.value;
                    setPackages(next);
                  }}
                  className="px-3 py-2 rounded-xl border border-atelier-200 text-xs bg-white outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Rincian / Keunggulan Paket"
                value={pkg.description}
                onChange={(e) => {
                  const next = [...packages];
                  next[idx].description = e.target.value;
                  setPackages(next);
                }}
                className="w-full px-3 py-2 rounded-xl border border-atelier-200 text-xs bg-white outline-none"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => setPackages([...packages, { name: '', price: '', description: '' }])}
            className="text-xs font-semibold text-atelier-800 hover:text-atelier-900 flex items-center gap-1.5 py-1"
          >
            <span>+ Tambah Paket Layanan</span>
          </button>
        </div>
      </div>

      {/* Bagian 3: Kontak & Sosmed */}
      <div className="bg-white rounded-3xl border border-atelier-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-atelier-100">
          <div className="w-8 h-8 rounded-full bg-atelier-100 text-atelier-800 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Kontak & Media Sosial</h3>
            <p className="text-xs text-stone-500">Tombol WhatsApp di landing page akan langsung mengarah ke nomor ini</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nomor WhatsApp Booking *
            </label>
            <input
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Contoh: 081294891838"
              className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Email Bisnis (Opsional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: nama@domain.com"
              className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Akun Instagram
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Contoh: @andiirwan.mc"
              className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              TikTok / Media Sosial Lain
            </label>
            <input
              type="text"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="Contoh: @andi_mc"
              className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Link YouTube / Video Showreel
            </label>
            <input
              type="text"
              value={youtubeVideo}
              onChange={(e) => setYoutubeVideo(e.target.value)}
              placeholder="Contoh: https://youtube.com/shorts/..."
              className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-atelier-100">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-atelier-700" />
            <span>Kata Sandi Portal Mandiri (Minimal 6 Karakter Huruf & Angka)</span>
          </label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Buat kata sandi akun (cth: SandiMitra2026)"
            required
            className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
          />
          <p className="text-[11px] text-stone-500 mt-1">
            Gunakan kata sandi ini bersama nomor WhatsApp untuk masuk ke portal mandiri (/kelola) guna memperbarui harga & kontak Anda sewaktu-waktu.
          </p>
        </div>
      </div>

      {/* Bagian 4: Mode Desain & Unggah Foto dengan Client-Side WebP Compression */}
      <div className="bg-white rounded-3xl border border-atelier-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-atelier-100">
          <div className="w-8 h-8 rounded-full bg-atelier-100 text-atelier-800 flex items-center justify-center font-bold text-xs">
            4
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Pilihan Desain & Unggah Foto</h3>
            <p className="text-xs text-stone-500">Pilih kemudahan yang paling nyaman untuk Anda</p>
          </div>
        </div>

        {/* 2 Pilihan Mode Desain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setDesignMode('custom_admin')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
              designMode === 'custom_admin'
                ? 'border-atelier-800 bg-atelier-50/70 shadow-xs'
                : 'border-atelier-200 hover:border-atelier-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                  Direkomendasikan (Mudah)
                </span>
                <Sparkles className="w-4 h-4 text-atelier-700" />
              </div>
              <h4 className="font-serif text-lg font-bold text-stone-900">Serahkan ke Tim Sekarsiti</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Anda cukup unggah foto terbaik dalam 1 area. Tim kami bersama AI Agent di VS Code yang akan memilihkan template terbaik dan menata posisinya.
              </p>
            </div>
            <div className="mt-4 text-[11px] font-bold text-atelier-800 flex items-center gap-1">
              <span>{designMode === 'custom_admin' ? '✓ Pilihan Aktif' : 'Pilih Opsi Ini'}</span>
            </div>
          </div>

          <div
            onClick={() => setDesignMode('preset_template')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
              designMode === 'preset_template'
                ? 'border-atelier-800 bg-atelier-50/70 shadow-xs'
                : 'border-atelier-200 hover:border-atelier-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                  Presisi Slot
                </span>
                <Layers className="w-4 h-4 text-stone-500" />
              </div>
              <h4 className="font-serif text-lg font-bold text-stone-900">Pilih Template Tertentu</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Pilih gaya template yang sudah ada dan unggah foto sesuai slot yang telah ditentukan (Foto Utama, Foto Profil, Galeri).
              </p>
            </div>
            <div className="mt-4 text-[11px] font-bold text-atelier-800 flex items-center gap-1">
              <span>{designMode === 'preset_template' ? '✓ Pilihan Aktif' : 'Pilih Opsi Ini'}</span>
            </div>
          </div>
        </div>

        {/* Info Engine Kompresi WebP */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <b>Fitur Kompresi WebP Otomatis Aktif:</b> Foto kamera HP Anda (5–15 MB) akan langsung dikompresi di browser Anda menjadi format WebP berkualitas tinggi (~200 KB). Upload super cepat dan hemat kuota internet Anda!
          </div>
        </div>

        {/* Area Upload: Mode Custom Admin (1 Field Multi-Upload) */}
        {designMode === 'custom_admin' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-atelier-300 rounded-3xl p-6 sm:p-8 text-center bg-atelier-50/40 hover:bg-atelier-50/80 transition relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleCustomPhotoUpload}
                disabled={isCompressing}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-atelier-100 text-atelier-800 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-stone-900">
                  {isCompressing ? 'Sedang Mengompresi Foto ke WebP...' : 'Pilih Foto Portofolio Terbaik (Bisa Pilih Banyak)'}
                </div>
                <p className="text-[11px] text-stone-500">
                  Pilih minimal 5 foto (Foto di panggung, foto formal, dan saat memandu acara). Format JPG, PNG, atau HEIC.
                </p>
              </div>
            </div>

            {/* List Foto Terkompresi */}
            {customPhotos.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-700">
                  Foto Terunggah & Siap Diproses ({customPhotos.length} Foto WebP):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {customPhotos.map((item) => (
                    <div key={item.id} className="relative rounded-xl overflow-hidden border border-atelier-200 group bg-stone-100">
                      <img
                        src={item.result.previewUrl}
                        alt="Preview"
                        className="w-full h-28 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomPhoto(item.id)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="p-1.5 bg-white text-[10px] text-stone-600">
                        <div className="truncate font-semibold">{item.result.file.name}</div>
                        <div className="text-emerald-700 font-bold">
                          {formatBytes(item.result.compressedSize)} (-{item.result.reductionPercentage}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Area Upload: Mode Preset Template (Slot Terarah) */}
        {designMode === 'preset_template' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Pilih Model Template Katalog:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate('mc_andi')}
                  className={`p-3 rounded-xl border text-left text-xs ${
                    selectedTemplate === 'mc_andi'
                      ? 'border-atelier-800 bg-atelier-50 font-bold'
                      : 'border-atelier-200 text-stone-600'
                  }`}
                >
                  Gaya MC Andi (Navy & Emas - 5 Foto)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTemplate('mc_revol')}
                  className={`p-3 rounded-xl border text-left text-xs ${
                    selectedTemplate === 'mc_revol'
                      ? 'border-atelier-800 bg-atelier-50 font-bold'
                      : 'border-atelier-200 text-stone-600'
                  }`}
                >
                  Gaya MC Revol (Maroon & Rose - 5 Foto)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'hero', label: '1. Foto Hero / Profil Utama (Tampak Depan Rapi)' },
                { key: 'about', label: '2. Foto Tentang / Aksi Memandu Acara' },
                { key: 'gallery_1', label: '3. Foto Galeri #1 (Bersama Pasangan Pengantin)' },
                { key: 'gallery_2', label: '4. Foto Galeri #2 (Suasana Akad / Resepsi)' },
                { key: 'gallery_3', label: '5. Foto Galeri #3 (Momen Acara / Panggung)' },
              ].map((slot) => {
                const item = slotPhotos[slot.key];
                return (
                  <div key={slot.key} className="p-3.5 rounded-xl border border-atelier-200 flex items-center justify-between gap-3 bg-atelier-50/30">
                    <div className="flex items-center gap-3">
                      {item ? (
                        <img
                          src={item.result.previewUrl}
                          alt="Slot"
                          className="w-12 h-12 rounded-lg object-cover border border-atelier-300"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-atelier-100 flex items-center justify-center text-atelier-700">
                          <FileImage className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-stone-800">{slot.label}</div>
                        <div className="text-[11px] text-stone-500">
                          {item
                            ? `Terkonversi ke WebP: ${formatBytes(item.result.compressedSize)} (-${item.result.reductionPercentage}%)`
                            : 'Belum ada foto yang dipilih'}
                        </div>
                      </div>
                    </div>

                    <div>
                      {item ? (
                        <button
                          type="button"
                          onClick={() => removeSlotPhoto(slot.key)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-semibold px-2 py-1"
                        >
                          Ganti
                        </button>
                      ) : (
                        <label className="px-3 py-1.5 rounded-lg bg-white border border-atelier-300 text-atelier-800 hover:bg-atelier-50 text-xs font-semibold cursor-pointer">
                          Pilih Foto
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSlotPhotoUpload(slot.key, e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bagian 5: Catatan Tambahan & Persetujuan Materi */}
      <div className="bg-white rounded-3xl border border-atelier-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-atelier-100">
          <div className="w-8 h-8 rounded-full bg-atelier-100 text-atelier-800 flex items-center justify-center font-bold text-xs">
            5
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Catatan & Persetujuan Materi</h3>
            <p className="text-xs text-stone-500">Informasi pelengkap atau pesan khusus untuk tim desain Sekarsiti</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Permintaan Khusus / Testimoni / Catatan Tambahan (Opsional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tuliskan jika ada testimoni klien yang ingin dicantumkan, preferensi warna khusus, sertifikasi, proyek yang ingin ditonjolkan, atau pesan lain untuk tim Sekarsiti..."
            className="w-full px-4 py-2.5 rounded-xl border border-atelier-200 text-xs focus:ring-2 focus:ring-atelier-400 outline-none"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-atelier-50/70 border border-atelier-200 cursor-pointer select-none transition hover:bg-atelier-100/50">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-atelier-300 text-atelier-800 focus:ring-atelier-500 cursor-pointer"
            />
            <span className="text-xs text-stone-700 leading-relaxed">
              <strong className="text-stone-900">Persetujuan Penggunaan Materi:</strong> Saya mengonfirmasi bahwa data profil, foto hasil pekerjaan/portofolio, dan nomor kontak yang saya kirimkan adalah benar milik saya/usaha saya, serta menyetujui penayangan materi tersebut pada landing page kemitraan Sekarsiti Wedding Studio.
            </span>
          </label>
        </div>
      </div>

      {/* Tombol Submit */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isCompressing}
          className="w-full py-4 rounded-2xl bg-atelier-800 hover:bg-atelier-900 disabled:bg-stone-400 text-white font-serif text-lg font-bold tracking-wide transition shadow-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 text-sm font-sans font-medium">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>{uploadProgress || 'Sedang Menyimpan Data...'}</span>
            </span>
          ) : (
            <>
              <span>Kirim Data Portofolio Saya</span>
              <ArrowRight className="w-5 h-5 text-atelier-300" />
            </>
          )}
        </button>
        <p className="text-[11px] text-center text-stone-500 mt-3">
          Dengan mengirimkan formulir ini, Anda menyetujui materi terpilih ditampilkan pada landing page portofolio kemitraan resmi Sekarsiti Wedding Studio.
        </p>
      </div>
    </form>
  );
}

