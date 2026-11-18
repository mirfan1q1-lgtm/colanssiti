import type { APIRoute } from 'astro';
import { getPartnerByIdentifier } from '../../../lib/partners';
import { verifyPassword, createSessionToken, createSessionCookieHeader } from '../../../lib/auth';
import { getCfEnv } from '../../../lib/cfEnv';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const env = getCfEnv();
    const body = await request.json();
    const identifier = String(body?.identifier || '').trim();
    const password = String(body?.password || '');

    if (!identifier || !password) {
      return new Response(
        JSON.stringify({ error: 'Identitas (Slug / No. WhatsApp) dan PIN/Password wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const partner = await getPartnerByIdentifier(identifier, env);
    if (!partner || !partner.passwordHash || !partner.authSalt) {
      // Artificial delay to prevent timing attacks / user enumeration
      await new Promise((r) => setTimeout(r, 200));
      return new Response(
        JSON.stringify({ error: 'Identitas atau PIN/Password tidak cocok.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isValid = verifyPassword(password, partner.passwordHash, partner.authSalt);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Identitas atau PIN/Password tidak cocok.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Auth berhasil -> generate signed token & cookie
    const sessionSecret = env?.SESSION_SECRET || process.env.SESSION_SECRET || 'a9a4b6250d08a2082f282245f78fb0b0ccc6de702b98128da4f8c18e7ee0eb5b';
    const token = createSessionToken(partner.slug, sessionSecret, partner.id);
    const cookieHeader = createSessionCookieHeader(token, new URL(request.url).protocol === 'https:');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Login berhasil!',
        slug: partner.slug,
        brandName: partner.brandName,
        redirectUrl: `/kelola/${partner.slug}`,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Terjadi kesalahan sistem.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

