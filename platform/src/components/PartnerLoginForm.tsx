import React, { useState } from 'react';
import { Lock, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle, Phone, Sparkles } from 'lucide-react';

interface Props {
  initialRedirect?: string;
}

export default function PartnerLoginForm({ initialRedirect }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Nomor WhatsApp atau Kata Sandi tidak cocok.');
      }

      // Berhasil -> redirect
      const requestedSlug = initialRedirect?.match(/^\/kelola\/([a-z0-9-]+)$/i)?.[1];
      const target = requestedSlug?.toLowerCase() === String(data.slug).toLowerCase()
        ? initialRedirect!
        : data.redirectUrl || `/kelola/${data.slug}`;

      window.location.href = target;
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {errorMessage && (
        <div role="alert" className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="partner-identifier" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Nomor WhatsApp / Slug
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              id="partner-identifier"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="081234567890 atau nama-slug"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50/60 hover:bg-stone-50 focus:bg-white border border-stone-200 rounded-xl focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none transition font-medium placeholder:text-stone-400 text-stone-900"
              aria-invalid={Boolean(errorMessage)}
              required
            />
          </div>
          <p className="text-[11px] text-stone-400 mt-1.5">
            Nomor WhatsApp terdaftar (contoh: 0812... atau 628...)
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="partner-password" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Kata Sandi / Password
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="partner-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi akun Anda"
              className="w-full pl-10 pr-11 py-2.5 text-sm bg-stone-50/60 hover:bg-stone-50 focus:bg-white border border-stone-200 rounded-xl focus:border-stone-800 focus:ring-1 focus:ring-stone-800 focus:outline-none transition font-medium placeholder:text-stone-400 text-stone-900"
              aria-invalid={Boolean(errorMessage)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              aria-pressed={showPassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-800"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-stone-400 mt-1.5">
            Karakter kata sandi akun mitra Anda.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white font-medium text-sm transition shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Memverifikasi...</span>
            </div>
          ) : (
            <>
              <span>Masuk ke Ruang Kerja</span>
              <ArrowRight className="w-4 h-4 text-stone-300" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-stone-100 text-center space-y-2">
        <div className="inline-flex items-center justify-center gap-1.5 text-xs text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sesi terenkripsi & aman</span>
        </div>
        <p className="text-xs text-stone-500">
          Belum terdaftar?{' '}
          <a href="/gabung" className="text-stone-900 font-semibold hover:underline underline-offset-2">
            Ajukan Kemitraan
          </a>
        </p>
      </div>
    </div>
  );
}

