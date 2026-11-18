import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();
  const pathname = url.pathname;

  // 1. Tangani rute legacy index.html dan redirect ke rute bersih
  if (pathname === '/index.html' || pathname === '/index.html/') {
    return context.redirect('/', 301);
  }
  if (pathname === '/demo' || pathname === '/demo/' || pathname === '/demo/index.html' || pathname === '/demo/index.html/') {
    return context.redirect('/#templates', 301);
  }
  if (pathname === '/mitra/index.html' || pathname === '/mitra/index.html/') {
    return context.redirect('/mitra', 301);
  }

  // 2. Tangani rute langsung mitra
  if (pathname === '/revol' || pathname === '/revol/' || pathname === '/revol.html' || pathname === '/mitra/revol.html') {
    return context.rewrite('/mitra/revol');
  }
  if (pathname === '/andi' || pathname === '/andi/' || pathname === '/andi.html' || pathname === '/mitra/andi.html') {
    return context.rewrite('/mitra/andi');
  }

  // 3. Tangani demo dengan akhiran .html (contoh: /demo/fotografer.html -> /demo/fotografer)
  if (pathname.startsWith('/demo/') && pathname.endsWith('.html')) {
    const cleanDemoSlug = pathname.replace('/demo/', '').replace('.html', '').trim();
    return context.rewrite(`/demo/${cleanDemoSlug}`);
  }

  // 4. Biarkan lewat untuk apex domain, www, localhost, dan workers.dev
  if (
    hostname === 'mltr.my.id' ||
    hostname === 'www.mltr.my.id' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.workers.dev')
  ) {
    // Dukung akses langsung dengan nama file .html asli seperti pada demo sebelumnya
    const decodedPath = decodeURIComponent(url.pathname)
      .toLowerCase()
      .replace(/^\//, '')
      .replace(/[\u2013\u2014]/g, '-') // Normalisasi en-dash dan em-dash ke hyphen
      .replace(/\s+/g, ' ')
      .trim();

    const demoMap: Record<string, string> = {
      'dimas arkana - portofolio jasa fotografer.html': '/demo/fotografer',
      'dimas arkana – portofolio jasa fotografer.html': '/demo/fotografer',
      'landing-dekor-wedding.html': '/demo/dekorasi',
      'larana_wedding_organizer_landing_page.html': '/demo/wo',
      'raka mahendra - portofolio mc profesional.html': '/demo/mc',
      'raka mahendra – portofolio mc profesional.html': '/demo/mc',
      'portofolio_wedding_mc.html': '/demo/julian',
      'raka mahendra - mc profesional (versi bersih).html': '/demo/mc-clean',
      'raka mahendra – mc profesional (versi bersih).html': '/demo/mc-clean',
      'landing page fotografer - editorial.html': '/demo/fotografer-editorial',
      'landing page fotografer — editorial.html': '/demo/fotografer-editorial',
      'landing page fotografer - sinematik.html': '/demo/fotografer-sinematik',
      'landing page fotografer — sinematik.html': '/demo/fotografer-sinematik',
    };

    if (demoMap[decodedPath]) {
      return context.rewrite(demoMap[decodedPath]);
    }
    return next();
  }

  // 5. Tangani subdomain mitra (*.mltr.my.id, contoh: andi.mltr.my.id, revol.mltr.my.id)
  if (hostname.endsWith('.mltr.my.id')) {
    const subdomain = hostname.replace('.mltr.my.id', '').trim();

    // Biarkan static assets dan API lewat langsung
    if (
      url.pathname.startsWith('/_astro') ||
      url.pathname.startsWith('/assets') ||
      url.pathname.startsWith('/api') ||
      url.pathname === '/favicon.ico'
    ) {
      return next();
    }

    // Jika mengakses root subdomain (/), arahkan / render halaman landing page mitra tersebut
    if (url.pathname === '/' || url.pathname === '') {
      return context.rewrite(`/mitra/${subdomain}`);
    }
  }

  return next();
});
